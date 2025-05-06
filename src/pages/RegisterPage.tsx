import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "../lib/firebaseClient"
import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn"
import BackButton from "../components/BackButton"
import { logActivity } from "../utils/logActivity"

const RegisterPage = () => {
  useRedirectIfLoggedIn()

  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, "users", user.uid), {
        name: fullName,
        email,
        createdAt: serverTimestamp(),
        role: "Regular",
        premium: false,
        currency: "IDR",
      })

      await logActivity(email, "register")

      await sendEmailVerification(user)
      await signOut(auth)

      sessionStorage.setItem("moniq_temp_email", btoa(email))
      sessionStorage.setItem("moniq_temp_password", btoa(password))

      setRedirecting(true)

      setTimeout(() => {
        navigate("/verify-email-pending", {
          state: { email, password },
        })
      }, 1200)
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.")
      setLoading(false)
    }
  }

  return (
    <div className="dark:text-white dark:bg-gray-900 min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 p-4">
      <div className="dark:text-white dark:bg-gray-900 bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-xl shadow-lg">
        <BackButton />

        <h1 className="dark:text-white dark:bg-gray-900 text-3xl font-bold text-center text-purple-700 mb-6">Daftar Akun</h1>

        <form onSubmit={handleRegister} className="dark:text-white dark:bg-gray-900 space-y-4">
          <div>
            <label htmlFor="name" className="dark:text-white dark:bg-gray-900 block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="dark:text-white dark:bg-gray-900 mt-1 w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="dark:text-white dark:bg-gray-900 block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="dark:text-white dark:bg-gray-900 mt-1 w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="dark:text-white dark:bg-gray-900 block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="dark:text-white dark:bg-gray-900 mt-1 w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {error && <p className="dark:text-white dark:bg-gray-900 text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || redirecting}
            className="dark:text-white dark:bg-gray-900 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition disabled:opacity-50 flex justify-center items-center"
          >
            {redirecting ? (
              <div className="dark:text-white dark:bg-gray-900 animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : loading ? (
              "Mendaftarkan..."
            ) : (
              "Daftar"
            )}
          </button>
        </form>

        <p className="dark:text-white dark:bg-gray-900 text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
          Sudah punya akun?{" "}
          <a href="/login" className="dark:text-white dark:bg-gray-900 text-purple-600 hover:underline">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
