import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import CardBalance from "../components/CardBalance"
import PremiumOnly from "../components/PremiumOnly"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const chartData = [
  { name: "Savings", value: 400 },
  { name: "Investments", value: 300 },
  { name: "Expenses", value: 300 },
]

const COLORS = ["#4F46E5", "#22C55E", "#EF4444"]

const DashboardPage = () => {
  const { signOut, userMeta } = useAuth()
  const navigate = useNavigate()

  const [balances, setBalances] = useState([0]) // Default saldo pertama = 0

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  const handleAddCard = () => {
    const isPremium = userMeta?.role === "premium"
    const cardCount = balances.length

    if (cardCount === 1) {
      setBalances([...balances, 1500000])
    } else if (cardCount === 2 && isPremium) {
      setBalances([...balances, 2500000])
    } else if (cardCount === 2 && !isPremium) {
      alert("Upgrade ke Premium untuk menambahkan kartu ketiga.")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                Dashboard MoniQ 🚀
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Selamat datang di pusat kendali finansialmu, bro.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {balances.map((amount, index) => {
              const card = (
                <CardBalance
                  key={index}
                  initialBalance={amount}
                  cardHolder={`Jumlah Saldo`}
                  compact
                />
              )

              return index === 2 ? (
                <PremiumOnly key={index}>{card}</PremiumOnly>
              ) : (
                card
              )
            })}

            {/* Tambah Kategori */}
            {balances.length < 3 && (
              <div
                onClick={handleAddCard}
                className="flex flex-col justify-center items-center bg-white dark:bg-gray-800 border-2 border-dashed border-purple-400 rounded-xl w-full h-[160px] cursor-pointer hover:bg-purple-50 transition"
              >
                <span className="text-4xl text-purple-600">+</span>
                <p className="mt-2 text-sm text-gray-600">Tambah Kategori</p>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-white">
              Distribusi Keuangan
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
