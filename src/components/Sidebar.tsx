import { useEffect, useState } from "react"
import {
  Home,
  LogOut as LogOutIcon,
  Sun,
  Moon,
  Settings,
  Wallet,
  PiggyBank,
  Receipt,
  Clock,
  ChevronDown,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const avatar = "https://res.cloudinary.com/dvbn6oqlp/image/upload/v1746252421/Default_pfp_zoecp6.webp"

const Sidebar = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark")
  const [isTransactionOpen, setIsTransactionOpen] = useState(true)
  const navigate = useNavigate()
  const { user, userMeta, signOut } = useAuth()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <aside className="bg-white dark:bg-gray-900 border-r dark:border-gray-800 min-h-screen p-4 w-64 flex flex-col justify-between">
      <div>
        {/* Brand */}
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-6">MoniQ</h1>

        {/* Profile */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src={avatar} className="w-16 h-16 rounded-full mb-2" />
          <p className="text-sm font-semibold text-gray-700 dark:text-white">
            {userMeta?.name || user?.displayName || "User"}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-300">
            {userMeta?.role === "premium" ? "💎 Premium" : "🧑‍💻 Regular"}
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
              isActive
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`
          }>
            <Home size={18} /> Dashboard
          </NavLink>

          <NavLink to="/wallet" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
              isActive
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`
          }>
            <Wallet size={18} /> Wallet
          </NavLink>

          <div>
            <button
              onClick={() => setIsTransactionOpen(!isTransactionOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <span className="flex items-center gap-2">
                <ChevronDown className={`w-4 h-4 transition-transform ${isTransactionOpen ? "rotate-180" : ""}`} />
                Transaction
              </span>
            </button>

            {isTransactionOpen && (
              <div className="pl-8 mt-1 space-y-1">
                <NavLink
                  to="/income"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-300 hover:text-purple-500"
                    }`
                  }
                >
                  <PiggyBank size={16} className="inline mr-1" /> Income
                </NavLink>
                <NavLink
                  to="/outcome"
                  className={({ isActive }) =>
                    `block py-1 text-sm ${
                      isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-300 hover:text-purple-500"
                    }`
                  }
                >
                  <Receipt size={16} className="inline mr-1" /> Outcome
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/history" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
              isActive
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`
          }>
            <Clock size={18} /> History
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
              isActive
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`
          }>
            <Settings size={18} /> Settings
          </NavLink>
        </nav>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-sm text-red-600 dark:text-red-400 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
        >
          <LogOutIcon size={16} /> Logout
        </button>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 px-3">
          Dark Mode
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-600 relative transition duration-300">
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar