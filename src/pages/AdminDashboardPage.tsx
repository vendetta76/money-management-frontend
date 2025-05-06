import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"
import StatCard from "../components/StatCard"
import { DollarSign, ShoppingCart, Eye } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useEffect } from "react"
import UserManagementPanel from "../components/UserManagementPanel"
import ResetPasswordPanel from "../components/ResetPasswordPanel"
import ActivityLogPanel from "../components/ActivityLogPanel"

const dummyData = [
  { name: "User Data", value: 500 },
  { name: "System Logs", value: 300 },
  { name: "Activity", value: 200 },
]

const COLORS = ["#4F46E5", "#22C55E", "#EF4444"]

const AdminDashboardPage = () => {
  const { signOut, currentUser, userData } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser || userData?.role !== "Admin") {
      navigate("/login")
    }
  }, [currentUser, userData, navigate])

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <div className="dark:text-white dark:bg-gray-900 flex min-h-screen bg-gray-50 dark:bg-gray-900">
      

      <main className="dark:text-white dark:bg-gray-900 flex-1 p-6">
        <div className="dark:text-white dark:bg-gray-900 flex justify-between items-center mb-6">
          <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold text-gray-800 dark:text-white">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="dark:text-white dark:bg-gray-900 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <div className="dark:text-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="User Data" value="500" icon={DollarSign} />
          <StatCard title="System Logs" value="300" icon={ShoppingCart} />
          <StatCard title="Active Admins" value="12" icon={Eye} />
        </div>

        <div className="dark:text-white dark:bg-gray-900 bg-white dark:bg-gray-900 dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="dark:text-white dark:bg-gray-900 text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dummyData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dummyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <UserManagementPanel />
        <ResetPasswordPanel />
        <ActivityLogPanel />
      </main>
    </div>
  )
}

export default AdminDashboardPage
