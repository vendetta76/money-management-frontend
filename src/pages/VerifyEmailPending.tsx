import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { sendEmailVerification, signOut } from "firebase/auth"
import { auth } from "../lib/firebaseClient"
import { useAuth } from "../context/AuthContext"

const VerifyEmailPending = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const handleResend = async () => {
    if (!user) return
    setLoading(true)
    setMessage("")

    try {
      await sendEmailVerification(user)
      setMessage("Email verifikasi telah dikirim ulang. Silakan cek inbox kamu.")
      await signOut(auth)
      navigate("/login")
    } catch (err: any) {
      setMessage(err.message || "Gagal mengirim ulang email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 to-orange-300 p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl text-center space-y-4">
        <h1 className="text-2xl font-bold text-yellow-700">Verifikasi Email Diperlukan</h1>
        <p className="text-sm text-gray-700">
          Kami telah mengirimkan link verifikasi ke email kamu. Silakan verifikasi sebelum melanjutkan.
        </p>

        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition disabled:opacity-50"
        >
          {loading ? "Mengirim ulang..." : "Kirim Ulang Email Verifikasi"}
        </button>

        {message && <p className="text-sm text-green-600">{message}</p>}
      </div>
    </div>
  )
}

export default VerifyEmailPending
