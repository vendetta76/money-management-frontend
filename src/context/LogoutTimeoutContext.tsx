import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { useAuth } from './AuthContext';

interface LogoutTimeoutContextType {
  logoutTimeout: number;
  setLogoutTimeout: (timeout: number) => void;
  isLoading: boolean;
}

const LogoutTimeoutContext = createContext<LogoutTimeoutContextType>({
  logoutTimeout: 0,
  setLogoutTimeout: () => {},
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
  const setLogoutTimeout = async (timeout: number) => {
    setIsLoading(true);
    
    try {
      // Simpan ke localStorage
      localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
      setLogoutTimeoutState(timeout);
      
      // Simpan ke Firestore jika user login
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          logoutTimeout: timeout,
        });
      }
    } catch (error) {
      console.error('Error saving logout timeout:', error);
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
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logoutTimeout !== undefined) {
          const timeout = data.logoutTimeout;
          setLogoutTimeoutState(timeout);
          localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading logout timeout:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync dengan localStorage jika diubah di tab lain
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue !== null) {
        setLogoutTimeoutState(parseInt(e.newValue, 10));
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