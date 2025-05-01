
import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "../../utils/toast";
import MainLayout from "../../layout/MainLayout";

export default function DashboardPage() {
  return (
    <MainLayout>
      <Dashboard /> {/* komponen dashboard kamu */}
    </MainLayout>
  );
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [balanceIDR, setBalanceIDR] = useState(0);
  const [balanceTHB, setBalanceTHB] = useState(0);
  const [form, setForm] = useState({
    type: "income",
    amount: "",
    currency: "IDR",
    description: ""
  });
  const [showModal, setShowModal] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transaction/user");
      setTransactions(res.data.transactions);

      let idr = 0;
      let thb = 0;
      res.data.transactions.forEach((trx) => {
        const amt = trx.type === "income" ? trx.amount : -trx.amount;
        if (trx.currency === "IDR") idr += amt;
        else if (trx.currency === "THB") thb += amt;
      });
      setBalanceIDR(idr);
      setBalanceTHB(thb);
    } catch (error) {
      toast.fire({ icon: "error", title: "Gagal mengambil data" });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/transaction", form);
      setForm({ type: "income", amount: "", currency: "IDR", description: "" });
      setShowModal(false);
      fetchTransactions();
      toast.fire({ icon: "success", title: "Transaksi ditambahkan!" });
    } catch (error) {
      toast.fire({ icon: "error", title: "Gagal menambahkan transaksi" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Dashboard Keuangan</h1>

        {/* Kartu Saldo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow hover:scale-105 transition text-center">
            <h2 className="text-gray-500">Saldo IDR</h2>
            <p className="text-2xl font-bold text-green-600">Rp {balanceIDR.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:scale-105 transition text-center">
            <h2 className="text-gray-500">Saldo THB</h2>
            <p className="text-2xl font-bold text-blue-600">฿ {balanceTHB.toLocaleString()}</p>
          </div>
        </div>

        <div className="text-center mb-10">
          <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
            + Tambah Transaksi
          </button>
        </div>

        {/* Table Transaksi */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Histori Transaksi</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-500">Belum ada transaksi.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-2">Tanggal</th>
                  <th className="p-2">Tipe</th>
                  <th className="p-2">Jumlah</th>
                  <th className="p-2">Mata Uang</th>
                  <th className="p-2">Deskripsi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => (
                  <tr key={trx._id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{trx.createdAt.substring(0, 10)}</td>
                    <td className="p-2 capitalize">{trx.type}</td>
                    <td className="p-2">{trx.amount.toLocaleString()}</td>
                    <td className="p-2">{trx.currency}</td>
                    <td className="p-2">{trx.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Tambah Transaksi */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-center">Tambah Transaksi</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <select className="w-full border p-2 rounded" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input
                  type="number"
                  className="w-full border p-2 rounded"
                  placeholder="Jumlah"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
                <select className="w-full border p-2 rounded" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="IDR">IDR</option>
                  <option value="THB">THB</option>
                </select>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="Deskripsi"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
                <div className="flex justify-between">
                  <button type="button" onClick={() => setShowModal(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                    Batal
                  </button>
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
