import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../lib/firebaseClient"
import { collection, onSnapshot } from "firebase/firestore"
import Sidebar from "../components/Sidebar"
import CardBalance from "../components/CardBalance"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#4F46E5", "#22C55E", "#EF4444"]

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const [totalBalance, setTotalBalance] = useState(0)
  const [chartData, setChartData] = useState([
    { name: "Savings", value: 400 },
    { name: "Investments", value: 300 },
    { name: "Expenses", value: 300 },
  ])

  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "wallets"),
      (snapshot) => {
        const wallets = snapshot.docs.map((doc) => doc.data())
        const total = wallets.reduce((sum, w: any) => sum + (w.balance || 0), 0)
        setTotalBalance(total)
      }
    )

    return () => unsubscribe()
  }, [user])

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Welcome back!</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <CardBalance title="Total Balance" value={`$${totalBalance.toFixed(2)}`} />
          <CardBalance title="Pemasukan" value="$0.00" />
          <CardBalance title="Pengeluaran" value="$0.00" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Spending Overview</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
