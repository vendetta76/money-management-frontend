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
    <div className="bg-white dark:bg-gray-900 max-w-md mt-10 mx-auto p-6 rounded shadow">
      <h2 className="dark:text-white font-bold mb-4 text-2xl text-center">Tambah Transaksi</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="border p-2 rounded w-full">
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>
        <input
          type="number"
          placeholder="Jumlah"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded w-full"
          required
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="border p-2 rounded w-full">
          <option value="IDR">IDR (Rp)</option>
          <option value="THB">THB (฿)</option>
        </select>
        <input
          type="text"
          placeholder="Deskripsi"
          value={description}
          onChange={(e) => setDescription(e.target.value
