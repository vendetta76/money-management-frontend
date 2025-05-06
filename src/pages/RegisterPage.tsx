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
    <div className="bg-gradient-to-br dark:bg-gray-900 flex from-purple-600 items-center justify-center min-h-screen p-4 to-indigo-700">
      <div className="bg-white dark:bg-gray-900 max-w-md p-8 rounded-xl shadow-lg w-full">
        <BackButton />

        <h1 className="dark:text-white font-bold mb-6 text-3xl text-center text-purple-700">Daftar Akun</h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block dark:text-white font-medium text-gray-700 text-sm">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1 px-4 py-2 rounded w-full"
            />
          </div>

          <div>
            <label htmlFor="email" className="block dark:text-white font-medium text-gray-700 text-sm">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1 px-4 py-2 rounded w-full"
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
              className="border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-1 px-4 py-2 rounded w-full"
            />
          </div>

          {error && <p className="dark:text-white text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || redirecting}
            className="bg-purple-600 dark:bg-gray-900 disabled:opacity-50 flex hover:bg-purple-700 items-center justify-center py-2 rounded text-white transition w-full"
          >
            {redirecting ? (
              <div className="animate-spin border-2 border-t-transparent border-white h-5 rounded-full w-5"></div>
            ) : loading ? (
              "Mendaftarkan..."
            ) : (
              "Daftar"
            )}
          </button>
        </form>

        <p className="dark:text-white mt-4 text-center text-gray-600 text-sm">
          Sudah punya akun?{" "}
          <a href="/login" className="dark:text-white hover:underline text-purple-600">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
