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
    console.log("[PinLock] PIN disimpan dan terkunci.");
  };

  const resetPin = (newPin: string) => {
    localStorage.setItem("walletPin", newPin);
    setPinState(newPin);
    setLocked(false);
    console.log("[PinLock] PIN di-reset dan halaman terbuka.");
  };

  const removePin = () => {
    localStorage.removeItem("walletPin");
    setPinState(null);
    setLocked(false);
    console.log("[PinLock] PIN dihapus.");
  };

  const lock = () => {
    setLocked(true);
    console.log("[PinLock] Halaman dikunci.");
  };

  const unlock = (enteredPin: string) => {
    const savedPin = localStorage.getItem("walletPin");
    // Do not log sensitive data like the PIN
    console.log("[PinLock] Attempting to unlock...");

    if (enteredPin === savedPin) {
      setLocked(false);
      console.log("[PinLock] Unlock successful, halaman dibuka.");
      return true;
    }

    console.warn("[PinLock] Unlock failed: Incorrect PIN.");
    return false;
  };

  const setAutoLockMinutes = (minutes: number) => {
    localStorage.setItem("pinAutoLockMinutes", String(minutes));
    setAutoLockMinutesState(minutes);
    console.log("[PinLock] Auto-lock diset ke", minutes, "menit.");
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