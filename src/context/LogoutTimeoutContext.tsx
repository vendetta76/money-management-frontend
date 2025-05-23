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
            await updateDoc(userDocRef, { logoutTimeout: timeout });
          } else {
            // Document will be created in AuthContext
          }
        } catch (err) {
          // Handle permission errors gracefully - continue with localStorage only
        }
      }
    } catch (error) {
      // Handle errors gracefully without logging
    } finally {
      setIsLoading(false);
    }
  };

  // Load timeout dari Firestore ketika user berubah
  useEffect(() => {
    if (!user) {
      return;
    }

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
            setLogoutTimeoutState(timeout);
            localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
          }
        }
        
        // Setup listener for real-time updates with better error handling
        unsubscribe = onSnapshot(
          userDocRef, 
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.logoutTimeout !== undefined) {
                const timeout = data.logoutTimeout;
                setLogoutTimeoutState(timeout);
                localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
              }
            }
          }, 
          (error) => {
            // Handle permission errors gracefully - use localStorage
            const savedTimeout = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedTimeout) {
              setLogoutTimeoutState(parseInt(savedTimeout, 10));
            }
          }
        );
        
      } catch (error) {
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
      unsubscribe();
    };
  }, [user]);

  // Sync dengan localStorage jika diubah di tab lain
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue !== null) {
        const newTimeout = parseInt(e.newValue, 10);
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