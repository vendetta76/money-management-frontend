import React from "react"
import LayoutShell from "../../layouts/LayoutShell"

const UpgradePage = () => {
  return (
    <LayoutShell>
      <main className="2xl:px-20 max-w-screen-md md:ml-64 md:px-8 mx-auto px-4 py-10 sm:px-6 xl:px-12">
        <h1 className="dark:text-white font-bold mb-6 text-3xl text-center">🚀 Upgrade ke Premium</h1>

        <p className="dark:text-gray-300 dark:text-white mb-8 text-center text-gray-600">
          Nikmati fitur eksklusif dan tingkatkan pengalaman Anda dengan MoniQ Premium.
        </p>

        <div className="bg-white border dark:bg-gray-800 dark:bg-gray-900 dark:border-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="dark:text-white font-semibold mb-2 text-2xl">💎 MoniQ Premium</h2>
          <ul className="dark:text-gray-300 dark:text-white list-disc mb-4 pl-5 space-y-1 text-gray-700 text-sm">
            <li>Proteksi PIN untuk halaman Wallet</li>
            <li>Fitur analitik keuangan lanjutan &#40;Belum Diterapkan&#41;</li>
            <li>Preferensi tampilan yang lebih lengkap &#40;Belum Diterapkan&#41;</li>
            <li>Dukungan prioritas & update lebih awal</li>
          </ul>

          <div className="dark:text-purple-400 dark:text-white font-bold mb-4 text-2xl text-center text-purple-600">
            Rp25.000 / bulan
          </div>

          <div className="dark:text-white text-center">
            <button
              onClick={() => alert("Fitur upgrade belum aktif")} // Ganti dengan integrasi pembayaran
              className="bg-gradient-to-r dark:bg-gray-900 font-semibold from-[#00d97e] hover:shadow-lg px-6 py-2 rounded-lg text-white to-[#00c2ff] transition"
            >
              Upgrade Sekarang
            </button>
          </div>
        </div>

        <div className="dark:text-gray-400 dark:text-white mt-6 text-center text-gray-500 text-xs">
          Pembayaran saat ini belum tersedia. Fitur akan segera aktif.
        </div>
      </main>
    </LayoutShell>
  )
}

export default UpgradePage
