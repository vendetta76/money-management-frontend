import React from "react"
import LayoutShell from "../../layouts/LayoutShell"

const UpgradePage = () => {
  return (
    <LayoutShell>
      <main className="dark:text-white dark:bg-gray-900 max-w-screen-md mx-auto px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 py-10 md:ml-64">
        <h1 className="dark:text-white dark:bg-gray-900 text-3xl font-bold text-center mb-6">🚀 Upgrade ke Premium</h1>

        <p className="dark:text-white dark:bg-gray-900 text-center text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-8">
          Nikmati fitur eksklusif dan tingkatkan pengalaman Anda dengan MoniQ Premium.
        </p>

        <div className="dark:text-white dark:bg-gray-900 bg-white dark:bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg p-6 border dark:border-gray-700">
          <h2 className="dark:text-white dark:bg-gray-900 text-2xl font-semibold mb-2">💎 MoniQ Premium</h2>
          <ul className="dark:text-white dark:bg-gray-900 list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
            <li>Proteksi PIN untuk halaman Wallet</li>
            <li>Fitur analitik keuangan lanjutan &#40;Belum Diterapkan&#41;</li>
            <li>Preferensi tampilan yang lebih lengkap &#40;Belum Diterapkan&#41;</li>
            <li>Dukungan prioritas & update lebih awal</li>
          </ul>

          <div className="dark:text-white dark:bg-gray-900 text-center text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
            Rp25.000 / bulan
          </div>

          <div className="dark:text-white dark:bg-gray-900 text-center">
            <button
              onClick={() => alert("Fitur upgrade belum aktif")} // Ganti dengan integrasi pembayaran
              className="dark:text-white dark:bg-gray-900 px-6 py-2 bg-gradient-to-r from-[#00d97e] to-[#00c2ff] text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Upgrade Sekarang
            </button>
          </div>
        </div>

        <div className="dark:text-white dark:bg-gray-900 text-center text-xs text-gray-500 dark:text-gray-300 dark:text-gray-400 mt-6">
          Pembayaran saat ini belum tersedia. Fitur akan segera aktif.
        </div>
      </main>
    </LayoutShell>
  )
}

export default UpgradePage
