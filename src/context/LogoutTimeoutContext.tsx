import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
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
    const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedTimeout ? parseInt(savedTimeout, 10) : 0;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fungsi untuk menyimpan timeout ke Firestore dan localStorage
  const setLogoutTimeout = async (timeout: number): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log("LogoutTimeoutContext: Saving timeout value:", timeout);
      
      // Simpan ke localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
      setLogoutTimeoutState(timeout);
      
      // Simpan ke Firestore jika user login
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        try {
          // Periksa dulu apakah dokumen ada
          const docSnap = await getDoc(userDocRef);
          
          if (docSnap.exists()) {
            console.log("LogoutTimeoutContext: User document exists, updating...");
            await updateDoc(userDocRef, { logoutTimeout: timeout });
            console.log("LogoutTimeoutContext: Successfully saved to Firestore");
          } else {
            console.error("LogoutTimeoutContext: User document does not exist");
            // Instead of throwing an error, log it and continue
            console.log("LogoutTimeoutContext: User document will be created in AuthContext");
          }
        } catch (err) {
          // Handle permission errors gracefully
          console.error("LogoutTimeoutContext: Firestore error:", err);
          // Continue with localStorage only
          console.log("LogoutTimeoutContext: Continuing with localStorage only");
        }
      } else {
        console.log("LogoutTimeoutContext: No user logged in, saving only to localStorage");
      }
    } catch (error) {
      console.error('LogoutTimeoutContext: Error saving logout timeout:', error);
      // Don't rethrow - handle gracefully
    } finally {
      setIsLoading(false);
    }
  };

  // Load timeout dari Firestore ketika user berubah
  useEffect(() => {
    if (!user) {
      console.log("LogoutTimeoutContext: No user logged in");
      return;
    }

    console.log("LogoutTimeoutContext: User logged in, loading timeout from Firestore");
    setIsLoading(true);
    
    let unsubscribe = () => {};
    
    // Use a more defensive approach
    const loadTimeout = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Gunakan getDoc untuk mendapatkan nilai awal
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.logoutTimeout !== undefined) {
            const timeout = data.logoutTimeout;
            console.log("LogoutTimeoutContext: Initial timeout value from Firestore:", timeout);
            setLogoutTimeoutState(timeout);
            localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
          } else {
            console.log("LogoutTimeoutContext: No logoutTimeout field in user document");
          }
        } else {
          console.log("LogoutTimeoutContext: User document does not exist");
        }
        
        // Setup listener for real-time updates with better error handling
        unsubscribe = onSnapshot(
          userDocRef, 
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.logoutTimeout !== undefined) {
                const timeout = data.logoutTimeout;
                console.log("LogoutTimeoutContext: Real-time update from Firestore:", timeout);
                setLogoutTimeoutState(timeout);
                localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
              }
            }
          }, 
          (error) => {
            // Handle permission errors gracefully
            console.error('LogoutTimeoutContext: Error in real-time listener:', error);
            // If we get a permission error, still use localStorage
            console.log('LogoutTimeoutContext: Using localStorage value instead');
            const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedTimeout) {
              setLogoutTimeoutState(parseInt(savedTimeout, 10));
            }
          }
        );
        
      } catch (error) {
        console.error("LogoutTimeoutContext: Error loading initial timeout:", error);
        // Fall back to localStorage
        const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedTimeout) {
          setLogoutTimeoutState(parseInt(savedTimeout, 10));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTimeout();

    return () => {
      console.log("LogoutTimeoutContext: Cleanup listener");
      unsubscribe();
    };
  }, [user]);

  // Sync dengan localStorage jika diubah di tab lain
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue !== null) {
        const newTimeout = parseInt(e.newValue, 10);
        console.log("LogoutTimeoutContext: localStorage updated in another tab:", newTimeout);
        setLogoutTimeoutState(newTimeout);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <LogoutTimeoutContext.Provider value={{ logoutTimeout, setLogoutTimeout, isLoading }}>
      {children}
    </LogoutTimeoutContext.Provider>
  );
};

export const useLogoutTimeout = () => useContext(LogoutTimeoutContext);