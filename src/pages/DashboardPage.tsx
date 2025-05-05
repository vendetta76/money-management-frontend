
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import { db } from "../lib/firebaseClient"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = ["#6366F1", "#10B981", "#EF4444", "#F59E0B"]

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [income, setIncome] = useState(0)
  const [outcome, setOutcome] = useState(0)
  const [activityData, setActivityData] = useState([])

  useEffect(() => {
    if (!user) return

    const incomeQuery = query(
      collection(db, "users", user.uid, "transactions"),
      where("type", "==", "income")
    )

    const outcomeQuery = query(
      collection(db, "users", user.uid, "transactions"),
      where("type", "==", "outcome")
    )

    const unsubIncome = onSnapshot(incomeQuery, (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)
      setIncome(total)
    })

    const unsubOutcome = onSnapshot(outcomeQuery, (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0)
      setOutcome(total)
    })

    return () => {
      unsubIncome()
      unsubOutcome()
    }
  }, [user])

  const chartData = [
    { name: "Pemasukan", value: income },
    { name: "Pengeluaran", value: outcome },
  ]

  const totalBalance = income - outcome

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6 col-span-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Balance statistic</h2>
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Spent", value: outcome },
                    { name: "Left", value: totalBalance },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={450}
                  dataKey="value"
                >
                  <Cell fill="#6366F1" />
                  <Cell fill="#E5E7EB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <h1 className="text-2xl font-bold mt-2">Rp {totalBalance.toLocaleString("id-ID")}</h1>
            <p className="text-sm text-gray-500">Saldo tersisa</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Incoming</h2>
            <h1 className="text-xl font-bold text-gray-800 mb-4">Rp {income.toLocaleString("id-ID")}</h1>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={[{ amt: 1000 }, { amt: 2000 }, { amt: income }]}>
                <Line type="monotone" dataKey="amt" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Outgoing</h2>
            <h1 className="text-xl font-bold text-gray-800 mb-4">Rp {outcome.toLocaleString("id-ID")}</h1>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={[{ amt: 500 }, { amt: 1800 }, { amt: outcome }]}>
                <Line type="monotone" dataKey="amt" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6 col-span-2">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">Analytics</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">Quick Action</h2>
            <p className="text-xs text-gray-400 mb-3">Akses cepat data keuangan kamu</p>
            <button
              onClick={() => navigate("/income")}
              className="block w-full text-left px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded mb-2"
            >
              + Tambah Pemasukan
            </button>
            <button
              onClick={() => navigate("/outcome")}
              className="block w-full text-left px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              - Tambah Pengeluaran
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
