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
    <div className="dark:text-white dark:bg-gray-900 p-6 max-w-xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow">
      <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold mb-4">📝 Tambah Transaksi</h1>
      <form onSubmit={handleSubmit} className="dark:text-white dark:bg-gray-900 space-y-4">
        <select
          className="dark:text-white dark:bg-gray-900 w-full border p-2 rounded"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <input
  type="text"
  placeholder="Nominal"
  className="dark:text-white dark:bg-gray-900 w-full border p-2 rounded"
  value={new Intl.NumberFormat("id-ID").format(form.amount || 0)}
  onChange={(e) => {
    const onlyDigits = e.target.value.replace(/\D/g, ""); // Hapus semua non-digit
    setForm({ ...form, amount: onlyDigits });
  }}
  required
/>

        <select
          className="dark:text-white dark:bg-gray-900 w-full border p-2 rounded"
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
        >
          <option value="IDR">IDR</option>
          <option value="THB">THB</option>
        </select>

        <input
          type="text"
          placeholder="Deskripsi"
          className="dark:text-white dark:bg-gray-900 w-full border p-2 rounded"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <button
          type="submit"
          className="dark:text-white dark:bg-gray-900 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Simpan
        </button>
      </form>
    </div>
  );
}
