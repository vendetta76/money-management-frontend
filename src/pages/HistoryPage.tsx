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
      <main className="2xl:px-20 max-w-screen-2xl md:ml-64 md:px-8 min-h-screen mx-auto pt-4 px-4 sm:px-6 w-full xl:px-12">
        <h1 className="dark:text-purple-300 font-bold mb-4 text-2xl text-purple-700">📜 Riwayat Transaksi</h1>

        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="md:w-1/3 relative sm:w-1/2 w-full">
            <Search className="absolute dark:text-white left-3 text-gray-400 top-2.5" size={16} />
            <input
              type="text"
              placeholder="Cari deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border dark:bg-gray-800 dark:border-gray-700 dark:text-white pl-10 pr-3 py-2 rounded-lg w-full"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border dark:bg-gray-800 dark:border-gray-700 dark:text-white px-4 py-2 rounded-lg sm:w-auto w-full"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="dark:text-gray-300 dark:text-white text-gray-500 text-sm">Tidak ada transaksi ditemukan.</p>
        ) : (
          <div className="gap-4 grid">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white border-l-4 dark:bg-gray-800 dark:bg-gray-900 dark:border-gray-700 hover:shadow-md p-4 rounded-xl shadow transition"
                style={{ borderColor: item.type === "income" ? "#22C55E" : "#EF4444" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="dark:text-gray-300 dark:text-white font-semibold text-gray-600 text-sm">
                    {item.type === "income" ? "📥 Income" : "📤 Outcome"} • {getWalletName(item.wallet)} ({getWalletCurrency(item.wallet)})
                  </span>
                  <span
                    className={`text-sm font-semibold ${item.type === "income" ? "text-green-600" : "text-red-500"}`}
                  >
                    {item.type === "income" ? "+" : "-"} Rp {item.amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="dark:text-gray-100 dark:text-white text-gray-700 text-sm">
                  {item.description}
                  {item.editHistory && item.editHistory.length > 0 && (
                    <span className="ml-2 text-blue-500 text-xs">(edited)</span>
                  )}
                </div>
                <div className="dark:text-white mt-1 text-gray-400 text-xs">
                  {new Date(item.createdAt?.toDate?.() ?? item.createdAt).toLocaleDateString("id-ID")}
                </div>
                {item.editHistory && item.editHistory.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:text-white mt-2 p-2 rounded text-gray-500 text-xs">
                    <p className="font-semibold mb-1">Histori Perubahan:</p>
                    <ul className="list-disc ml-5 space-y-1">
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
