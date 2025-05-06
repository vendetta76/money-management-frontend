import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "../lib/firebaseClient"
import { useAuth } from "../context/AuthContext"
import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn"
import BackButton from "../components/BackButton"

const LoginPage = () => {
  useRedirectIfLoggedIn()

  const { user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setUnverifiedUser(null)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const signedInUser = userCredential.user

      if (!signedInUser.emailVerified) {
        setError("Email belum diverifikasi. Silakan cek inbox kamu.")
        setUnverifiedUser(signedInUser)
        await auth.signOut()
        return
      }

      const userDocRef = doc(db, "users", signedInUser.uid)
      const userDocSnap = await getDoc(userDocRef)
      const userData = userDocSnap.data()

      if (userData?.role === "Admin") {
        navigate("/admin")
      } else if (userData?.role === "Regular" || userData?.role === "Premium") {
        navigate("/dashboard")
      } else {
        navigate("/") // fallback untuk role yang tidak dikenal
      }

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedUser) return
    try {
      await sendEmailVerification(unverifiedUser)
      setError("Email verifikasi telah dikirim ulang. Silakan cek inbox.")
      setUnverifiedUser(null)
    } catch (err: any) {
      setError(err.message || "Gagal mengirim ulang email.")
    }
  }

  return (
    <div className="bg-gradient-to-br flex from-blue-500 items-center justify-center min-h-screen p-4 to-purple-700">
      <div className="bg-white dark:bg-gray-900 max-w-md p-8 rounded-xl shadow-xl w-full">
        <BackButton />

        <h1 className="font-bold mb-6 text-3xl text-center text-purple-700">Login ke MoniQ</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block dark:text-white font-medium text-gray-700 text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1 px-4 py-2 rounded w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block dark:text-white font-medium text-gray-700 text-sm">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1 px-4 py-2 rounded w-full"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {unverifiedUser && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="block hover:underline mt-2 text-purple-600 text-sm"
            >
              Kirim ulang email verifikasi
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 disabled:opacity-50 hover:bg-purple-700 py-2 rounded text-white transition w-full"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <div className="dark:text-white mt-4 space-y-2 text-center text-gray-600 text-sm">
          <p>
            Belum punya akun?{" "}
            <a href="/register" className="hover:underline text-purple-600">
              Daftar sekarang
            </a>
          </p>
          <p>
            <a href="/forgot-password" className="hover:underline text-purple-600">
              Lupa password?
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
