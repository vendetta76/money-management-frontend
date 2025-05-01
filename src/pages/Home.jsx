import { useEffect, useState } from "react";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Coins, DollarSign } from "lucide-react";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [totalIDR, setTotalIDR] = useState(0);
  const [totalTHB, setTotalTHB] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/transaction/user");
        const trx = res.data.transactions || [];
        setTransactions(trx);

        const idr = trx
          .filter((t) => t.currency === "IDR")
          .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
        const thb = trx
          .filter((t) => t.currency === "THB")
          .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);

        setTotalIDR(idr);
        setTotalTHB(thb);
      } catch (err) {
        console.error("❌ Gagal ambil data transaksi", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter((t) => t.createdAt.startsWith(selectedDate))
      );
    }
  }, [selectedDate, transactions]);

  const chartData = [
    {
      name: "Pemasukan",
      value: filteredTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    },
    {
      name: "Pengeluaran",
      value: filteredTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Coins className="text-purple-500" /> Ringkasan Keuangan
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-tr from-green-100 via-green-200 to-green-100 rounded-xl shadow flex items-center justify-between">
          <div>
            <h2 className="text-sm text-green-600 font-medium">Total Saldo IDR</h2>
            <p className="text-3xl font-bold text-green-800 mt-2">Rp {totalIDR.toLocaleString()}</p>
          </div>
          <DollarSign className="text-green-600 w-8 h-8" />
        </div>
        <div className="p-6 bg-gradient-to-tr from-blue-100 via-blue-200 to-blue-100 rounded-xl shadow flex items-center justify-between">
          <div>
            <h2 className="text-sm text-blue-600 font-medium">Total Saldo THB</h2>
            <p className="text-3xl font-bold text-blue-800 mt-2">฿ {totalTHB.toLocaleString()}</p>
          </div>
          <DollarSign className="text-blue-600 w-8 h-8" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Perbandingan Saldo IDR vs THB</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Saldo IDR", value: totalIDR },
                { name: "Saldo THB", value: totalTHB },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              label
            >
              <Cell fill="#10b981" />
              <Cell fill="#3b82f6" />
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter berdasarkan tanggal:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded w-full max-w-xs dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Histori Transaksi</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              label
            >
              <Cell fill="#22c55e" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-green-50 dark:bg-gray-900 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Daftar Riwayat</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          {filteredTransactions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 p-4">Belum ada transaksi.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((trx) => (
                <li key={trx._id} className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">{trx.description}</p>
                      <p className="text-xs text-gray-400">{trx.createdAt.substring(0, 10)}</p>
                    </div>
                    <p className={`text-sm font-semibold ${trx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {trx.type === "income" ? "+" : "-"} Rp {trx.amount.toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
