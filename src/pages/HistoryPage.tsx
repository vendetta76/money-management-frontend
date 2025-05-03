import { useState } from "react"

interface HistoryEntry {
  type: "income" | "outcome"
  description: string
  amount: number
  category: string
  date: string // ISO format
}

const HistoryPage = () => {
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      type: "income",
      description: "Gaji Bulanan",
      amount: 10000000,
      category: "Gaji",
      date: "2025-05-01",
    },
    {
      type: "outcome",
      description: "Netflix",
      amount: 150000,
      category: "Langganan",
      date: "2025-05-02",
    },
  ])

  const filtered = history.filter((item) => {
    const matchSearch = item.description.toLowerCase().includes(search.toLowerCase())
    const matchDate = selectedDate ? item.date === selectedDate : true
    return matchSearch && matchDate
  })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-4">
        📜 Riwayat Transaksi
      </h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari deskripsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3 dark:bg-gray-800 dark:text-white"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-300">Tidak ada transaksi ditemukan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-white dark:bg-gray-800 rounded shadow">
            <thead>
              <tr className="text-left text-gray-500 border-b dark:border-gray-600">
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Deskripsi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Tanggal</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 dark:text-gray-200">
              {filtered.map((item, i) => (
                <tr key={i} className="border-t dark:border-gray-700">
                  <td className="py-2 px-4 font-semibold">
                    {item.type === "income" ? "📥 Income" : "📤 Outcome"}
                  </td>
                  <td className="py-2 px-4">{item.description}</td>
                  <td className="py-2 px-4">{item.category}</td>
                  <td className="py-2 px-4">
                    {item.type === "income" ? "+" : "-"}{" "}
                    Rp {item.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="py-2 px-4">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
