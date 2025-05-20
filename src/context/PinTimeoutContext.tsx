import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';
import { useAuth } from './AuthContext';
import CryptoJS from 'crypto-js'; // For client-side PIN hashing

interface PinTimeoutContextType {
  // PIN timeout settings
  pinTimeout: number | undefined;
  setPinTimeout: (timeout: number) => Promise<void>;
  
  // PIN verification state
  isPinVerified: boolean;
  verifyPin: () => void;
  lockPin: () => void;
  isLoading: boolean;
  error: string | null;
  
  // PIN management
  hasPin: boolean;
  verifyPinValue: (pin: string) => Promise<boolean>;
  createPin: (pin: string) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  deletePin: (pin: string) => Promise<boolean>;
  resetPinAttempts: () => Promise<void>;
  
  // PIN attempt tracking
  pinAttempts: number;
  isPinLocked: boolean;
  pinLockExpiry: number | null;
}

const PinTimeoutContext = createContext<PinTimeoutContextType | undefined>(undefined);

export const PinTimeoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, user } = useAuth();
  
  // PIN timeout configuration
  const [pinTimeout, setPinTimeoutState] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // PIN verification state
  const [isPinVerified, setIsPinVerified] = useState<boolean>(false);
  const [pinVerifiedAt, setPinVerifiedAt] = useState<number | null>(null);
  const [pinTimer, setPinTimer] = useState<NodeJS.Timeout | null>(null);
  
  // PIN management state
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [pinSalt, setPinSalt] = useState<string | null>(null);
  
  // PIN attempt tracking
  const [pinAttempts, setPinAttempts] = useState<number>(0);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [pinLockExpiry, setPinLockExpiry] = useState<number | null>(null);
  
  // Maximum PIN attempts before locking
  const MAX_PIN_ATTEMPTS = 5;
  // PIN lock duration in milliseconds (15 minutes)
  const PIN_LOCK_DURATION = 15 * 60 * 1000;

  // Check if user is authenticated
  const isAuthenticated = () => {
    // Use both currentUser and user to be safe
    return !!(currentUser || user);
  };

  // Get current user ID safely
  const getUserId = () => {
    if (currentUser?.uid) return currentUser.uid;
    if (user?.uid) return user.uid;
    return null;
  };

  // Load PIN configurations from Firestore
  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setPinTimeoutState(undefined);
      setHasPin(false);
      setPinHash(null);
      setIsPinVerified(false);
      setIsLoading(false);
      return;
    }

    const loadPinSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Load PIN timeout
          const timeout = userData.preferences?.pinTimeout;
          setPinTimeoutState(timeout || 0);
          
          // Load PIN info
          const userPin = userData.pinSettings || {};
          setPinHash(userPin.hash || null);
          setPinSalt(userPin.salt || null);
          setHasPin(!!userPin.hash);
          
          // Load PIN attempts
          setPinAttempts(userPin.attempts || 0);
          setPinLockExpiry(userPin.lockExpiry || null);
          
          // Check if PIN is locked
          if (userPin.lockExpiry && userPin.lockExpiry > Date.now()) {
            setIsPinLocked(true);
          } else if (userPin.lockExpiry) {
            // Reset lock if expired
            try {
              await updateDoc(userDocRef, {
                'pinSettings.lockExpiry': null,
                'pinSettings.attempts': 0
              });
              setIsPinLocked(false);
              setPinAttempts(0);
            } catch (err) {
              console.error("Error resetting lock:", err);
            }
          }
          
          // Auto verify if no PIN is set or PIN timeout is 0
          if (!userPin.hash || timeout === 0) {
            setIsPinVerified(true);
          }
        } else {
          // Default values for new users - create the document if it doesn't exist
          try {
            await setDoc(userDocRef, {
              preferences: {
                pinTimeout: 0
              },
              pinSettings: {
                hash: null,
                salt: null,
                attempts: 0,
                lockExpiry: null,
                lastChanged: null
              }
            }, { merge: true });
          } catch (err) {
            console.error("Error creating initial user pin settings:", err);
          }
          
          setPinTimeoutState(0);
          setHasPin(false);
          setIsPinVerified(true);
        }
      } catch (err) {
        console.error('Error loading PIN settings:', err);
        setError('Failed to load PIN settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadPinSettings();
  }, [currentUser, user]);

  // Generate a random salt
  const generateSalt = (length = 16) => {
    return CryptoJS.lib.WordArray.random(length).toString();
  };

  // Hash PIN with salt
  const hashPin = (pin: string, salt: string) => {
    return CryptoJS.PBKDF2(pin, salt, { keySize: 8, iterations: 1000 }).toString();
  };

  // Save PIN settings to Firestore
  const savePinSettings = async (hash: string | null, salt: string | null) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const userDocRef = doc(db, 'users', userId);
      
      // Check if document exists first
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, {
          'pinSettings.hash': hash,
          'pinSettings.salt': salt,
          'pinSettings.lastChanged': hash ? Date.now() : null,
          'pinSettings.attempts': 0,
          'pinSettings.lockExpiry': null
        });
      } else {
        // Create document if it doesn't exist
        await setDoc(userDocRef, {
          preferences: {
            pinTimeout: pinTimeout || 0
          },
          pinSettings: {
            hash,
            salt,
            lastChanged: hash ? Date.now() : null,
            attempts: 0,
            lockExpiry: null
          }
        }, { merge: true });
      }
      
      setHasPin(!!hash);
      setPinHash(hash);
      setPinSalt(salt);
      setPinAttempts(0);
      setIsPinLocked(false);
      setPinLockExpiry(null);
    } catch (err) {
      console.error("Error saving PIN settings:", err);
      throw err;
    }
  };

  // Update PIN attempts in Firestore
  const updatePinAttempts = async (attempts: number, lockExpiry: number | null = null) => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      const userDocRef = doc(db, 'users', userId);
      
      // Check if document exists first
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        await updateDoc(userDocRef, {
          'pinSettings.attempts': attempts,
          'pinSettings.lockExpiry': lockExpiry
        });
      } else {
        // Create document with default values if it doesn't exist
        await setDoc(userDocRef, {
          preferences: {
            pinTimeout: pinTimeout || 0
          },
          pinSettings: {
            hash: null,
            salt: null,
            lastChanged: null,
            attempts: attempts,
            lockExpiry: lockExpiry
          }
        }, { merge: true });
      }
      
      setPinAttempts(attempts);
      setPinLockExpiry(lockExpiry);
      setIsPinLocked(!!lockExpiry && lockExpiry > Date.now());
    } catch (err) {
      console.error("Error updating PIN attempts:", err);
    }
  };

  // Reset PIN attempts
  const resetPinAttempts = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    await updatePinAttempts(0, null);
  };

  // Create a new PIN
  const createPin = async (pin: string): Promise<boolean> => {
    if (!isAuthenticated()) {
      setError('User not authenticated');
      return false;
    }
    
    try {
      const salt = generateSalt();
      const hash = hashPin(pin, salt);
      
      await savePinSettings(hash, salt);
      setIsPinVerified(true);
      setPinVerifiedAt(Date.now());
      
      return true;
    } catch (err) {
      console.error('Error creating PIN:', err);
      setError('Failed to create PIN');
      return false;
    }
  };

  // Change existing PIN
  const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    if (!isAuthenticated() || !pinHash || !pinSalt) {
      setError('User not authenticated or PIN not set');
      return false;
    }
    
    try {
      // Verify old PIN
      const oldHash = hashPin(oldPin, pinSalt);
      
      if (oldHash !== pinHash) {
        // Increment attempts on wrong PIN
        const newAttempts = pinAttempts + 1;
        
        if (newAttempts >= MAX_PIN_ATTEMPTS) {
          const expiry = Date.now() + PIN_LOCK_DURATION;
          await updatePinAttempts(newAttempts, expiry);
        } else {
          await updatePinAttempts(newAttempts);
        }
        
        return false;
      }
      
      // Create new PIN
      const salt = generateSalt();
      const hash = hashPin(newPin, salt);
      
      await savePinSettings(hash, salt);
      return true;
    } catch (err) {
      console.error('Error changing PIN:', err);
      setError('Failed to change PIN');
      return false;
    }
  };

  // Delete PIN
  const deletePin = async (pin: string): Promise<boolean> => {
    if (!isAuthenticated() || !pinHash || !pinSalt) {
      setError('User not authenticated or PIN not set');
      return false;
    }
    
    try {
      // Verify PIN before deletion
      const hash = hashPin(pin, pinSalt);
      
      if (hash !== pinHash) {
        // Increment attempts on wrong PIN
        const newAttempts = pinAttempts + 1;
        
        if (newAttempts >= MAX_PIN_ATTEMPTS) {
          const expiry = Date.now() + PIN_LOCK_DURATION;
          await updatePinAttempts(newAttempts, expiry);
        } else {
          await updatePinAttempts(newAttempts);
        }
        
        return false;
      }
      
      // Remove PIN
      await savePinSettings(null, null);
      setIsPinVerified(true);
      
      return true;
    } catch (err) {
      console.error('Error deleting PIN:', err);
      setError('Failed to delete PIN');
      return false;
    }
  };

  // Verify a PIN value
  const verifyPinValue = async (pin: string): Promise<boolean> => {
    if (!isAuthenticated() || !pinHash || !pinSalt) {
      setError('User not authenticated or PIN not set');
      return false;
    }
    
    // Check if PIN is locked
    if (isPinLocked) {
      if (pinLockExpiry && pinLockExpiry > Date.now()) {
        return false;
      } else {
        // Reset lock if expired
        await resetPinAttempts();
      }
    }
    
    // Verify PIN
    const hash = hashPin(pin, pinSalt);
    
    if (hash !== pinHash) {
      // Increment attempts on wrong PIN
      const newAttempts = pinAttempts + 1;
      
      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        const expiry = Date.now() + PIN_LOCK_DURATION;
        await updatePinAttempts(newAttempts, expiry);
      } else {
        await updatePinAttempts(newAttempts);
      }
      
      return false;
    }
    
    // Reset attempts on success
    await resetPinAttempts();
    setIsPinVerified(true);
    setPinVerifiedAt(Date.now());
    
    return true;
  };

  // Verify PIN (for automatic timeout)
  const verifyPin = () => {
    setIsPinVerified(true);
    setPinVerifiedAt(Date.now());
  };

  // Lock PIN manually
  const lockPin = () => {
    setIsPinVerified(false);
    setPinVerifiedAt(null);
    
    // Clear any existing timer
    if (pinTimer) {
      clearTimeout(pinTimer);
      setPinTimer(null);
    }
  };

  // Save PIN timeout to Firestore
  const setPinTimeout = async (timeout: number) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const userDocRef = doc(db, 'users', userId);
      
      // Check if document exists
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        await updateDoc(userDocRef, {
          'preferences.pinTimeout': timeout
        });
      } else {
        // Create document if it doesn't exist
        await setDoc(userDocRef, {
          preferences: {
            pinTimeout: timeout
          },
          pinSettings: {
            hash: null,
            salt: null,
            attempts: 0,
            lockExpiry: null,
            lastChanged: null
          }
        }, { merge: true });
      }
      
      setPinTimeoutState(timeout);
      
      // If timeout is set to 0 (disabled), automatically verify PIN
      if (timeout === 0) {
        setIsPinVerified(true);
      }
      
      // If PIN is verified and timeout changed, reset timer
      if (isPinVerified && pinVerifiedAt) {
        setPinVerifiedAt(Date.now());
      }
    } catch (err) {
      console.error('Error saving PIN timeout:', err);
      setError('Failed to save PIN settings');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PIN expiration based on timeout
  useEffect(() => {
    // Skip if PIN is already locked or PIN timeout is disabled or not loaded yet
    if (!isPinVerified || !pinVerifiedAt || pinTimeout === undefined || pinTimeout === 0) {
      return;
    }
    
    // Clear any existing timer
    if (pinTimer) {
      clearTimeout(pinTimer);
    }
    
    // Calculate remaining time
    const now = Date.now();
    const elapsed = now - pinVerifiedAt;
    
    if (elapsed >= pinTimeout) {
      // PIN has already expired
      setIsPinVerified(false);
      setPinVerifiedAt(null);
      return;
    }
    
    // Set timer for remaining time
    const remainingTime = pinTimeout - elapsed;
    const timer = setTimeout(() => {
      setIsPinVerified(false);
      setPinVerifiedAt(null);
    }, remainingTime);
    
    setPinTimer(timer);
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPinVerified, pinVerifiedAt, pinTimeout]);

  const contextValue: PinTimeoutContextType = {
    pinTimeout,
    setPinTimeout,
    isPinVerified,
    verifyPin,
    lockPin,
    isLoading,
    error,
    hasPin,
    verifyPinValue,
    createPin,
    changePin,
    deletePin,
    resetPinAttempts,
    pinAttempts,
    isPinLocked,
    pinLockExpiry
  };

  return (
    <PinTimeoutContext.Provider value={contextValue}>
      {children}
    </PinTimeoutContext.Provider>
  );
};

// Hook for using the PIN timeout context
export const usePinTimeout = () => {
  const context = useContext(PinTimeoutContext);
  if (context === undefined) {
    throw new Error('usePinTimeout must be used within a PinTimeoutProvider');
  }
  return context;
};

export default PinTimeoutContext;