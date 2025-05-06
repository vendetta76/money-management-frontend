import { logActivity } from "../../utils/logActivity"
import { useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AddTransaction() {
  const navigate = useNavigate();
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/transaction", { type, amount: Number(amount), currency, description });
    await logActivity(currentUser?.email || user?.email, \"add transaction\");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Gagal tambah transaksi");
    }
  };

  return (
    <div className="dark:text-white dark:bg-gray-900 max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="dark:text-white dark:bg-gray-900 text-2xl mb-4 font-bold text-center">Tambah Transaksi</h2>
      <form onSubmit={handleSubmit} className="dark:text-white dark:bg-gray-900 space-y-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="dark:text-white dark:bg-gray-900 w-full p-2 border rounded">
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <input
          type="number"
          placeholder="Jumlah"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="dark:text-white dark:bg-gray-900 w-full p-2 border rounded"
          required
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="dark:text-white dark:bg-gray-900 w-full p-2 border rounded">
          <option value="IDR">IDR (Rp)</option>
          <option value="THB">THB (฿)</option>
        </select>
        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value
