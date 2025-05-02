import { useBlockLandingIfLoggedIn } from "../hooks/useBlockLandingIfLoggedIn"

const LandingPage = () => {
  useBlockLandingIfLoggedIn()

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">MoniQ</h1>
        <nav className="space-x-4">
          <a href="/login" className="hover:underline transition">Login</a>
          <a href="/register" className="hover:underline transition">Register</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 animate-bounce">
          Kelola Keuanganmu Dengan Mudah
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-xl">
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
