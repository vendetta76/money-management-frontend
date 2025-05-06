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
}

interface WalletEntry {
  id?: string
  name: string
  currency: string
}

const HistoryPage = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
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

  const filtered = history.filter((item) => {
    const matchSearch = item.description.toLowerCase().includes(search.toLowerCase())
    const matchDate = selectedDate
      ? new Date(item.createdAt?.toDate?.() ?? item.createdAt).toISOString().split("T")[0] === selectedDate
      : true
    return matchSearch && matchDate
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
      <main className="dark:text-white dark:bg-gray-900 min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 pt-4 md:ml-64 max-w-screen-2xl mx-auto">
        <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold text-purple-700 dark:text-purple-300 mb-4">📜 Riwayat Transaksi</h1>

        <div className="dark:text-white dark:bg-gray-900 flex flex-wrap gap-4 mb-6 items-center">
          <div className="dark:text-white dark:bg-gray-900 relative w-full sm:w-1/2 md:w-1/3">
            <Search className="dark:text-white dark:bg-gray-900 absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dark:text-white dark:bg-gray-900 w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="dark:text-white dark:bg-gray-900 w-full sm:w-auto px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="dark:text-white dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-300 dark:text-gray-300">Tidak ada transaksi ditemukan.</p>
        ) : (
          <div className="dark:text-white dark:bg-gray-900 grid gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="dark:text-white dark:bg-gray-900 bg-white dark:bg-gray-900 dark:bg-gray-800 p-4 rounded-xl shadow hover:shadow-md transition border-l-4"
                style={{ borderColor: item.type === "income" ? "#22C55E" : "#EF4444" }}
              >
                <div className="dark:text-white dark:bg-gray-900 flex items-center justify-between mb-2">
                  <span className="dark:text-white dark:bg-gray-900 text-sm font-semibold text-gray-600 dark:text-gray-300 dark:text-gray-300">
                    {item.type === "income" ? "📥 Income" : "📤 Outcome"} • {getWalletName(item.wallet)} ({getWalletCurrency(item.wallet)})
                  </span>
                  <span
                    className={`text-sm font-semibold ${item.type === "income" ? "text-green-600" : "text-red-500"}`}
                  >
                    {item.type === "income" ? "+" : "-"} Rp {item.amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="dark:text-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-100">
                  {item.description}
                  {item.editHistory && item.editHistory.length > 0 && (
                    <span className="dark:text-white dark:bg-gray-900 text-xs text-blue-500 ml-2">(edited)</span>
                  )}
                </div>
                <div className="dark:text-white dark:bg-gray-900 text-xs text-gray-400 mt-1">
                  {new Date(item.createdAt?.toDate?.() ?? item.createdAt).toLocaleDateString("id-ID")}
                </div>
                {item.editHistory && item.editHistory.length > 0 && (
                  <div className="dark:text-white dark:bg-gray-900 mt-2 text-xs text-gray-500 dark:text-gray-300 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    <p className="dark:text-white dark:bg-gray-900 font-semibold mb-1">Histori Perubahan:</p>
                    <ul className="dark:text-white dark:bg-gray-900 list-disc ml-5 space-y-1">
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
