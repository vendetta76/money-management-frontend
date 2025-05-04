import { Link, useLocation } from "react-router-dom"

const Sidebar = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="w-64 bg-white border-r h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">MoniQ</h2>
      <nav className="flex flex-col gap-3 text-sm font-medium">

        <Link
          to="/dashboard"
          className={`px-4 py-2 rounded-lg hover:bg-gray-100 ${
            isActive("/dashboard") && "bg-gray-200 text-blue-600 font-semibold"
          }`}
        >
          Dashboard
        </Link>

        {/* ✅ Tambahan Wallet */}
        <Link
          to="/wallet"
          className={`px-4 py-2 rounded-lg hover:bg-gray-100 ${
            isActive("/wallet") && "bg-gray-200 text-blue-600 font-semibold"
          }`}
        >
          Wallet
        </Link>

        <Link
          to="/transaction"
          className={`px-4 py-2 rounded-lg hover:bg-gray-100 ${
            isActive("/transaction") && "bg-gray-200 text-blue-600 font-semibold"
          }`}
        >
          Transaction
        </Link>

        {/* Tambahan menu lainnya jika ada */}
      </nav>
    </div>
  )
}

export default Sidebar
