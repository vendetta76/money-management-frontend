import { useEffect, useState } from "react";
import { db } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
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
import { IncomeEntry, WalletEntry } from "../helpers/types";
import { Pencil, Trash } from "lucide-react";
import { formatCurrency } from "../helpers/formatCurrency";

const RecentTransactions = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(incomes.length / itemsPerPage);
  const paginatedIncomes = incomes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
        <>
          <div className="space-y-4">
            {paginatedIncomes.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow flex justify-between items-start"
              >
                <div className="cursor-pointer w-full" onClick={() => toggleExpand(entry.id)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {entry.source} • {getWalletName(entry.wallet)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.createdAt?.toDate?.() ?? entry.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(entry.amount, entry.currency)}
                      </p>
                    </div>
                  </div>
                  {expandedId === entry.id && (
                    <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleDelete(entry.id, entry.amount, entry.wallet)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="px-2 py-1 text-sm">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentTransactions;