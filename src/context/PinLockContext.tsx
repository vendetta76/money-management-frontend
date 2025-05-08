
import React, { createContext, useContext, useEffect, useState } from "react";

interface PinLockContextType {
  pin: string | null;
  locked: boolean;
  autoLockMinutes: number;
  setPin: (newPin: string) => void;
  resetPin: (newPin: string) => void;
  removePin: () => void;
  lock: () => void;
  unlock: (enteredPin: string) => boolean;
  setAutoLockMinutes: (minutes: number) => void;
}

const PinLockContext = createContext<PinLockContextType | undefined>(undefined);

export const PinLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pin, setPinState] = useState<string | null>(localStorage.getItem("walletPin"));
  const [locked, setLocked] = useState<boolean>(!!pin);
  const [autoLockMinutes, setAutoLockMinutesState] = useState<number>(
    Number(localStorage.getItem("pinAutoLockMinutes")) || 0
  );

  useEffect(() => {
    if (autoLockMinutes > 0) {
      const timeout = setTimeout(() => setLocked(true), autoLockMinutes * 60 * 1000);
      return () => clearTimeout(timeout);
    }
  }, [autoLockMinutes]);

  const setPin = (newPin: string) => {
    localStorage.setItem("walletPin", newPin);
    setPinState(newPin);
    setLocked(true);
  };

  const resetPin = (newPin: string) => {
    localStorage.setItem("walletPin", newPin);
    setPinState(newPin);
    setLocked(false);
  };

  const removePin = () => {
    localStorage.removeItem("walletPin");
    setPinState(null);
    setLocked(false);
  };

  const lock = () => setLocked(true);

  const unlock = (enteredPin: string) => {
    if (enteredPin === pin) {
      setLocked(false);
      return true;
    }
    return false;
  };

  const setAutoLockMinutes = (minutes: number) => {
    localStorage.setItem("pinAutoLockMinutes", String(minutes));
    setAutoLockMinutesState(minutes);
  };

  return (
    <PinLockContext.Provider
      value={{
        pin,
        locked,
        autoLockMinutes,
        setPin,
        resetPin,
        removePin,
        lock,
        unlock,
        setAutoLockMinutes,
      }}
    >
      {children}
    </PinLockContext.Provider>
  );
};

export const usePinLock = () => {
  const context = useContext(PinLockContext);
  if (!context) {
    throw new Error("usePinLock must be used within a PinLockProvider");
  }
  return context;
};
