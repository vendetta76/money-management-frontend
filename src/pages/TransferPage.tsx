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

const formatNominal = (num: number, currency: string) => {
  const formattedNum = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return currency === "IDR" ? `Rp ${formattedNum}` : `${currency} ${formattedNum}`;
};

const TransferPage: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchWallets = async () => {
      const q = query(collection(db, "users", user.uid, "wallets"));
      const snapshot = await getDocs(q);
      const walletData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WalletEntry[];
      setWallets(walletData);
    };
    fetchWallets();
  }, [user]);

  const handleTransfer = async () => {
    if (!fromWalletId || !toWalletId || amount <= 0) {
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

      if (fromWallet.balance < amount) {
        toast.error("Saldo tidak mencukupi");
        return;
      }

      await updateDoc(fromWalletRef, {
        balance: fromWallet.balance - amount,
      });
      await updateDoc(toWalletRef, {
        balance: toWallet.balance + amount,
      });

      await addDoc(collection(db, "users", user.uid, "transfers"), {
        from: fromWallet.name,
        to: toWallet.name,
        amount,
        currency: fromWallet.currency,
        description,
        createdAt: serverTimestamp(),
      });

      toast.success("Transfer berhasil!");
      setAmount(0);
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
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full p-2 border mb-4 rounded"
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
      </div>
    </LayoutShell>
  );
};

export default TransferPage;