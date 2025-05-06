import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LayoutShell from "../layouts/LayoutShell"
import { useAuth } from "../context/AuthContext"
import { db } from "../lib/firebaseClient"
import { collection, onSnapshot } from "firebase/firestore"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie
} from "recharts"

const COLORS = ["#10B981", "#EF4444", "#6366F1", "#F59E0B", "#06B6D4"]

interface Transaction {
  id?: string
  type: "income" | "outcome"
  description: string
  amount: number
  createdAt: any
}

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [income, setIncome] = useState(0)
  const [outcome, setOutcome] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<any[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState("all")

  useEffect(() => {
    if (!user) return

    const incomeRef = collection(db, "users", user.uid, "incomes")
    const outcomeRef = collection(db, "users", user.uid, "outcomes")
    const walletRef = collection(db, "users", user.uid, "wallets")

    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      let total = 0
      const newTrans: Transaction[] = []

      snap.forEach(doc => {
        const data = doc.data()
        total += data.amount || 0
        newTrans.push({ ...data, type: "income", id: doc.id })
      })

      setIncome(total)
      setTransactions((prev) => [...prev, ...newTrans])
    })

    const unsubOutcomes = onSnapshot(outcomeRef, (snap) => {
      let total = 0
      const newTrans: Transaction[] = []

      snap.forEach(doc => {
        const data = doc.data()
        total += data.amount || 0
        newTrans.push({ ...data, type: "outcome", id: doc.id })
      })

      setOutcome(total)
      setTransactions((prev) => [...prev, ...newTrans])
    })

    const unsubWallets = onSnapshot(walletRef, (snap) => {
      const walletData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setWallets(walletData)
    })

    return () => {
      unsubIncomes()
      unsubOutcomes()
      unsubWallets()
    }
  }, [user])

  const totalBalance = income - outcome
  const sortedTx = transactions
    .filter((tx) => tx.createdAt)
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    .slice(0, 5)

  const allCurrencies = Array.from(new Set(wallets.map(w => w.currency)))
  const filteredWallets = selectedCurrency === "all"
    ? wallets
    : wallets.filter(w => w.currency === selectedCurrency)

  const total = filteredWallets.reduce((acc, wallet) => acc + (wallet.balance || 0), 0)
  const pieData = filteredWallets.map(wallet => ({
    name: wallet.name,
    value: wallet.balance,
  }))

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Selamat datang kembali, {user?.email}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-200 mb-2">Filter Mata Uang</label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-white shadow"
          >
            <option value="all">Semua</option>
            {allCurrencies.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 dark:text-white p-4 md:p-6 rounded-xl shadow">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">Distribusi Wallet (Pie)</h2>
            <div className="w-full h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 dark:text-white p-4 md:p-6 rounded-xl shadow">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">
              Total Saldo {selectedCurrency === "all" ? "(Semua)" : selectedCurrency}
            </h2>
            <div className="w-full h-48 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: selectedCurrency.toUpperCase(), value: total }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    <Cell fill="#6366F1" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:text-white p-4 md:p-6 rounded-xl shadow mt-6">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">Transaksi Terbaru</h3>
          <ul className="space-y-4">
            {sortedTx.map((tx) => (
              <li key={tx.id} className="flex justify-between items-start text-sm flex-col sm:flex-row gap-2 sm:gap-0">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-300">
                    {tx.createdAt?.toDate
                      ? format(new Date(tx.createdAt.toDate()), "dd MMM yyyy, HH:mm", { locale: localeID })
                      : "-"}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}>
                  {tx.type === "income" ? "+" : "-"} Rp {tx.amount.toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </LayoutShell>
  )
}

export default DashboardPage
