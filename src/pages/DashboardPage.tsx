import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import { db } from "../lib/firebaseClient"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { format } from "date-fns"
import { id as localeID } from "date-fns/locale"
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie
} from "recharts"

const COLORS = ["#10B981", "#EF4444"]

interface Transaction {
  id?: string
  type: "income" | "outcome"
  description: string
  amount: number
  createdAt: any
}

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [income, setIncome] = useState(0)
  const [outcome, setOutcome] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!user) return

    const incomeRef = collection(db, "users", user.uid, "incomes")
    const outcomeRef = collection(db, "users", user.uid, "outcomes")

    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      let total = 0
      const newTrans: Transaction[] = []

      snap.forEach(doc => {
        const data = doc.data()
        total += data.amount || 0
        newTrans.push({
          ...data,
          type: "income",
          id: doc.id,
        })
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
        newTrans.push({
          ...data,
          type: "outcome",
          id: doc.id,
        })
      })

      setOutcome(total)
      setTransactions((prev) => [...prev, ...newTrans])
    })

    return () => {
      unsubIncomes()
      unsubOutcomes()
    }
  }, [user])

  const totalBalance = income - outcome

  const sortedTx = transactions
    .filter((tx) => tx.createdAt)
    .sort((a, b) =>
      b.createdAt?.seconds - a.createdAt?.seconds
    )
    .slice(0, 5)

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Selamat datang kembali, {user?.email}
            </p>
          </div>
        </div>

        {/* Pie Chart Summary */}
        <div className="bg-white p-6 rounded-xl shadow col-span-3 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Distribusi Pemasukan vs Pengeluaran</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: "Pemasukan", value: income },
                  { name: "Pengeluaran", value: outcome }
                ]}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                <Cell fill="#10B981" />
                <Cell fill="#EF4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 mb-1">Pemasukan</p>
            <h2 className="text-xl font-semibold text-green-500 mb-2">Rp {income.toLocaleString("id-ID")}</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 mb-1">Pengeluaran</p>
            <h2 className="text-xl font-semibold text-red-500 mb-2">Rp {outcome.toLocaleString("id-ID")}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow col-span-2">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Ringkasan Grafik</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: "Pemasukan", value: income },
                { name: "Pengeluaran", value: outcome }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Transaksi Terbaru</h3>
            <ul className="space-y-4">
              {sortedTx.map((tx) => (
                <li key={tx.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-400">
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
        </div>
      </main>
    </div>
  )
}

export default DashboardPage