import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileBarChart,
  Settings,
} from "lucide-react";
import ThemeSelect from "@/components/ThemeSelect";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

const links = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { to: "/admin/users", label: "Users", icon: <Users size={18} /> },
  { to: "/admin/transactions", label: "Transactions", icon: <CreditCard size={18} /> },
  { to: "/admin/reports", label: "Reports", icon: <FileBarChart size={18} /> },
  { to: "/admin/settings", label: "Settings", icon: <Settings size={18} /> },
];

export default function Sidebar() {
  const { signOut } = useAuth(); // Access signOut function

  return (
    <aside className="md:col-span-1 p-4 bg-gray-100 min-h-screen flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-black">Admin</h2>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md font-medium transition ${
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-800 hover:bg-gray-200"
                  }`
                }
              >
                {link.icon}
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <ThemeSelect />
        <button
          onClick={signOut}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}