import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { sendEmailVerification, signOut } from 'firebase/auth'
import { useAuth } from '../context/AuthContext'
import { auth } from '../lib/firebaseClient'

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth()
  const [sending, setSending] = useState(false)
  const [resendMsg, setResendMsg] = useState("")

  if (loading) return <div>Loading...</div>

  if (!user) return <Navigate to="/login" replace />

  if (!user.emailVerified) {
    const handleResend = async () => {
      setSending(true)
      setResendMsg("")
      try {
        await sendEmailVerification(user)
        setResendMsg("Email verifikasi dikirim ulang! Silakan cek inbox.")
        await signOut(auth) // Logout setelah kirim ulang
      } catch (err: any) {
        setResendMsg(err.message || "Gagal mengirim ulang email.")
      } finally {
        setSending(false)
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div className="bg-white p-6 rounded-xl shadow max-w-md w-full space-y-4">
          <h2 className="text-xl font-bold text-red-600">Email Belum Diverifikasi</h2>
          <p className="text-sm text-gray-700">
            Cek inbox kamu dan klik link verifikasi untuk melanjutkan.
          </p>

          <button
            onClick={handleResend}
            disabled={sending}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
          >
            {sending ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
          </button>

          {resendMsg && <p className="text-sm text-green-600">{resendMsg}</p>}
        </div>
      </div>
    )
  }

  return children
}

export default PrivateRoute
