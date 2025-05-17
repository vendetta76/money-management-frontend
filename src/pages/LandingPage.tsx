import { useBlockLandingIfLoggedIn } from "../hooks/useBlockLandingIfLoggedIn";
import InstallButton from "../components/InstallButton";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "MoniQ - Aplikasi Manajemen Keuangan Pribadi dan Pintar",
  description: "MoniQ membantu kamu mencatat pemasukan, pengeluaran, dan mengelola dompet dengan mudah. Gratis, aman, dan bisa diinstal ke perangkatmu.",
};

const LandingPage = () => {
  useBlockLandingIfLoggedIn();

  return (
    <div className="dark:text-white dark:bg-gray-900 flex flex-col min-h-screen bg-gradient-to-br from-blue-500 to-purple-700 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center p-6 shadow-sm bg-white/10 backdrop-blur">
        <h1 className="text-2xl font-extrabold tracking-wide">MoniQ</h1>
        <nav className="space-x-4 text-sm">
          <a href="/login" className="hover:underline">Login</a>
          <a href="/register" className="hover:underline">Register</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <div className="max-w-md w-full">
          <img
            src="/assets/finance-animation.gif"
            alt="Ilustrasi animasi keuangan"
            className="w-full h-auto mb-6 rounded-lg shadow-md"
          />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          💸 Kelola Keuanganmu dengan Gaya!
        </h2>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          MoniQ adalah platform manajemen keuangan yang bantu kamu melacak pemasukan, pengeluaran, dan tabungan dengan tampilan modern & fitur pintar.
        </p>

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-4 flex-wrap justify-center">
            <a
              href="/login"
              className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
            >
              Masuk Sekarang
            </a>
            <a
              href="/register"
              className="px-6 py-3 bg-yellow-400 text-white font-semibold rounded-lg shadow hover:bg-yellow-500 transition"
            >
              Daftar Gratis
            </a>
          </div>
          <InstallButton />
        </div>
      </main>

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">🔐 Aman & Pribadi</h3>
            <p className="text-sm">Data keuanganmu terenkripsi dan hanya bisa diakses olehmu.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">📊 Statistik Cerdas</h3>
            <p className="text-sm">Lihat grafik pemasukan & pengeluaran untuk bantu keputusan finansialmu.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">⚡️ Ringan & Cepat</h3>
            <p className="text-sm">Dibuat dengan teknologi PWA, bisa diakses offline dan super cepat!</p>
          </div>
        </div>
      </section>

      {/* Step-by-step section */}
      <section className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-8">Cara Memulai dengan MoniQ 🚀</h3>
          <ol className="space-y-6 text-left max-w-xl mx-auto list-decimal list-inside">
            <li>
              <strong>Daftar akun</strong> secara gratis dan login ke dashboard kamu.
            </li>
            <li>
              <strong>Buat dompet digital</strong> sesuai kebutuhanmu: pribadi, usaha, atau tabungan.
            </li>
            <li>
              <strong>Catat pemasukan dan pengeluaran</strong> kamu setiap hari.
            </li>
            <li>
              <strong>Lihat laporan keuangan</strong> dan pantau kemajuan finansialmu.
            </li>
          </ol>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-900 text-white py-12 px-6 text-center">
        <h3 className="text-2xl font-bold mb-4">Mulai atur keuanganmu sekarang 🚀</h3>
        <a
          href="/register"
          className="inline-flex items-center gap-2 bg-yellow-400 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition"
        >
          Daftar Gratis <ArrowRight size={18} />
        </a>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-4 bg-white/10 backdrop-blur border-t border-white/20">
        © 2025 MoniQ. Dibuat dengan ❤️ oleh Developer Bro.
      </footer>
    </div>
  );
};

export default LandingPage;