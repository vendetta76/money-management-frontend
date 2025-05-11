
import React, { useState, useEffect } from "react";
import LayoutShell from "../layouts/LayoutShell";
import { useAuth } from "../context/AuthContext";

interface VirtualWallet {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

const allowedEmails = [
  "joeverson.kamantha@gmail.com",
];

const VirtualWalletPage: React.FC = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<VirtualWallet[]>([]);
  const [form, setForm] = useState({ name: "", currency: "IDR", balance: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
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

    if (editingId) {
      setWallets((prev) =>
        prev.map((w) =>
          w.id === editingId ? { ...w, name: form.name, currency: form.currency, balance: parsedBalance } : w
        )
      );
      setEditingId(null);
    } else {
      const newWallet: VirtualWallet = {
        id: Date.now().toString(),
        name: form.name,
        currency: form.currency,
        balance: parsedBalance,
      };
      setWallets((prev) => [...prev, newWallet]);
    }
    setForm({ name: "", currency: "IDR", balance: "" });
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
          <div className="space-y-3">
            {wallets.map((w) => (
              <div key={w.id} className="bg-gray-50 p-3 rounded border shadow flex justify-between items-center">
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
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
};

export default VirtualWalletPage;
