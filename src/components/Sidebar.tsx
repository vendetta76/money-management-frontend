import { useEffect, useRef, useState } from "react"
import {
  Home, User, ShoppingCart, BarChart, Menu, X, Sun, Moon,
  LogOut, Settings
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../lib/firebase"

const avatar = "https://res.cloudinary.com/dvbn6oqlp/image/upload/v1746252421/Default_pfp_zoecp6.webp"

const navItems = [
  { label: "Dashboard", icon: <Home size={18} />, href: "/dashboard" },
  { label: "Users", icon: <User size={18} />, href: "/users" },
  { label: "Orders", icon: <ShoppingCart size={18} />, href: "/orders" },
  { label: "Analytics", icon: <BarChart size={18} />, href: "/analytics" },
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { user, userMeta } = useAuth()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleBuyPremium = async () => {
    if (!user) return

    const start = new Date()
    const end = new Date()
    end.setDate(start.getDate() + 7)

    await updateDoc(doc(db, "users", user.uid), {
      role: "premium",
      premiumStartDate: start.toISOString(),
      premiumEndDate: end.toISOString(),
      updatedAt: serverTimestamp(),
    })

    window.location.reload()
  }

  return (
    <>
      {/* Topbar for mobile */}
      <div className="md:hidden p-4 bg-white border-b flex justify-between items-center dark:bg-gray-900">
        <h1 className="text-xl font-bold text-purple-700 dark:text-purple-300">MoniQ</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-purple-700 dark:text-purple-300"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-purple-700 dark:text-purple-300">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-gray-900 border-r dark:border-gray-800 min-h-screen p-4 w-64 z-40 fixed md:static top-0 left-0 transform md:translate-x-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:block`}
      >
        <div className="flex justify-between items-center mb-6 relative">
          <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 hidden md:block">MoniQ</h1>
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-purple-700 dark:text-purple-300"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <img
              src={avatar}
              alt="User"
              className="w-8 h-8 rounded-full border cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="absolute top-12 right-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Settings size={16} />
                  Edit Profil
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${
                  isActive
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* 🔐 Status Akun & Premium */}
        {userMeta && (
          <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-white">Status Akun</h3>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-300 text-sm">Role:</span>
              {userMeta.role === "premium" ? (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
                  💎 Premium
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-200 rounded-full">
                  🧑‍💻 User
                </span>
              )}
            </div>

            {userMeta.role === "premium" && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sisa hari premium:{" "}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {userMeta.daysLeft} hari
                </span>
              </p>
            )}

            {userMeta.role !== "premium" && (
              <button
                onClick={handleBuyPremium}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs px-3 py-2 rounded shadow mt-1"
              >
                Beli Premium 7 Hari 🔥
              </button>
            )}
          </div>
        )}
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  )
}

export default Sidebar
