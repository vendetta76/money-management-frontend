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

      // ✅ Simpan token & role ke localStorage
      const token = await signedInUser.getIdToken()
      localStorage.setItem("token", token)
      localStorage.setItem("role", userData?.role || '')
      localStorage.setItem("user", JSON.stringify({
        uid: signedInUser.uid,
        email: signedInUser.email,
        role: userData?.role
      }))

      // ✅ Redirect sesuai role (dengan standar lowercase)
      const role = userData?.role?.toLowerCase()
      if (role === "admin") {
        navigate("/admin")
      } else if (role === "regular" || role === "premium") {
        navigate("/dashboard")
      } else {
        navigate("/")
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
    <div className="dark:text-white dark:bg-gray-900 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 p-4">
      <div className="dark:text-white dark:bg-gray-900 bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-xl shadow-xl">
        <BackButton />

        <h1 className="dark:text-white text-3xl font-bold text-center text-purple-700 mb-6">Login ke MoniQ</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900 dark:text-white"
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

        <div className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4 space-y-2">
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
