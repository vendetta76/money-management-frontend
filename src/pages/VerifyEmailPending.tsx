import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { auth } from "../lib/firebaseClient"
import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth"

const VerifyEmailPending = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Ambil dari state atau fallback ke sessionStorage (dengan decode btoa)
  const email = location.state?.email || atob(sessionStorage.getItem("moniq_temp_email") || "")
  const password = location.state?.password || atob(sessionStorage.getItem("moniq_temp_password") || "")

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentUser = auth.currentUser

        // login ulang kalau user belum ada
        if (!currentUser && email && password) {
          await signInWithEmailAndPassword(auth, email, password)
          return
        }

        if (currentUser) {
          await currentUser.reload()
          if (currentUser.emailVerified) {
            clearInterval(interval)
            setVerified(true)
            setMessage("Email telah diverifikasi! Masuk otomatis...")

            setTimeout(async () => {
              try {
                // login ulang hanya kalau belum login
                if (!auth.currentUser) {
                  await signInWithEmailAndPassword(auth, email, password)
                }
                sessionStorage.removeItem("moniq_temp_email")
                sessionStorage.removeItem("moniq_temp_password")
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
    <div className="bg-gradient-to-br flex from-yellow-200 items-center justify-center min-h-screen p-4 to-orange-300">
      <div className="bg-white dark:bg-gray-900 max-w-md p-6 rounded-xl shadow-xl space-y-4 text-center w-full">
        <h1 className="font-bold text-2xl text-yellow-700">Verifikasi Email Diperlukan</h1>
        <p className="dark:text-white text-gray-700 text-sm">
          Kami telah mengirimkan link verifikasi ke <strong>{email}</strong>.
          Silakan buka email kamu dan klik link tersebut.
        </p>

        <button
          onClick={handleResend}
          disabled={loading}
          className="bg-yellow-500 disabled:opacity-50 hover:bg-yellow-600 px-4 py-2 rounded text-white transition"
        >
          {loading ? "Mengirim ulang..." : "Kirim Ulang Email Verifikasi"}
        </button>

        {message && <p className="text-green-600 text-sm">{message}</p>}
        {verified && <p className="font-semibold text-green-700 text-sm">Email terverifikasi. Mengarahkan ke dashboard...</p>}
      </div>
    </div>
  )
}

export default VerifyEmailPending
