import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const DashboardPage = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <div className="p-8 flex flex-col items-start gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard MoniQ 🚀</h1>
        <p>Selamat datang di pusat kendali finansialmu, bro.</p>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  )
}

export default DashboardPage
