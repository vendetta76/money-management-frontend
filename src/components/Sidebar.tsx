import { useState } from "react"
import { Home, User, ShoppingCart, BarChart, Menu, X, Sun, Moon } from "lucide-react"
import { NavLink } from "react-router-dom"
import avatar from "../assets/avatar.png" // ganti dengan path sesuai projek lo

const navItems = [
  { label: "Dashboard", icon: <Home size={18} />, href: "/dashboard" },
  { label: "Users", icon: <User size={18} />, href: "/users" },
  { label: "Orders", icon: <ShoppingCart size={18} />, href: "/orders" },
  { label: "Analytics", icon: <BarChart size={18} />, href: "/analytics" },
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <>
      {/* Topbar */}
      <div className="md:hidden p-4 bg-white border-b flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">MoniQ</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-purple-700"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="text-purple-700">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          bg-white border-r min-h-screen p-4 w-64 z-40 fixed md:static top-0 left-0 transform md:translate-x-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:block
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700 hidden md:block">MoniQ</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-purple-700"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <img
              src={avatar}
              alt="User"
              className="w-8 h-8 rounded-full border"
            />
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
                  isActive ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
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
