import { useState, useEffect } from "react"
import LayoutShell from "../layouts/LayoutShell"
import { useAuth } from "../context/AuthContext"
import { db } from "../lib/firebaseClient"
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore"
import { Search } from "lucide-react"

interface EditEntry {
  description: string
  amount: number
  editedAt: any
}

interface HistoryEntry {
  id?: string
  type: "income" | "outcome"
  wallet: string
  currency: string
  description: string
  amount: number
  createdAt?: any
  editHistory?: EditEntry[]
  notes?: string // Assuming notes might be part of the data
}

interface WalletEntry {
  id?: string
  name: string
  currency: string
}

const HistoryPage = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [customDate, setCustomDate] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedWallet, setSelectedWallet] = useState("all")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [wallets, setWallets] = useState<WalletEntry[]>([])

  useEffect(() => {
    if (!user) return

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"))
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"))
    const walletQuery = collection(db, "users", user.uid, "wallets")

    const unsubIn = onSnapshot(incomeQuery, (snapshot) => {
      const incomes = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "income",
        ...doc.data(),
      })) as HistoryEntry[]

      setHistory((prev) => {
        const others = prev.filter((item) => item.type !== "income")
        return [...incomes, ...others].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      })
    })

    const unsubOut = onSnapshot(outcomeQuery, (snapshot) => {
      const outcomes = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "outcome",
        ...doc.data(),
      })) as HistoryEntry[]

      setHistory((prev) => {
        const others = prev.filter((item) => item.type !== "outcome")
        return [...others, ...outcomes].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      })
    })

    const unsubWallet = onSnapshot(walletQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletEntry[]
      setWallets(data)
    })

    return () => {
      unsubIn()
      unsubOut()
      unsubWallet()
    }
  }, [user])

  const isInSelectedDateRange = (date: Date) => {
    const now = new Date()
    const itemDate = new Date(date)

    if (selectedDateRange === "today") {
      return itemDate.toDateString() === now.toDateString()
    }

    if (selectedDateRange === "yesterday") {
      const yesterday = new Date()
      yesterday.setDate(now.getDate() - 1)
      return itemDate.toDateString() === yesterday.toDateString()
    }

    if (selectedDateRange === "last7") {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(now.getDate() - 7)
      return itemDate >= sevenDaysAgo && itemDate <= now
    }

    if (selectedDateRange === "thisMonth") {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      )
    }

    if (selectedDateRange === "custom") {
      return customDate &&
        itemDate.toISOString().split("T")[0] === customDate
    }

    return true
  }

  const filtered = history.filter((item) => {
    const matchType = selectedType === "all" || item.type === selectedType
    const matchWallet = selectedWallet === "all" || item.wallet === selectedWallet
    const matchSearch = item.description.toLowerCase().includes(search.toLowerCase())
    const matchDate = isInSelectedDateRange(new Date(item.createdAt?.toDate?.() ?? item.createdAt))
    return matchType && matchWallet && matchSearch && matchDate
  })

  const getWalletName = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    return wallet ? wallet.name : `${walletId} (Telah dihapus)`
  }

  const getWalletCurrency = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    return wallet ? wallet.currency : "-"
  }

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-6 max-w-screen-2xl mx-auto bg-white dark:bg-gray-900 dark:text-white">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300 mb-6">📜 Riwayat Transaksi</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">Semua Tanggal</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="last7">7 Hari Terakhir</option>
              <option value="thisMonth">Bulan Ini</option>
              <option value="custom">📆 Tanggal Khusus</option>
            </select>
            {selectedDateRange === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            )}
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">Semua Jenis</option>
            <option value="income">Income</option>
            <option value="outcome">Outcome</option>
          </select>
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">Semua Dompet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" size={18} />
            <input
              type="text"
              placeholder="Cari deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 text-center py-8">Tidak ada transaksi ditemukan.</p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-md hover:shadow-lg transition-all border-l-4"
                style={{ borderColor: item.type === "income" ? "#22C55E" : "#EF4444" }}
                title={`${item.type === 'income' ? 'Income' : 'Outcome'}: ${item.description} (Dompet: ${getWalletName(item.wallet)})`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <span className="text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300">
                    {item.type === "income" ? "📥 Income" : "📤 Outcome"} • {getWalletName(item.wallet)} ({getWalletCurrency(item.wallet)})
                  </span>
                  <span
                    className={`text-sm sm:text-base font-semibold ${item.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                  >
                    {item.type === "income" ? "+" : "-"} Rp {item.amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-100">
                  {item.description}
                  {item.editHistory && item.editHistory.length > 0 && (
                    <span className="text-xs text-blue-500 dark:text-blue-400 ml-2">(edited)</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(item.createdAt?.toDate?.() ?? item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
                {item.editHistory && item.editHistory.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <p className="font-semibold mb-2">Histori Perubahan:</p>
                    <ul className="list-disc ml-5 space-y-1.5">
                      {item.editHistory.map((log, i) => (
                        <li key={i}>
                          {new Date(log.editedAt?.toDate?.() ?? log.editedAt).toLocaleString("id-ID")}: {log.description} - Rp {log.amount.toLocaleString("id-ID")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </LayoutShell>
  )
}

export default HistoryPage