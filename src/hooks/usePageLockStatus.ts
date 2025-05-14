import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";

interface PageLockData {
  locked: boolean;
  message?: string;
}

export const usePageLockStatus = (pageKey: string, userId: string | undefined) => {
  const [lockStatus, setLockStatus] = useState<PageLockData>({ locked: false });

  useEffect(() => {
    if (!userId) return;
    const ref = doc(db, "users", userId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const pageLocks = data.pageLocks || {};
        setLockStatus(pageLocks[pageKey] || { locked: false });
      }
    });
    return () => unsub();
  }, [userId, pageKey]);

  return lockStatus;
};