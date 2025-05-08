
import React, { useEffect } from "react";
import { usePinLock } from "@/context/PinLockContext";

const withPinProtection = (Component: React.FC) => {
  const ProtectedComponent = () => {
    const { locked, lock } = usePinLock();

    useEffect(() => {
      const events = ["mousemove", "keydown", "scroll", "touchstart"];
      let timeout: any;

      const resetTimer = () => {
        clearTimeout(timeout);
        const autoLock = Number(localStorage.getItem("pinAutoLockMinutes") || "0");
        if (autoLock > 0) {
          timeout = setTimeout(() => {
            lock();
          }, autoLock * 60 * 1000);
        }
      };

      for (const evt of events) {
        window.addEventListener(evt, resetTimer);
      }

      resetTimer(); // initial call

      return () => {
        for (const evt of events) {
          window.removeEventListener(evt, resetTimer);
        }
        clearTimeout(timeout);
      };
    }, [lock]);

    if (locked) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="bg-white p-6 rounded shadow-md w-80 text-center">
            <h2 className="text-xl font-bold mb-4">🔒 Halaman Terkunci</h2>
            <p>Silakan buka Wallet terlebih dahulu untuk autentikasi ulang.</p>
          </div>
        </div>
      );
    }

    return <Component />;
  };

  return ProtectedComponent;
};

export default withPinProtection;
