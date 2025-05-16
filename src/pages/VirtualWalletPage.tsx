import React, { useState, useEffect } from "react";
import LayoutShell from "../layouts/LayoutShell";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebaseClient";

interface VirtualWallet {
  id: string;
  name: string;
  currency: string;
  balance: number;
  history?: { amount: number; type: "add" | "edit"; timestamp: string }[];
}

const VirtualWalletPage: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<VirtualWallet[]>([]);
  const [form, setForm] = useState({ name: "", currency: "IDR", balance: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState<string>("");

  useEffect(() => {
    if (!user?.uid) return;
    const ref = collection(db, "users", user.uid, "virtualWallets");
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as VirtualWallet[];
      setWallets(data);
    });
    return () => unsub();
  }, [user?.uid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async () => {
    if (!form.name || !form.balance || !user?.uid) return;
    const parsedBalance = parseFloat(form.balance.replace(/,/g, ""));
    const timestamp = new Date().toISOString();
    const ref = collection(db, "users", user.uid, "virtualWallets");

    if (editingId) {
      const walletDoc = doc(db, "users", user.uid, "virtualWallets", editingId);
      const target = wallets.find((w) => w.id === editingId);
      const newHistory = [
        ...(target?.history || []),
        { amount: parsedBalance, type: "edit", timestamp },
      ];
      await updateDoc(walletDoc, {
        name: form.name,
        currency: form.currency,
        balance: parsedBalance,
        history: newHistory,
      });
      setEditingId(null);
    } else {
      await addDoc(ref, {
        name: form.name,
        currency: form.currency,
        balance: parsedBalance,
        history: [
          { amount: parsedBalance, type: "add", timestamp },
        ],
        createdAt: serverTimestamp(),
      });
    }
    setForm({ name: "", currency: "IDR", balance: "" });
  };

  const handleTopup = async (id: string) => {
    if (!user?.uid || !topupAmount) return;
    const parsed = parseFloat(topupAmount.replace(/,/g, ""));
    if (isNaN(parsed) || parsed <= 0) return;
    const timestamp = new Date().toISOString();
    const target = wallets.find((w) => w.id === id);
    if (!target) return;

    const walletDoc = doc(db, "users", user.uid, "virtualWallets", id);
    const newBalance = target.balance + parsed;
    const newHistory = [
      ...(target.history || []),
      { amount: parsed, type: "add", timestamp },
    ];
    await updateDoc(walletDoc, {
      balance: newBalance,
      history: newHistory,
    });
    setTopupAmount("");
  };

  const handleEdit = (wallet: VirtualWallet) => {
    setForm({
      name: wallet.name,
      currency: wallet.currency,
      balance: wallet.balance.toString(),
    });
    setEditingId(wallet.id);
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, "users", user.uid, "virtualWallets", id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ name: "", currency: "IDR", balance: "" });
    }
  };

  const formatNumber = (value: number | string) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <LayoutShell>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Virtual Wallet (Firestore)</h1>

        <div className="bg-white p-4 rounded-xl shadow space-y-4 mb-6">
          <input
            name="name"
            placeholder="Nama Wallet"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="IDR">IDR</option>
            <option value="USD">USD</option>
            <option value="THB">THB</option>
          </select>
          <input
            name="balance"
            placeholder="Saldo"
            value={form.balance}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setForm((prev) => ({ ...prev, balance: formatNumber(val) }));
            }}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleAddOrUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Virtual Wallet"}
          </button>
        </div>

        {wallets.length > 0 && (
          <div className="space-y-4">
            {wallets.map((w) => (
              <div key={w.id} className="bg-gray-50 p-4 rounded border shadow">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-semibold">{w.name} ({w.currency})</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatNumber(w.balance)}
                    </div>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(w)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Jumlah tambah saldo"
                    value={topupAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setTopupAmount(formatNumber(val));
                    }}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={() => handleTopup(w.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Tambah Saldo
                  </button>
                </div>

                {w.history && w.history.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="font-semibold mb-1">Riwayat:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {w.history.map((h, i) => (
                        <li key={i}>
                          {h.type === "add" ? "+" : "→"} {formatNumber(h.amount)} ({new Date(h.timestamp).toLocaleString("id-ID")})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
};

export default VirtualWalletPage;