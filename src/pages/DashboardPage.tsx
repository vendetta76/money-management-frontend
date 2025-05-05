
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import CardBalance from "../components/CardBalance"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { ArrowUpRight, ArrowDownLeft, PlusCircle } from "lucide-react"

const COLORS = ["#22C55E", "#EF4444"]

const DashboardPage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [income, setIncome] = useState(5000000)
  const [outcome, setOutcome] = useState(2500000)

  const chartData = [
    { name: "Pemasukan", value: income },
    { name: "Pengeluaran", value: outcome },
  ]

  const totalBalance = income - outcome

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selamat datang kembali, {user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut().then(() => navigate("/login"))}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CardBalance title="Saldo Total" value={`Rp ${totalBalance.toLocaleString("id-ID")}`} />
          <CardBalance title="Pemasukan" value={`Rp ${income.toLocaleString("id-ID")}`} icon={ArrowUpRight} />
          <CardBalance title="Pengeluaran" value={`Rp ${outcome.toLocaleString("id-ID")}`} icon={ArrowDownLeft} />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Rasio Pemasukan vs Pengeluaran
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {chartData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="flex justify-center">
          <button
            onClick={() => navigate("/wallet")}
            className="flex items-center gap-2 text-purple-700 hover:text-white border border-purple-700 hover:bg-purple-700 px-5 py-3 rounded-lg transition"
          >
            <PlusCircle className="w-5 h-5" />
            Tambah Wallet / Kategori
          </button>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
