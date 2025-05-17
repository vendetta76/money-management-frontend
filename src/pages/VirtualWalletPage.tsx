
import React, { useEffect, useState } from "react";
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
  history?: {
    id?: string;
    amount: number;
    type: "add" | "edit" | "spend";
    timestamp: string;
    description?: string;
  }[];
}

const VirtualWalletPage: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<VirtualWallet[]>([]);
  const [form, setForm] = useState({ name: "", currency: "IDR", balance: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [topupAmounts, setTopupAmounts] = useState<{ [id: string]: string }>({});
  const [spendAmounts, setSpendAmounts] = useState<{ [id: string]: string }>({});
  const [descriptions, setDescriptions] = useState<{ [id: string]: string }>({});
  const [editHistory, setEditHistory] = useState<{
    [walletId: string]: VirtualWallet["history"];
  }>({});

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

  const formatNumber = (value: number | string) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        { amount: parsedBalance, type: "edit", timestamp, description },
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
          { amount: parsedBalance, type: "add", timestamp, description },
        ],
        createdAt: serverTimestamp(),
      });
    }
    setForm({ name: "", currency: "IDR", balance: "" });
    setDescription("");
  };

  const handleTopup = async (id: string) => {
    const raw = topupAmounts[id];
    if (!user?.uid || !raw) return;
    const parsed = parseFloat(raw.replace(/,/g, ""));
    if (isNaN(parsed) || parsed <= 0) return;
    const timestamp = new Date().toISOString();
    const target = wallets.find((w) => w.id === id);
    if (!target) return;

    const walletDoc = doc(db, "users", user.uid, "virtualWallets", id);
    const newBalance = target.balance + parsed;
    const newHistory = [
      ...(target.history || []),
      { amount: parsed, type: "add", timestamp, description: descriptions[id] || "" },
    ];
    await updateDoc(walletDoc, {
      balance: newBalance,
      history: newHistory,
    });
    setTopupAmounts((prev) => ({ ...prev, [id]: "" }));
    setDescriptions((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSpend = async (id: string) => {
    const raw = spendAmounts[id];
    if (!user?.uid || !raw) return;
    const parsed = parseFloat(raw.replace(/,/g, ""));
    if (isNaN(parsed) || parsed <= 0) return;
    const timestamp = new Date().toISOString();
    const target = wallets.find((w) => w.id === id);
    if (!target || target.balance < parsed) {
      alert("Saldo tidak cukup.");
      return;
    }

    const walletDoc = doc(db, "users", user.uid, "virtualWallets", id);
    const newBalance = target.balance - parsed;
    const newHistory = [
      ...(target.history || []),
      { amount: parsed, type: "spend", timestamp, description: descriptions[id] || "" },
    ];
    await updateDoc(walletDoc, {
      balance: newBalance,
      history: newHistory,
    });
    setSpendAmounts((prev) => ({ ...prev, [id]: "" }));
    setDescriptions((prev) => ({ ...prev, [id]: "" }));
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    await deleteDoc(doc(db, "users", user.uid, "virtualWallets", id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ name: "", currency: "IDR", balance: "" });
    }
  };

  const handleEdit = (wallet: VirtualWallet) => {
    setForm({
      name: wallet.name,
      currency: wallet.currency,
      balance: wallet.balance.toString(),
    });
    setEditingId(wallet.id);
  };

  return (
    <LayoutShell>
      <div className="max-w-xl mx-auto p-4 space-y-6">
        <h1 className="text-2xl font-bold mb-2">Virtual Wallets</h1>

        <div className="bg-white p-4 rounded-xl shadow space-y-4">
          <input
            name="name"
            placeholder="Nama Wallet"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
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
            placeholder="Deskripsi transaksi (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleAddOrUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? "Simpan Perubahan" : "Tambah Wallet"}
          </button>
        </div>

        {wallets.map((w) => (
          <div key={w.id} className="bg-gray-50 p-4 rounded-xl shadow space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{w.name} ({w.currency})</h2>
                <p className="text-xl font-bold text-blue-600">{formatNumber(w.balance)}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(w)} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:underline">Hapus</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                placeholder="Topup"
                value={topupAmounts[w.id] || ""}
                onChange={(e) =>
                  setTopupAmounts((prev) => ({ ...prev, [w.id]: e.target.value }))
                }
                className="p-2 border rounded"
              />
              <input
                placeholder="Deskripsi"
                value={descriptions[w.id] || ""}
                onChange={(e) =>
                  setDescriptions((prev) => ({ ...prev, [w.id]: e.target.value }))
                }
                className="p-2 border rounded"
              />
              <button
                onClick={() => handleTopup(w.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Tambah Saldo
              </button>

              <input
                placeholder="Pengeluaran"
                value={spendAmounts[w.id] || ""}
                onChange={(e) =>
                  setSpendAmounts((prev) => ({ ...prev, [w.id]: e.target.value }))
                }
                className="p-2 border rounded"
              />
              <input
                placeholder="Deskripsi"
                value={descriptions[w.id] || ""}
                onChange={(e) =>
                  setDescriptions((prev) => ({ ...prev, [w.id]: e.target.value }))
                }
                className="p-2 border rounded"
              />
              <button
                onClick={() => handleSpend(w.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Kurangi Saldo
              </button>
            </div>

            {w.history && (
              <div className="text-sm text-gray-600 mt-2">
                <p className="font-semibold">Riwayat:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {w.history.map((h, i) => (
                    <li key={i}>
                      {h.type === "add" ? "+" : h.type === "edit" ? "→" : "-"} {formatNumber(h.amount)} 
                      {h.description ? ` - ${h.description}` : ""} ({new Date(h.timestamp).toLocaleString("id-ID")})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </LayoutShell>
  );
};

export default VirtualWalletPage;