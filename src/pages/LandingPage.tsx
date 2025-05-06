import { useBlockLandingIfLoggedIn } from "../hooks/useBlockLandingIfLoggedIn"

const LandingPage = () => {
  useBlockLandingIfLoggedIn()

  return (
    <div className="dark:text-white dark:bg-gray-900 flex flex-col min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 text-white">
      {/* Navbar */}
      <header className="dark:text-white dark:bg-gray-900 flex justify-between items-center p-6">
        <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold">MoniQ</h1>
        <nav className="dark:text-white dark:bg-gray-900 space-x-4">
          <a href="/login" className="dark:text-white dark:bg-gray-900 hover:underline">Login</a>
          <a href="/register" className="dark:text-white dark:bg-gray-900 hover:underline">Register</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="dark:text-white dark:bg-gray-900 flex-1 flex flex-col justify-center items-center text-center px-6">
        <h2 className="dark:text-white dark:bg-gray-900 text-4xl md:text-5xl font-extrabold leading-tight mb-6 animate-bounce">
          Kelola Keuanganmu Dengan Mudah
        </h2>
        <p className="dark:text-white dark:bg-gray-900 text-lg md:text-xl mb-8">
          MoneyManager membantu kamu mengatur pemasukan dan pengeluaran secara efektif dan efisien.
        </p>
        <div className="dark:text-white dark:bg-gray-900 space-x-4">
          <a
            href="/login"
            className="dark:text-white dark:bg-gray-900 px-6 py-3 bg-white dark:bg-gray-900 text-blue-600 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Masuk
          </a>
          <a
            href="/register"
            className="dark:text-white dark:bg-gray-900 px-6 py-3 bg-yellow-400 text-white font-semibold rounded-lg hover:bg-yellow-500 transition"
          >
            Daftar
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="dark:text-white dark:bg-gray-900 text-center p-4 text-sm">
        © 2025 MoneyManager. All rights reserved.
      </footer>
    </div>
  )
}

export default LandingPage
