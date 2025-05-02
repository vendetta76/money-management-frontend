import { Home, User, ShoppingCart, BarChart } from "lucide-react"
import { NavLink } from "react-router-dom"

const navItems = [
  { label: "Dashboard", icon: <Home size={18} />, href: "/dashboard" },
  { label: "Users", icon: <User size={18} />, href: "/users" },
  { label: "Orders", icon: <ShoppingCart size={18} />, href: "/orders" },
  { label: "Analytics", icon: <BarChart size={18} />, href: "/analytics" },
]

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">MoniQ</h1>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
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
  )
}

export default Sidebar
