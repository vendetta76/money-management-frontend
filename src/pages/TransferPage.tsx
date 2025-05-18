// PATCHED TransferPage: Mobile + Dark Mode + Filter Wallet Aktif
import { formatCurrency } from "./helpers/formatCurrency";
import React, { useEffect, useState } from "react";
import LayoutShell from "../layouts/LayoutShell";
import { db } from "../lib/firebaseClient";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { usePageLockStatus } from "../hooks/usePageLockStatus";
import PageLockAnnouncement from "../components/admin/PageLockAnnouncement";

interface WalletEntry {
  id: string;
  name: string;
  balance: number;
  currency: string;
  status?: string;
}

interface TransferEntry {
  id: string;
  from: string;
  to: string;
  fromWalletId: string;
  toWalletId: string;
  wallet: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: any;
}

const TransferPage: React.FC = () => {
  const { user, userMeta } = useAuth();
  const { locked, message } = usePageLockStatus("transfer");
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferHistory, setTransferHistory] = useState<TransferEntry[]>([]);
  const [editingTransfer, setEditingTransfer] = useState<TransferEntry | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubWallets = onSnapshot(
      collection(db, "users", user.uid, "wallets"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WalletEntry[];
        setWallets(data.filter(w => w.status !== "archived"));
      }
    );

    const transferQuery = query(
      collection(db, "users", user.uid, "transfers"),
      orderBy("createdAt", "desc")
    );

    const unsubTransfer = onSnapshot(transferQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TransferEntry[];
      setTransferHistory(data);
    });

    return () => {
      unsubWallets();
      unsubTransfer();
    };
  }, [user]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setAmount(formatted);
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setFromWalletId("");
    setToWalletId("");
    setEditingTransfer(null);
  };

  const handleTransfer = async () => {
    const parsedAmount = Number(amount.replace(/,/g, ""));
    if (!fromWalletId || !toWalletId || parsedAmount <= 0 || !description.trim()) {
      toast.error("Lengkapi semua field dan jumlah harus valid");
      return;
    }
    if (fromWalletId === toWalletId) {
      toast.error("Dompet asal dan tujuan tidak boleh sama");
      return;
    }

    try {
      const fromWallet = wallets.find(w => w.id === fromWalletId);
      const toWallet = wallets.find(w => w.id === toWalletId);
      if (!fromWallet || !toWallet) throw new Error("Wallet tidak ditemukan");
      if (fromWallet.currency !== toWallet.currency) {
        toast.error("Hanya bisa transfer antar dompet dengan mata uang yang sama");
        return;
      }
      if (fromWallet.balance < parsedAmount) {
        toast.error("Saldo tidak cukup untuk transfer ini");
        return;
      }

      const fromRef = doc(db, "users", user.uid, "wallets", fromWalletId);
      const toRef = doc(db, "users", user.uid, "wallets", toWalletId);

      if (editingTransfer) {
        const previousAmount = editingTransfer.amount;
        const rollbackBalance = fromWallet.balance + previousAmount;
        if (rollbackBalance < parsedAmount) {
          toast.error("Saldo tidak cukup untuk memperbarui transfer");
          return;
        }
        const prevFromRef = doc(db, "users", user.uid, "wallets", editingTransfer.fromWalletId);
        const prevToRef = doc(db, "users", user.uid, "wallets", editingTransfer.toWalletId);

        await updateDoc(prevFromRef, { balance: increment(previousAmount) });
        await updateDoc(prevToRef, { balance: increment(-previousAmount) });
        await updateDoc(fromRef, { balance: increment(-parsedAmount) });
        await updateDoc(toRef, { balance: increment(parsedAmount) });

        await updateDoc(doc(db, "users", user.uid, "transfers", editingTransfer.id), {
          from: fromWallet.name,
          to: toWallet.name,
          fromWalletId,
          toWalletId,
          wallet: fromWalletId,
          type: "transfer",
          amount: parsedAmount,
          currency: fromWallet.currency,
          description,
        });

        toast.success("Transfer diperbarui");
        setEditingTransfer(null);
      } else {
        await updateDoc(fromRef, { balance: increment(-parsedAmount) });
        await updateDoc(toRef, { balance: increment(parsedAmount) });
        await addDoc(collection(db, "users", user.uid, "transfers"), {
          from: fromWallet.name,
          to: toWallet.name,
          fromWalletId,
          toWalletId,
          wallet: fromWalletId,
          type: "transfer",
          amount: parsedAmount,
          currency: fromWallet.currency,
          description,
          createdAt: serverTimestamp(),
        });
        toast.success("Transfer berhasil!");
      }

      resetForm();
    } catch (err: any) {
      toast.error("Gagal transfer: " + err.message);
    }
  };

  return (
    <LayoutShell>
      <main className="relative max-w-xl mx-auto p-4">
        {locked && userMeta && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={user?.role}
              bypassFor={["Admin", "Staff", "Tester"]}
            />
          </div>
        )}
        <div className={locked ? "pointer-events-none blur-sm" : "relative z-10"}>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Transfer Antar Wallet</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dari Dompet</label>
              <select
                value={fromWalletId}
                onChange={(e) => setFromWalletId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
              >
                <option value="">Pilih Dompet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ke Dompet</label>
              <select
                value={toWalletId}
                onChange={(e) => setToWalletId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
              >
                <option value="">Pilih Dompet</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah</label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Masukkan jumlah"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masukkan deskripsi (wajib)"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleTransfer}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              {editingTransfer ? "Perbarui Transfer" : "Transfer"}
            </button>
            {editingTransfer && (
              <button
                onClick={resetForm}
                className="w-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white py-2 rounded-md hover:bg-gray-400"
              >
                Batal Edit
              </button>
            )}
          </div>

          {transferHistory.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Riwayat Transfer Terbaru</h2>
              <div className="space-y-3">
                {transferHistory.map((entry) => (
                  <div key={entry.id} className="p-3 rounded border border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                          {entry.from} ➡️ {entry.to}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">{entry.description}</div>
                      </div>
                      <div className="text-sm font-bold text-blue-600 dark:text-blue-200">
                        {formatCurrency(entry.amount, entry.currency)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs text-gray-400 dark:text-gray-300">
                      <span>
                        {new Date(entry.createdAt?.toDate?.() ?? entry.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="space-x-3">
                        <button
                          onClick={() => handleEditTransfer(entry)}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransfer(entry)}
                          className="text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </LayoutShell>
  );
};

export default TransferPage;