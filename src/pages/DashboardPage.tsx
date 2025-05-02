import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import StatCard from "../components/StatCard"
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Dashboard MoniQ 🚀</h1>
            <p className="text-gray-600 mt-1">Selamat datang di pusat kendali finansialmu, bro.</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

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
        <div className="bg-white p-6 rounded-xl shadow mt-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Distribusi Keuangan</h2>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
