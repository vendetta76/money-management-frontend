import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export const archiveWallet = async (uid, walletId) => {
  const ref = doc(db, "users", uid, "wallets", walletId);
  await updateDoc(ref, {
    status: "archived",
    archivedAt: new Date().toISOString(),
    deletedBy: "user",
  });
};