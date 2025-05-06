import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../lib/firebaseClient"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage("Link reset password telah dikirim ke email kamu.")
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengirim email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br dark:bg-gray-900 flex from-purple-600 items-center justify-center min-h-screen p-4 to-indigo-700">
      <div className="bg-white dark:bg-gray-900 max-w-md p-8 rounded-xl shadow-lg w-full">
        <h1 className="dark:text-white font-bold mb-6 text-2xl text-center text-purple-700">Lupa Password</h1>
        <form onSubmit={handleReset} className="space-y-4">
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

          {message && <p className="dark:text-white text-green-600 text-sm">{message}</p>}
          {error && <p className="dark:text-white text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 dark:bg-gray-900 disabled:opacity-50 hover:bg-purple-700 py-2 rounded text-white transition w-full"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>
        <p className="dark:text-white mt-4 text-center text-gray-600 text-sm">
          Ingat password?{" "}
          <a href="/login" className="dark:text-white hover:underline text-purple-600">
            Kembali ke login
          </a>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
