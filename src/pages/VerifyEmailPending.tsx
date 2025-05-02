import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { auth } from "../lib/firebaseClient"
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth"

const VerifyEmailPending = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { email, password } = location.state || {}
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  // 1. Auto-polling cek verifikasi
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentUser = auth.currentUser
        if (currentUser) {
          await currentUser.reload()
          if (currentUser.emailVerified) {
            clearInterval(interval)
            setVerified(true)
            setMessage("Email telah diverifikasi! Masuk otomatis...")
            setTimeout(async () => {
              try {
                await signInWithEmailAndPassword(auth, email, password)
                navigate("/dashboard")
              } catch (err) {
                console.error("Gagal auto-login:", err)
                navigate("/login")
              }
            }, 2000)
          }
        }
      } catch (err) {
        console.error("Polling verifikasi error:", err)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [email, password, navigate])

  // 2. Kirim ulang email verifikasi
  const handleResend = async () => {
    setLoading(true)
    setMessage("")
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
        setMessage("Email verifikasi telah dikirim ulang.")
      } else {
        setMessage("Tidak ada user yang login.")
      }
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
          Kami telah mengirimkan link verifikasi ke <strong>{email}</strong>.
          Silakan buka email kamu dan klik link tersebut.
        </p>

        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition disabled:opacity-50"
        >
          {loading ? "Mengirim ulang..." : "Kirim Ulang Email Verifikasi"}
        </button>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {verified && <p className="text-sm text-green-700 font-semibold">Email terverifikasi. Mengarahkan ke dashboard...</p>}
      </div>
    </div>
  )
}

export default VerifyEmailPending
