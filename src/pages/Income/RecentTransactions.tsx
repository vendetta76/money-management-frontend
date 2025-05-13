import { useEffect, useState } from "react";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { IncomeEntry, WalletEntry } from "./types";
import { Pencil, Trash } from "lucide-react";
import { formatCurrency } from "./helpers/formatCurrency";

const RecentTransactions = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "incomes"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setIncomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IncomeEntry[]);
    });
    const walletRef = collection(db, "users", user.uid, "wallets");
    const unsubWallets = onSnapshot(walletRef, (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WalletEntry[]);
    });
    return () => {
      unsub();
      unsubWallets();
    };
  }, [user]);

  const getWalletName = (id: string) =>
    wallets.find((w) => w.id === id)?.name || "Dompet tidak ditemukan";

  const handleDelete = async (id: string, amount: number, wallet: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "incomes", id));
    await updateDoc(doc(db, "users", user.uid, "wallets", wallet), {
      balance: increment(-amount),
    });
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Transaksi Terbaru</h2>
      {incomes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">Belum ada pemasukan.</p>
      ) : (
        <div className="space-y-4">
          {incomes.map((entry) => (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div className="text-sm">
                <div className="font-semibold text-gray-800 dark:text-white">
                  {entry.createdAt?.toDate
                    ? new Date(entry.createdAt.toDate()).toLocaleString("id-ID")
                    : "-"}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {getWalletName(entry.wallet)} · {entry.currency}
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(entry.amount, entry.currency)}
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-xs">
                  {entry.description}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() =>
                    handleDelete(entry.id!, entry.amount, entry.wallet)
                  }
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
