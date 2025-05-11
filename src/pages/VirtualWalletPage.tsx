import React, { useState, useEffect } from "react";
import LayoutShell from "../layouts/LayoutShell";
import { useAuth } from "../context/AuthContext";

interface VirtualWallet {
  id: string;
  name: string;
  currency: string;
  balance: number;
  history?: { amount: number; type: "add" | "edit"; timestamp: string }[];
}

const allowedEmails = [
  "joeverson.kamantha@gmail.com",
];

const VirtualWalletPage: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<VirtualWallet[]>([]);
  const [form, setForm] = useState({ name: "", currency: "IDR", balance: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("virtual-wallets");
    if (saved) setWallets(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("virtual-wallets", JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    if (!user || !user.email) return;
    const email = user.email.toLowerCase();
    if (!allowedEmails.includes(email)) {
      alert("Akses ditolak. Halaman ini hanya untuk user tertentu.");
      window.location.href = "/dashboard";
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = () => {
    if (!form.name || !form.balance) return;
    const parsedBalance = parseFloat(form.balance.replace(/,/g, ""));
    const timestamp = new Date().toISOString();

    if (editingId) {
      setWallets((prev) =>
        prev.map((w) =>
          w.id === editingId
            ? {
                ...w,
                name: form.name,
                currency: form.currency,
                balance: parsedBalance,
                history: [
                  ...(w.history || []),
                  { amount: parsedBalance, type: "edit", timestamp },
                ],
              }
            : w
        )
      );
      setEditingId(null);
    } else {
      const newWallet: VirtualWallet = {
        id: Date.now().toString(),
        name: form.name,
        currency: form.currency,
        balance: parsedBalance,
        history: [
          { amount: parsedBalance, type: "add", timestamp },
        ],
      };
      setWallets((prev) => [...prev, newWallet]);
    }
    setForm({ name: "", currency: "IDR", balance: "" });
  };

  const handleTopup = (id: string) => {
    const parsed = parseFloat(topupAmount.replace(/,/g, ""));
    if (isNaN(parsed)) return;
    const timestamp = new Date().toISOString();
    setWallets((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              balance: w.balance + parsed,
              history: [
                ...(w.history || []),
                { amount: parsed, type: "add", timestamp },
              ],
            }
          : w
      )
    );
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

  const handleDelete = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ name: "", currency: "IDR", balance: "" });
    }
  };

  const formatNumber = (value: number | string) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  if (!user) return <LayoutShell><p className="text-center py-10">Loading...</p></LayoutShell>;

  return (
    <LayoutShell>
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Virtual Wallet (Non-Sync)</h1>

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
