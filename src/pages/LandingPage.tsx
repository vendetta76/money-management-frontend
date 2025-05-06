import { useBlockLandingIfLoggedIn } from "../hooks/useBlockLandingIfLoggedIn"

const LandingPage = () => {
  useBlockLandingIfLoggedIn()

  return (
    <div className="bg-gradient-to-br flex flex-col from-blue-400 min-h-screen text-white to-purple-600">
      {/* Navbar */}
      <header className="flex items-center justify-between p-6">
        <h1 className="font-bold text-2xl">MoniQ</h1>
        <nav className="space-x-4">
          <a href="/login" className="hover:underline">Login</a>
          <a href="/register" className="hover:underline">Register</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h2 className="animate-bounce font-extrabold leading-tight mb-6 md:text-5xl text-4xl">
          Kelola Keuanganmu Dengan Mudah
        </h2>
        <p className="mb-8 md:text-xl text-lg">
          MoneyManager membantu kamu mengatur pemasukan dan pengeluaran secara efektif dan efisien.
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="bg-white dark:bg-gray-900 font-semibold hover:bg-gray-200 px-6 py-3 rounded-lg text-blue-600 transition"
          >
            Masuk
          </a>
          <a
            href="/register"
            className="bg-yellow-400 font-semibold hover:bg-yellow-500 px-6 py-3 rounded-lg text-white transition"
          >
            Daftar
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm">
        © 2025 MoneyManager. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage
