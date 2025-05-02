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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
      <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-purple-700">Reset Password</h2>
        <input
          type="password"
          placeholder="Password Baru"
          className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleResetPassword}
          className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Memproses..." : "Ganti Password"}
        </button>
      </div>
    </div>
  )
}
