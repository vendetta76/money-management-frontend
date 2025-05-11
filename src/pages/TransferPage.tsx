
import React, { useEffect, useState } from "react";
import LayoutShell from "../layouts/LayoutShell";
import { db } from "../lib/firebaseClient";
import {
  collection,
  addDoc,
  updateDoc,
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
  const [amount, setAmount] = useState(""); // formatted string
  const [description, setDescription] = useState("");
  const [transferHistory, setTransferHistory] = useState<TransferEntry[]>([]);

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

      if (fromWallet.balance < parsedAmount) {
        toast.error("Saldo tidak mencukupi");
        return;
      }

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
      setAmount("");
      setDescription("");
    } catch (err: any) {
      toast.error("Gagal transfer: " + err.message);
    }
  };

  return (
    <LayoutShell>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Transfer Antar Wallet</h1>

        <label className="block mb-2 font-semibold">Dari Wallet:</label>
        <select
          value={fromWalletId}
          onChange={e => setFromWalletId(e.target.value)}
          className="w-full p-2 border mb-4 rounded"
        >
          <option value="">Pilih Wallet</option>
          {wallets.map(wallet => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name} - {wallet.currency} ({formatNominal(wallet.balance, wallet.currency)})
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Ke Wallet:</label>
        <select
          value={toWalletId}
          onChange={e => setToWalletId(e.target.value)}
          className="w-full p-2 border mb-4 rounded"
        >
          <option value="">Pilih Wallet</option>
          {wallets.map(wallet => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name} - {wallet.currency} ({formatNominal(wallet.balance, wallet.currency)})
            </option>
          ))}
        </select>

        <label className="block mb-2 font-semibold">Jumlah:</label>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          className="w-full p-2 border mb-4 rounded"
          placeholder="Contoh: 1,000,000"
        />

        <label className="block mb-2 font-semibold">Deskripsi:</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full p-2 border mb-4 rounded"
        />

        <button
          onClick={handleTransfer}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Transfer
        </button>

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
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(entry.createdAt?.toDate?.() ?? entry.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
