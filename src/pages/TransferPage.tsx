import React, { useEffect, useState } from "react";
import LayoutShell from "../layouts/LayoutShell";
import { db } from "../lib/firebaseClient";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

interface WalletEntry {
  id: string;
  name: string;
  balance: number;
  currency: string;
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

const formatNominal = (num: number, currency: string) => {
  const formattedNum = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  switch (currency) {
    case "IDR": return `Rp ${formattedNum}`;
    case "THB": return `฿ ${formattedNum}`;
    case "USD": return `$ ${formattedNum}`;
    case "EUR": return `€ ${formattedNum}`;
    case "GBP": return `£ ${formattedNum}`;
    case "JPY": return `¥ ${formattedNum}`;
    default: return `${currency} ${formattedNum}`;
  }
};

const TransferPage: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [transferHistory, setTransferHistory] = useState<TransferEntry[]>([]);
  const [editingTransfer, setEditingTransfer] = useState<TransferEntry | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchWallets = async () => {
      const q = query(collection(db, "users", user.uid, "wallets"));
      const snapshot = await getDocs(q);
      const walletData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WalletEntry[];
      setWallets(walletData);
    };
    fetchWallets();

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
      unsubTransfer();
    };
  }, [user]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setAmount(formatted);
  };

  const handleTransfer = async () => {
    const parsedAmount = Number(amount.replace(/,/g, ""));
    if (!fromWalletId || !toWalletId || parsedAmount <= 0) {
      toast.error("Lengkapi semua field dan jumlah harus positif");
      return;
    }
    if (fromWalletId === toWalletId) {
      toast.error("Dompet asal dan tujuan tidak boleh sama");
      return;
    }

    try {
      const fromWalletRef = doc(db, "users", user.uid, "wallets", fromWalletId);
      const toWalletRef = doc(db, "users", user.uid, "wallets", toWalletId);

      const fromWallet = wallets.find(w => w.id === fromWalletId);
      const toWallet = wallets.find(w => w.id === toWalletId);

      if (!fromWallet || !toWallet) throw new Error("Wallet tidak ditemukan");

      if (editingTransfer) {
        const previousAmount = editingTransfer.amount;

        // Rollback saldo lama
        const fromRef = doc(db, "users", user.uid, "wallets", editingTransfer.fromWalletId);
        const toRef = doc(db, "users", user.uid, "wallets", editingTransfer.toWalletId);

        await updateDoc(fromRef, {
          balance: fromWallet.balance + previousAmount,
        });
        await updateDoc(toRef, {
          balance: toWallet.balance - previousAmount,
        });

        // Update saldo baru
        await updateDoc(fromWalletRef, {
          balance: fromWallet.balance - parsedAmount,
        });
        await updateDoc(toWalletRef, {
          balance: toWallet.balance + parsedAmount,
        });

        // Update dokumen transfer
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

        toast.success("Transfer berhasil diperbarui!");
        setEditingTransfer(null);
      } else {
        await updateDoc(fromWalletRef, {
          balance: fromWallet.balance - parsedAmount,
        });
        await updateDoc(toWalletRef, {
          balance: toWallet.balance + parsedAmount,
        });

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

      setAmount("");
      setDescription("");
      setFromWalletId("");
      setToWalletId("");
    } catch (err: any) {
      toast.error("Gagal transfer: " + err.message);
    }
  };

  const handleEditTransfer = (entry: TransferEntry) => {
    setEditingTransfer(entry);
    setFromWalletId(entry.fromWalletId);
    setToWalletId(entry.toWalletId);
    setAmount(entry.amount.toString());
    setDescription(entry.description);
  };

  const handleDeleteTransfer = async (entry: TransferEntry) => {
    if (!user) return;
    try {
      const fromRef = doc(db, "users", user.uid, "wallets", entry.fromWalletId);
      const toRef = doc(db, "users", user.uid, "wallets", entry.toWalletId);

      const fromSnap = await getDocs(query(collection(db, "users", user.uid, "wallets")));
      const walletsData = fromSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WalletEntry[];

      const fromWallet = walletsData.find(w => w.id === entry.fromWalletId);
      const toWallet = walletsData.find(w => w.id === entry.toWalletId);

      if (!fromWallet || !toWallet) throw new Error("Wallet tidak ditemukan saat rollback");

      await updateDoc(fromRef, {
        balance: fromWallet.balance + entry.amount,
      });

      await updateDoc(toRef, {
        balance: toWallet.balance - entry.amount,
      });

      await deleteDoc(doc(db, "users", user.uid, "transfers", entry.id));

      toast.success("Transaksi transfer berhasil dihapus dan saldo dikembalikan.");
    } catch (err: any) {
      toast.error("Gagal hapus transaksi: " + err.message);
    }
  };

  return (
    <LayoutShell>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Transfer Antar Wallet</h1>

        {/* ...form */}

        {transferHistory.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-2">Riwayat Transfer Terbaru</h2>
            <div className="space-y-3">
              {transferHistory.map((entry) => (
                <div key={entry.id} className="p-3 rounded border border-blue-200 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-blue-800">
                        {entry.from} ➡️ {entry.to}
                      </div>
                      <div className="text-xs text-gray-500">{entry.description}</div>
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {formatNominal(entry.amount, entry.currency)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
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
    </LayoutShell>
  );
};

export default TransferPage;
