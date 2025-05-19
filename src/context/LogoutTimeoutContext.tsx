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
        
        // Periksa dulu apakah dokumen ada
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          console.log("LogoutTimeoutContext: User document exists, updating...");
          await updateDoc(userDocRef, { logoutTimeout: timeout });
          console.log("LogoutTimeoutContext: Successfully saved to Firestore");
        } else {
          console.error("LogoutTimeoutContext: User document does not exist");
          throw new Error("User document does not exist");
        }
      } else {
        console.log("LogoutTimeoutContext: No user logged in, saving only to localStorage");
      }
    } catch (error) {
      console.error('LogoutTimeoutContext: Error saving logout timeout:', error);
      throw error; // Re-throw untuk handling di UI
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
    const userDocRef = doc(db, 'users', user.uid);
    
    // Gunakan getDoc untuk mendapatkan nilai awal
    getDoc(userDocRef).then((docSnap) => {
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
      setIsLoading(false);
    }).catch((error) => {
      console.error("LogoutTimeoutContext: Error loading initial timeout:", error);
      setIsLoading(false);
    });
    
    // Setup listener for real-time updates
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.logoutTimeout !== undefined) {
          const timeout = data.logoutTimeout;
          console.log("LogoutTimeoutContext: Real-time update from Firestore:", timeout);
          setLogoutTimeoutState(timeout);
          localStorage.setItem(LOCAL_STORAGE_KEY, timeout.toString());
        }
      }
    }, (error) => {
      console.error('LogoutTimeoutContext: Error in real-time listener:', error);
    });

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