import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { doc, updateDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { useAuth } from './AuthContext';

interface LogoutTimeoutContextType {
  logoutTimeout: number;
  setLogoutTimeout: (timeout: number) => Promise<void>;
  isLoading: boolean;
}

const LogoutTimeoutContext = createContext<LogoutTimeoutContextType>({
  logoutTimeout: 0,
  setLogoutTimeout: async () => {},
  isLoading: false,
});

const LOCAL_STORAGE_KEY = 'logoutTimeout';

export const LogoutTimeoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [logoutTimeout, setLogoutTimeoutState] = useState<number>(() => {
    try {
      const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY);
      return savedTimeout ? parseInt(savedTimeout, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // FIXED: Proper debounce management to prevent memory leaks
  const firestoreUpdateTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Update localStorage safely
  const updateLocalStorage = useCallback((timeout: number) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
    } catch (error) {
      // Handle localStorage errors (quota exceeded, private mode, etc.)
      console.warn('Failed to update localStorage:', error);
    }
  }, []);

  // Update Firestore safely with proper error handling
  const updateFirestore = useCallback(async (timeout: number): Promise<boolean> => {
    if (!user || !isMountedRef.current) return false;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Try to update directly first (more efficient)
      await updateDoc(userDocRef, { logoutTimeout: timeout });
      return true;
    } catch (error: any) {
      // If document doesn't exist, that's handled in AuthContext
      // Just log and return false for other errors
      if (error?.code !== 'not-found') {
        console.warn('Failed to update Firestore:', error);
      }
      return false;
    }
  }, [user]);

  // FIXED: Properly managed debounced Firestore updates
  const debouncedFirestoreUpdate = useCallback((timeout: number) => {
    // Clear any pending update
    if (firestoreUpdateTimeoutRef.current) {
      clearTimeout(firestoreUpdateTimeoutRef.current);
      firestoreUpdateTimeoutRef.current = null;
    }
    
    // Schedule new update if component is still mounted
    if (isMountedRef.current) {
      firestoreUpdateTimeoutRef.current = window.setTimeout(async () => {
        if (isMountedRef.current) {
          await updateFirestore(timeout);
          if (isMountedRef.current) {
            firestoreUpdateTimeoutRef.current = null;
          }
        }
      }, 500);
    }
  }, [updateFirestore]);

  // Main function to set logout timeout
  const setLogoutTimeout = useCallback(async (timeout: number): Promise<void> => {
    // Validate timeout value
    if (typeof timeout !== 'number' || timeout < 0) {
      throw new Error('Invalid timeout value: must be a non-negative number');
    }
    
    setIsLoading(true);
    
    try {
      // Update local state immediately for responsive UI
      setLogoutTimeoutState(timeout);
      
      // Update localStorage immediately
      updateLocalStorage(timeout);
      
      // Debounce Firestore updates to prevent rapid calls
      debouncedFirestoreUpdate(timeout);
      
    } catch (error) {
      console.warn('Error setting logout timeout:', error);
      // Don't throw - localStorage update should be sufficient
    } finally {
      setIsLoading(false);
    }
  }, [updateLocalStorage, debouncedFirestoreUpdate]);

  // Load timeout from Firestore when user changes
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    let unsubscribe: Unsubscribe | null = null;
    let isMounted = true;

    const setupFirestoreSync = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Get initial value
        const docSnap = await getDoc(userDocRef);
        
        if (isMounted && docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.logoutTimeout === 'number') {
            const firestoreTimeout = data.logoutTimeout;
            setLogoutTimeoutState(firestoreTimeout);
            updateLocalStorage(firestoreTimeout);
          }
        }
        
        // Setup real-time listener
        unsubscribe = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (!isMounted) return;
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (typeof data.logoutTimeout === 'number') {
                const firestoreTimeout = data.logoutTimeout;
                setLogoutTimeoutState(firestoreTimeout);
                updateLocalStorage(firestoreTimeout);
              }
            }
          },
          (error) => {
            console.warn('Firestore listener error:', error);
            // Fallback to localStorage on error
            try {
              const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (savedTimeout && isMounted) {
                const parsedTimeout = parseInt(savedTimeout, 10);
                if (!isNaN(parsedTimeout)) {
                  setLogoutTimeoutState(parsedTimeout);
                }
              }
            } catch {
              // Ignore localStorage errors
            }
          }
        );
        
      } catch (error) {
        console.warn('Failed to setup Firestore sync:', error);
        // Fallback to localStorage
        try {
          const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedTimeout && isMounted) {
            const parsedTimeout = parseInt(savedTimeout, 10);
            if (!isNaN(parsedTimeout)) {
              setLogoutTimeoutState(parsedTimeout);
            }
          }
        } catch {
          // Ignore localStorage errors
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setupFirestoreSync();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, updateLocalStorage]);

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue !== null && e.newValue !== e.oldValue) {
        try {
          const newTimeout = parseInt(e.newValue, 10);
          if (!isNaN(newTimeout) && newTimeout >= 0) {
            setLogoutTimeoutState(newTimeout);
          }
        } catch {
          // Ignore parsing errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // FIXED: Proper cleanup on unmount to prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Clean up debounce timeout to prevent memory leaks
      if (firestoreUpdateTimeoutRef.current) {
        clearTimeout(firestoreUpdateTimeoutRef.current);
        firestoreUpdateTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <LogoutTimeoutContext.Provider value={{ logoutTimeout, setLogoutTimeout, isLoading }}>
      {children}
    </LogoutTimeoutContext.Provider>
  );
};

export const useLogoutTimeout = () => useContext(LogoutTimeoutContext);