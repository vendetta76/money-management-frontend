
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import { db } from "../lib/firebaseClient"
import { collection, onSnapshot } from "firebase/firestore"
import {
  LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

const COLORS = ["#10B981", "#EF4444"]

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [income, setIncome] = useState(0)
  const [outcome, setOutcome] = useState(0)
  const [chartData, setChartData] = useState([
    { name: "Pemasukan", value: 0 },
    { name: "Pengeluaran", value: 0 },
  ])

  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "transactions"),
      (snapshot) => {
        let incomeTotal = 0
        let outcomeTotal = 0

        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.type === "income") {
            incomeTotal += data.amount || 0
          } else if (data.type === "outcome") {
            outcomeTotal += data.amount || 0
          }
        })

        setIncome(incomeTotal)
        setOutcome(outcomeTotal)
        setChartData([
          { name: "Pemasukan", value: incomeTotal },
          { name: "Pengeluaran", value: outcomeTotal },
        ])
      }
    )

    return () => unsubscribe()
  }, [user])

  const totalBalance = income - outcome

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
          <button
            onClick={() => signOut().then(() => navigate("/login"))}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm mb-2">Saldo Tersisa</p>
            <h1 className="text-2xl font-bold text-gray-800">Rp {totalBalance.toLocaleString("id-ID")}</h1>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 mb-1">Incoming</p>
            <h2 className="text-xl font-semibold text-green-500 mb-2">Rp {income.toLocaleString("id-ID")}</h2>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={[{ amt: 0 }, { amt: income }]}>
                <Line type="monotone" dataKey="amt" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-sm text-gray-500 mb-1">Outgoing</p>
            <h2 className="text-xl font-semibold text-red-500 mb-2">Rp {outcome.toLocaleString("id-ID")}</h2>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={[{ amt: 0 }, { amt: outcome }]}>
                <Line type="monotone" dataKey="amt" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow col-span-2">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Analytics</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Quick Action</h3>
            <button
              onClick={() => navigate("/income")}
              className="block w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 mb-2 rounded"
            >
              + Tambah Pemasukan
            </button>
            <button
              onClick={() => navigate("/outcome")}
              className="block w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
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
