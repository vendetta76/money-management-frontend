import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import CardBalance from "../components/CardBalance"
import PremiumOnly from "../components/PremiumOnly"
import { Pencil } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useState } from "react"

const data = [
  { name: "Savings", value: 400 },
  { name: "Investments", value: 300 },
  { name: "Expenses", value: 300 },
]

const COLORS = ["#4F46E5", "#22C55E", "#EF4444"]

const DashboardPage = () => {
  const { signOut, userMeta } = useAuth()
  const navigate = useNavigate()

  const [labels, setLabels] = useState([
    "Pemasukan",
    "Pengeluaran",
    "Saldo Investasi"
  ])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  const handleLabelChange = (index: number, newLabel: string) => {
    const newLabels = [...labels]
    newLabels[index] = newLabel
    setLabels(newLabels)
    setEditingIndex(null)
  }

  const renderLabel = (index: number) => {
    const isEditable =
      userMeta?.role === "premium" || (userMeta?.role === "user" && index < 2)

    if (!isEditable) return labels[index]

    if (editingIndex === index) {
      return (
        <input
          value={labels[index]}
          onChange={(e) => handleLabelChange(index, e.target.value)}
          onBlur={() => setEditingIndex(null)}
          autoFocus
          className="border px-2 py-1 rounded text-sm"
        />
      )
    }

    return (
      <span
        className="flex items-center gap-1 cursor-pointer group"
        onClick={() => setEditingIndex(index)}
      >
        {labels[index]} <Pencil className="w-3 h-3 text-gray-400 group-hover:text-black" />
      </span>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                Dashboard MoniQ 🚀
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Selamat datang di pusat kendali finansialmu, bro.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardBalance
              initialBalance={4000000}
              cardHolder={renderLabel(0)}
              cardNumber=""
              expiry=""
            />
            <CardBalance
              initialBalance={2000000}
              cardHolder={renderLabel(1)}
              cardNumber=""
              expiry=""
            />
            <PremiumOnly>
              <CardBalance
                initialBalance={1500000}
                cardHolder={renderLabel(2)}
                cardNumber=""
                expiry=""
              />
            </PremiumOnly>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-white">
              Distribusi Keuangan
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {data.map((_, index) => (
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
