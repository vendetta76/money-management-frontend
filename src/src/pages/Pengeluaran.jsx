import { useEffect, useState } from "react";
import API from "../services/api";

export default function Pengeluaran() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/transaction/user");
        const filtered = res.data.transactions.filter(t => t.type === "expense");
        setTransactions(filtered);
      } catch (err) {
        console.error("Gagal mengambil data pengeluaran", err);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-red-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-300 mb-6">💸 Riwayat Pengeluaran</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          {transactions.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">Belum ada data pengeluaran.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((trx) => (
                <li key={trx._id} className="py-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-200">{trx.description}</span>
                    <span className="text-sm font-semibold text-red-600">- Rp {trx.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-400">{trx.createdAt.substring(0, 10)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
