
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
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat2,
  Search
} from "lucide-react"

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
  notes?: string
}

interface TransferEntry {
  id?: string
  from: string
  to: string
  amount: number
  currency: string
  description: string
  createdAt?: any
  type?: "transfer"
}

interface WalletEntry {
  id?: string
  name: string
  currency: string
}

type UnifiedEntry = HistoryEntry | (TransferEntry & { type: "transfer" })

const HistoryPage = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedDateRange, setSelectedDateRange] = useState("all")
  const [customDate, setCustomDate] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedWallet, setSelectedWallet] = useState("all")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [transfers, setTransfers] = useState<TransferEntry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    if (!user) return

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"))
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"))
    const walletQuery = collection(db, "users", user.uid, "wallets")
    const transferQuery = collection(db, "transfers")

    const unsubIn = onSnapshot(incomeQuery, (snapshot) => {
      const incomes = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "income",
        ...doc.data(),
      })) as HistoryEntry[]

      setHistory((prev) => {
        const others = prev.filter((item) => item.type !== "income")
        return [...incomes, ...others]
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
        return [...others, ...outcomes]
      })
    })

    const unsubWallet = onSnapshot(walletQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletEntry[]
      setWallets(data)
    })

    const unsubTransfer = onSnapshot(transferQuery, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((doc: any) => doc.userId === user.uid)
        .map((doc) => ({ ...doc, type: "transfer" })) as TransferEntry[]
      setTransfers(data)
    })

    return () => {
      unsubIn()
      unsubOut()
      unsubWallet()
      unsubTransfer()
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

  const mergedHistory: UnifiedEntry[] = [
    ...history,
    ...transfers
  ].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))

  const filtered = mergedHistory.filter((item) => {
    const matchType =
      selectedType === "all" || item.type === selectedType;

    const matchWallet =
      selectedWallet === "all" ||
      (item.type === "transfer"
        ? item.from === selectedWallet || item.to === selectedWallet
        : item.wallet === selectedWallet);

    const matchSearch =
      "description" in item &&
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchDate = isInSelectedDateRange(
      new Date(item.createdAt?.toDate?.() ?? item.createdAt)
    );

    return matchType && matchWallet && matchSearch && matchDate;
  })

  const groupedByDate: { [date: string]: UnifiedEntry[] } = {};
  filtered.forEach((item) => {
    const d = new Date(item.createdAt?.seconds * 1000);
    const dateStr = d.toISOString().split("T")[0];
    if (!groupedByDate[dateStr]) {
      groupedByDate[dateStr] = [];
    }
    groupedByDate[dateStr].push(item);
  });

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
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            <option value="all">Semua Jenis</option>
            <option value="income">Income</option>
            <option value="outcome">Outcome</option>
            <option value="transfer">Transfer</option>
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

        {Object.entries(groupedByDate).length === 0 ? (
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-300 text-center py-8">Tidak ada transaksi ditemukan.</p>
        ) : (
          <div className="grid gap-4">
            {Object.entries(groupedByDate).map(([dateStr, entries]) => (
              <div key={dateStr}>
                <div className="sticky top-0 bg-gray-100 dark:bg-gray-800 py-1 px-2 text-sm font-semibold text-gray-600 dark:text-gray-300 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
                  {new Date(dateStr).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
                <div className="grid gap-4 mt-2">
                  {entries.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleExpand(item.id!)}
                      className={`cursor-pointer p-4 sm:p-5 rounded-xl border-l-4 shadow-md transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:shadow-lg ${
                        item.type === "income"
                          ? "bg-green-50 dark:bg-green-900 border-green-400"
                          : item.type === "outcome"
                          ? "bg-red-50 dark:bg-red-900 border-red-400"
                          : "bg-blue-50 dark:bg-blue-900 border-blue-400"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2 relative">
                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-white">
                          {item.type === "income" && <ArrowDownCircle size={16} />}
                          {item.type === "outcome" && <ArrowUpCircle size={16} />}
                          {item.type === "transfer" && <Repeat2 size={16} />}
                          {item.type === "income"
                            ? `Income • ${getWalletName(item.wallet)}`
                            : item.type === "outcome"
                            ? `Outcome • ${getWalletName(item.wallet)}`
                            : `Transfer • ${item.from} ➡️ ${item.to}`}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-sm font-semibold ${
                            item.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : item.type === "outcome"
                              ? "text-red-500 dark:text-red-400"
                              : "text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {item.type === "income" && <ArrowDownCircle size={16} />}
                          {item.type === "outcome" && <ArrowUpCircle size={16} />}
                          {item.type === "transfer" && <Repeat2 size={16} />}
                          {item.currency} {item.amount.toLocaleString("id-ID")}
                        </span>
                        <div className="absolute top-1 right-1 text-gray-400 dark:text-gray-500 text-lg">
                          {expandedId === item.id ? "🔼" : "🔽"}
                        </div>
                      </div>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden text-sm mt-3 space-y-2 ${
                          expandedId === item.id ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        {"description" in item && item.description && (
                          <div className="text-gray-600 dark:text-gray-200">
                            ✏️ <span className="font-medium">Deskripsi:</span> {item.description}
                          </div>
                        )}

                        {"editHistory" in item && item.editHistory && item.editHistory.length > 0 && (
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                            <p className="font-semibold mb-2">Histori Perubahan:</p>
                            <ul className="list-disc ml-5 space-y-1.5">
                              {item.editHistory.map((log, i) => (
                                <li key={i}>
                                  {new Date(log.editedAt?.toDate?.() ?? log.editedAt).toLocaleString("id-ID")}: {log.description} - Rp{" "}
                                  {log.amount.toLocaleString("id-ID")}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {new Date(item.createdAt?.seconds * 1000).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </LayoutShell>
  )
}

export default HistoryPage
