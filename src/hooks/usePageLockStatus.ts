// hooks/usePageLockStatus.ts (versi fix agar semua user baca dari admin global)
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";

interface PageLockData {
  locked: boolean;
  message?: string;
}

// Gantilah ini dengan ID admin yang menyimpan pageLocks
const GLOBAL_ADMIN_ID = "kJ2inCI7zWRnJcdQtfAUOUkFJqr1";

export const usePageLockStatus = (pageKey: string) => {
  const [lockStatus, setLockStatus] = useState<PageLockData>({ locked: false });

  useEffect(() => {
    const ref = doc(db, "users", GLOBAL_ADMIN_ID);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const pageLocks = data.pageLocks || {};
        setLockStatus(pageLocks[pageKey] || { locked: false });
      }
    });
    return () => unsub();
  }, [pageKey]);

  return lockStatus;
};
