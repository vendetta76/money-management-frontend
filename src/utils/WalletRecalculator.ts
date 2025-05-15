// WalletRecalculator.ts - with orphan transaction debug logging
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export async function recalculateAllWalletBalances(userId, setLoading) {
  if (setLoading) setLoading(true);
  const orphanLogs = {
    income: [],
    outcome: [],
    transferFrom: [],
    transferTo: []
  };

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
        if (wallets[data.wallet] !== undefined) {
          wallets[data.wallet] += data.amount;
        } else {
          orphanLogs.income.push({ id: doc.id, ...data });
        }
      }
    });

    outcomeSnap.forEach(doc => {
      const data = doc.data();
      if (data.wallet && typeof data.amount === 'number') {
        if (wallets[data.wallet] !== undefined) {
          wallets[data.wallet] -= data.amount;
        } else {
          orphanLogs.outcome.push({ id: doc.id, ...data });
        }
      }
    });

    transferSnap.forEach(doc => {
      const data = doc.data();
      if (data.from && typeof data.amount === 'number') {
        if (wallets[data.from] !== undefined) {
          wallets[data.from] -= data.amount;
        } else {
          orphanLogs.transferFrom.push({ id: doc.id, ...data });
        }
      }
      if (data.to && typeof data.amount === 'number') {
        if (wallets[data.to] !== undefined) {
          wallets[data.to] += data.amount;
        } else {
          orphanLogs.transferTo.push({ id: doc.id, ...data });
        }
      }
    });

    await Promise.all(
      Object.entries(wallets).map(([walletId, balance]) => {
        if (isNaN(balance)) return;
        return updateDoc(doc(db, 'users', userId, 'wallets', walletId), {
          balance: Math.round(balance),
        });
      })
    );

    if (
      orphanLogs.income.length ||
      orphanLogs.outcome.length ||
      orphanLogs.transferFrom.length ||
      orphanLogs.transferTo.length
    ) {
      console.warn("🔍 Orphaned transactions ditemukan:", orphanLogs);
    }

    return wallets;
  } finally {
    if (setLoading) setLoading(false);
  }
}