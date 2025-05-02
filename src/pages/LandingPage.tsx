import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const LandingPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">MoneyManager</h1>
        <nav className="space-x-4">
          <a href="/login" className="hover:underline">Login</a>
          <a href="/register" className="hover:underline">Register</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 animate-bounce">
          Kelola Keuanganmu Dengan Mudah
        </h2>
        <p className="text-lg md:text-xl mb-8">
          MoneyManager membantu kamu mengatur pemasukan dan pengeluaran secara efektif dan efisien.
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Masuk
          </a>
          <a
            href="/register"
            className="px-6 py-3 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition"
          >
            Daftar
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-sm">
        © 2025 MoneyManager. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage
