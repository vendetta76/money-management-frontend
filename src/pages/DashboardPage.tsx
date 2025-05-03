import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import StatCard from "../components/StatCard"
import CardBalance from "../components/CardBalance"
import Sidebar from "../components/Sidebar"
import { DollarSign, ShoppingCart, Eye } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Savings", value: 400 },
  { name: "Investments", value: 300 },
  { name: "Expenses", value: 300 },
]

const COLORS = ["#4F46E5", "#22C55E", "#EF4444"]

const DashboardPage = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
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

          {/* Card Balance */}
          <CardBalance
            initialBalance={53250000}
            cardHolder="Jonas"
            cardNumber="**** **** **** 6252"
            expiry="02/25"
          />

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Profit"
              value="$82,373.21"
              change="+3.4% dari bulan lalu"
              changeType="positive"
              icon={<DollarSign />}
            />
            <StatCard
              title="Total Orders"
              value="7,234"
              change="-2.8% dari bulan lalu"
              changeType="negative"
              icon={<ShoppingCart />}
            />
            <StatCard
              title="Impression"
              value="3.1M"
              change="+4.6% dari bulan lalu"
              changeType="positive"
              icon={<Eye />}
            />
          </div>

          {/* Donut Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Distribusi Keuangan
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                    labelStyle={{ color: "#9ca3af" }}
                  />
                </Tooltip>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
