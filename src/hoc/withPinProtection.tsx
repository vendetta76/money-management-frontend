
import React, { useEffect, useState } from "react";
import { usePinLock } from "@/context/PinLockContext";
import PinModal from "@/components/PinModal";

const withPinProtection = (Component: React.FC) => {
  const ProtectedComponent = () => {
    const { locked, unlock, lock } = usePinLock();
    const [enteredPin, setEnteredPin] = useState("");
    const [pinLockVisible, setPinLockVisible] = useState(false);

    useEffect(() => {
      const events = ["mousemove", "keydown", "scroll", "touchstart"];
      let timeout: any;

      const resetTimer = () => {
        clearTimeout(timeout);
        const autoLock = Number(localStorage.getItem("pinAutoLockMinutes") || "0");
        if (autoLock > 0) {
          timeout = setTimeout(() => {
            lock();
            setPinLockVisible(true);
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

    useEffect(() => {
      if (locked) {
        setPinLockVisible(true);
      }
    }, [locked]);

    const handleUnlock = () => {
      const result = unlock(enteredPin);
      console.log("[HOC] Unlock attempt:", enteredPin, "=>", result);
      if (result) {
        setEnteredPin("");
        setPinLockVisible(false);
      }
    };

    return (
      <>
        <Component />
        <PinModal
          visible={pinLockVisible}
          enteredPin={enteredPin}
          setEnteredPin={setEnteredPin}
          onUnlock={handleUnlock}
        />
      </>
    );
  };

  return ProtectedComponent;
};

export default withPinProtection;
