import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, LogOut, ChevronDown, ChevronRight, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ pakai logout dari context

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ ambil fungsi logout dari AuthContext
  const [dark, setDark] = useState(false);
  const [openHistori, setOpenHistori] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const menu = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { to: "/transactions", label: "Transaksi", icon: <PlusCircle size={18} /> },
    {
      label: "Histori",
      icon: <Wallet size={18} />,
      toggle: true,
      open: openHistori,
      onClick: () => setOpenHistori(!openHistori),
      sub: [
        { to: "/pemasukan", label: "Pemasukan" },
        { to: "/pengeluaran", label: "Pengeluaran" },
      ]
    }
  ];

  const handleLogout = async () => {
    await logout(); // ✅ logout dari Supabase
    navigate("/");
  };

  return (
    <aside className="h-screen w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 p-6 flex flex-col justify-between fixed left-0 top-0">
      <div>
        <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-8">💸 MoneyApp</div>
        <nav className="space-y-4">
          {menu.map((item) => (
            item.sub ? (
              <div key={item.label}>
                <button
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {item.open && (
                  <div className="ml-6 mt-2 space-y-2 transition-all duration-200">
                    {item.sub.map((sub) => (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        className={`block px-3 py-2 rounded-lg text-sm hover:bg-purple-100 dark:hover:bg-gray-800 ${
                          location.pathname === sub.to ? "bg-purple-100 dark:bg-gray-800" : ""
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition hover:bg-purple-100 dark:hover:bg-gray-800 ${
                  location.pathname === item.to ? "bg-purple-100 dark:bg-gray-800" : ""
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          ))}
        </nav>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
          <span>🌙 Dark Mode</span>
          <button
            onClick={() => setDark(!dark)}
            className="bg-gray-200 dark:bg-gray-700 w-10 h-5 rounded-full relative transition"
          >
            <span
              className={`absolute top-0.5 left-0.5 bg-white dark:bg-black w-4 h-4 rounded-full transition-transform ${
                dark ? "translate-x-5" : ""
              }`}
            ></span>
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
