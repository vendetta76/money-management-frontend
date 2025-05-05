
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import { db } from "../lib/firebaseClient"
import { collection, onSnapshot } from "firebase/firestore"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts"

const COLORS = ["#10B981", "#EF4444"]

const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [incomeByCurrency, setIncomeByCurrency] = useState<Record<string, number>>({})
  const [outcomeByCurrency, setOutcomeByCurrency] = useState<Record<string, number>>({})
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const unsubIncomes = onSnapshot(collection(db, "users", user.uid, "incomes"), (snap) => {
      const map: Record<string, number> = {}
      const items: any[] = []
      snap.forEach((doc) => {
        const d = doc.data()
        map[d.currency] = (map[d.currency] || 0) + d.amount
        items.push({ ...d, type: "income" })
      })
      setIncomeByCurrency(map)
      setTransactions((prev) => [...prev, ...items])
    })

    const unsubOutcomes = onSnapshot(collection(db, "users", user.uid, "outcomes"), (snap) => {
      const map: Record<string, number> = {}
      const items: any[] = []
      snap.forEach((doc) => {
        const d = doc.data()
        map[d.currency] = (map[d.currency] || 0) + d.amount
        items.push({ ...d, type: "outcome" })
      })
      setOutcomeByCurrency(map)
      setTransactions((prev) => [...prev, ...items])
    })

    return () => {
      unsubIncomes()
      unsubOutcomes()
    }
  }, [user])

  const currencies = Array.from(new Set([
    ...Object.keys(incomeByCurrency),
    ...Object.keys(outcomeByCurrency)
  ]))

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Dashboard</h1>
            <p className="text-sm text-gray-500">Multi-Currency Aware View</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow col-span-3 text-center">
            <h2 className="text-sm text-gray-500 mb-4">Perbandingan Total Pemasukan vs Pengeluaran (semua mata uang)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Pemasukan", value: Object.values(incomeByCurrency).reduce((a, b) => a + b, 0) },
                    { name: "Pengeluaran", value: Object.values(outcomeByCurrency).reduce((a, b) => a + b, 0) },
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currencies.map((cur) => (
            <div key={cur} className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">Analitik - {cur}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: "Pemasukan", value: incomeByCurrency[cur] || 0 },
                  { name: "Pengeluaran", value: outcomeByCurrency[cur] || 0 }
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
          ))}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
