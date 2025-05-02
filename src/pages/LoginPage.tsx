import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { auth } from "../lib/firebaseClient"
import { useAuth } from "../context/AuthContext"
import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn"
import BackButton from "../components/BackButton" // pastikan file ini ada

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

      navigate("/profile") // fallback manual
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-xl">
        <BackButton />

        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">Login ke MoniQ</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {unverifiedUser && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="text-sm text-purple-600 hover:underline mt-2 block"
            >
              Kirim ulang email verifikasi
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {/* Link navigasi bawah */}
        <div className="text-center text-sm text-gray-600 mt-4 space-y-2">
          <p>
            Belum punya akun?{" "}
            <a href="/register" className="text-purple-600 hover:underline">
              Daftar sekarang
            </a>
          </p>
          <p>
            <a href="/forgot-password" className="text-purple-600 hover:underline">
              Lupa password?
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
