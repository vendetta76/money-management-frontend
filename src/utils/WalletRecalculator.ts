// WalletRecalculator.ts
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export async function recalculateAllWalletBalances(userId, setLoading) {
  if (setLoading) setLoading(true);
  try {
    const walletRef = collection(db, 'users', userId, 'wallets');
    const incomeRef = collection(db, 'users', userId, 'incomes');
    const outcomeRef = collection(db, 'users', userId, 'outcomes');
    const transferRef = collection(db, 'users', userId, 'transfers');

    const [walletSnap, incomeSnap, outcomeSnap, transferSnap] = await Promise.all([
      getDocs(walletRef),
      getDocs(incomeRef),
      getDocs(outcomeRef),
      getDocs(transferRef)
    ]);

    const wallets = {};
    walletSnap.forEach(doc => {
      wallets[doc.id] = 0;
    });

    incomeSnap.forEach(doc => {
      const data = doc.data();
      if (data.wallet && typeof data.amount === 'number') {
        wallets[data.wallet] += data.amount;
      }
    });

    outcomeSnap.forEach(doc => {
      const data = doc.data();
      if (data.wallet && typeof data.amount === 'number') {
        wallets[data.wallet] -= data.amount;
      }
    });

    transferSnap.forEach(doc => {
      const data = doc.data();
      if (data.from && typeof data.amount === 'number') {
        wallets[data.from] -= data.amount;
      }
      if (data.to && typeof data.amount === 'number') {
        wallets[data.to] += data.amount;
      }
    });

    await Promise.all(
      Object.entries(wallets).map(([walletId, balance]) => {
        return updateDoc(doc(db, 'users', userId, 'wallets', walletId), {
          balance: Math.round(balance),
        });
      })
    );

    return wallets;
  } finally {
    if (setLoading) setLoading(false);
  }
}
