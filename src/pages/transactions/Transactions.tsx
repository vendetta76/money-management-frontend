import { logActivity } from "../../utils/logActivity"
import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Transactions() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "income",
    amount: "",
    currency: "IDR",
    description: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/transaction", form);
    await logActivity(currentUser?.email || user?.email, \"delete transaction\");
      alert("Transaksi berhasil ditambahkan!");
      navigate("/dashboard");
    } catch (err) {
      alert("Gagal menambahkan transaksi");
      console.error(err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 max-w-xl mx-auto p-6 rounded-lg shadow">
      <h1 className="font-bold mb-4 text-2xl">📝 Tambah Transaksi</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          className="border dark:border-gray-700 p-2 rounded w-full"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <input
  type="text"
  placeholder="Nominal"
  className="border dark:border-gray-700 p-2 rounded w-full"
  value={new Intl.NumberFormat("id-ID").format(form.amount || 0)}
  onChange={(e) => {
    const onlyDigits = e.target.value.replace(/\D/g, ""); // Hapus semua non-digit
    setForm({ ...form, amount: onlyDigits });
  }}
  required
/>

        <select
          className="border dark:border-gray-700 p-2 rounded w-full"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        >
          <option value="IDR">IDR</option>
          <option value="THB">THB</option>
        </select>

        <input
          type="text"
          placeholder="Deskripsi"
          className="border dark:border-gray-700 p-2 rounded w-full"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
