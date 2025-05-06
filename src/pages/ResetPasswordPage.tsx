import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { confirmPasswordReset } from "firebase/auth"
import { auth } from "../lib/firebaseClient"
import toast from "react-hot-toast"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const oobCode = searchParams.get("oobCode")

  const handleResetPassword = async () => {
    if (!oobCode) {
      toast.error("Link tidak valid atau sudah kedaluwarsa.")
      return
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter.")
      return
    }

    setLoading(true)

    try {
      await confirmPasswordReset(auth, oobCode, password)
      toast.success("Password berhasil diubah! Mengalihkan ke login...")
      setTimeout(() => navigate("/login"), 3000)
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br flex from-purple-600 items-center justify-center min-h-screen p-4 to-indigo-700">
      <div className="animate-fade-in bg-white dark:bg-gray-900 max-w-md p-6 rounded-xl shadow-lg space-y-6 w-full">
        <h2 className="font-bold text-2xl text-center text-purple-700">Reset Password</h2>
        <input
          type="password"
          placeholder="Password Baru"
          className="border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 p-2 rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleResetPassword}
          className="bg-green-500 disabled:opacity-50 hover:bg-green-600 p-2 rounded text-white transition w-full"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Ganti Password"}
        </button>
      </div>
    </div>
  )
}
