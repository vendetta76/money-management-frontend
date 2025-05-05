
import { useEffect, useState } from "react"
import {
  Home, LogOut as LogOutIcon, Wallet, PiggyBank, Receipt, Clock, ChevronDown
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../lib/firebaseClient"
import { toast } from "react-hot-toast"

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark")
  const [isTransactionOpen, setIsTransactionOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [name, setName] = useState<string>("")
  const [role, setRole] = useState<string>("regular")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (!snapshot.exists()) return
      const data = snapshot.data()
      if (data.photoURL) setPhotoURL(data.photoURL)
      if (data.name) setName(data.name)
      if (data.role) setRole(data.role)
      setLoading(false)
    }, (error) => {
      console.error("🔥 Firestore error:", error)
      toast.error("Gagal memuat data pengguna.")
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Berhasil logout.")
      navigate("/login")
    } catch (err) {
      toast.error("Gagal logout.")
    }
  }

  return (
    <aside className={\`
      fixed top-0 left-0 h-screen w-60 md:w-64 z-50 bg-white dark:bg-gray-900
      border-r dark:border-gray-800 transform transition-transform duration-300
      \${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      p-4 flex flex-col justify-between overflow-y-auto
    \`}>
      <div>
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-6">MoniQ</h1>
        <div className="flex flex-col items-center text-center mb-6">
          {loading ? (
            <>
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </>
          ) : (
            <>
              <img
                src={photoURL || "https://res.cloudinary.com/dvbn6oqlp/image/upload/v1746252421/Default_pfp_zoecp6.webp"}
                className="w-16 h-16 rounded-full object-cover mb-2"
                alt="Avatar"
              />
              <p className="text-sm font-semibold text-gray-700 dark:text-white">{name || "User"}</p>
              <span className="text-xs text-gray-500 dark:text-gray-300">
                {role === "premium" ? "💎 Premium" : "🧑‍💻 Regular"}
              </span>
            </>
          )}
        </div>

        <nav className="space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) =>
            \`flex items-center gap-3 px-3 py-2 rounded-lg font-medium \${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}\`}>
            <Home size={18} /> Dashboard
          </NavLink>

          <NavLink to="/wallet" className={({ isActive }) =>
            \`flex items-center gap-3 px-3 py-2 rounded-lg font-medium \${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}\`}>
            <Wallet size={18} /> Wallet
          </NavLink>

          <div>
            <button
              onClick={() => setIsTransactionOpen(!isTransactionOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <span className="flex items-center gap-2">
                <ChevronDown className={\`w-4 h-4 transition-transform \${isTransactionOpen ? "rotate-180" : ""}\`} />
                Transaction
              </span>
            </button>
            {isTransactionOpen && (
              <div className="pl-8 mt-1 space-y-1">
                <NavLink to="/income" className={({ isActive }) =>
                  \`block py-1 text-sm \${isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-300 hover:text-purple-500"}\`}>
                  <PiggyBank size={16} className="inline mr-1" /> Income
                </NavLink>
                <NavLink to="/outcome" className={({ isActive }) =>
                  \`block py-1 text-sm \${isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-300 hover:text-purple-500"}\`}>
                  <Receipt size={16} className="inline mr-1" /> Outcome
                </NavLink>
              </div>
            )}
          </div>

          <NavLink to="/history" className={({ isActive }) =>
            \`flex items-center gap-3 px-3 py-2 rounded-lg font-medium \${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}\`}>
            <Clock size={18} /> History
          </NavLink>

          <div>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <span className="flex items-center gap-2">
                <ChevronDown className={\`w-4 h-4 transition-transform \${isSettingsOpen ? "rotate-180" : ""}\`} />
                Settings
              </span>
            </button>
            {isSettingsOpen && (
              <div className="pl-8 mt-1 space-y-1">
                <NavLink to="/settings/profile" className={({ isActive }) =>
                  \`block py-1 text-sm \${isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-300 hover:text-purple-500"}\`}>
                  👤 Profile
                </NavLink>
                <NavLink to="/settings/security" className={({ isActive }) =>
                  \`block py-1 text-sm \${isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-300 hover:text-purple-500"}\`}>
                  🔐 Security
                </NavLink>
                <NavLink to="/settings/preferences" className={({ isActive }) =>
                  \`block py-1 text-sm \${isActive ? "text-purple-600" : "text-gray-600 dark:text-gray-300 hover:text-purple-500"}\`}>
                  ⚙️ Preferences
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-sm text-red-600 dark:text-red-400 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
        >
          <LogOutIcon size={16} /> Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
