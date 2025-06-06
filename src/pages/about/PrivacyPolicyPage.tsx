import React from "react"
import LayoutShell from "../../layouts/LayoutShell"

const PrivacyPolicyPage = () => {
  return (
    <LayoutShell>
      <main className="dark:text-white dark:bg-gray-900 max-w-screen-md mx-auto px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 py-10 md:ml-64">
        <h1 className="dark:text-white dark:bg-gray-900 text-3xl font-bold mb-6">Kebijakan Privasi</h1>

        <section className="dark:text-white dark:bg-gray-900 space-y-5 text-sm text-gray-700 leading-relaxed">
          <p>
            MeowIQ adalah platform digital yang bertujuan membantu pengguna dalam mencatat, mengelola, dan memantau kondisi keuangan pribadi mereka.
            Aplikasi ini dirancang untuk memberikan pengalaman edukatif dan informatif dalam pengelolaan keuangan, tanpa melibatkan transaksi uang asli.
          </p>

          <p>
            Seluruh data yang ditampilkan dalam MeowIQ bersifat simulatif. Kami tidak menyediakan layanan keuangan nyata, seperti penyimpanan dana, transfer, penarikan, atau transaksi dengan uang sungguhan.
            Segala bentuk pengelolaan keuangan dalam aplikasi ini murni untuk keperluan pencatatan pribadi.
          </p>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">1. Informasi yang Kami Kumpulkan</h2>
          <ul className="dark:text-white dark:bg-gray-900 list-disc pl-6 space-y-2">
            <li>Alamat email yang Anda gunakan untuk mendaftar dan masuk ke aplikasi.</li>
            <li>Data simulatif terkait keuangan pribadi seperti pendapatan, pengeluaran, dan preferensi pengaturan uang.</li>
            <li>Status keanggotaan (contoh: pengguna Premium).</li>
          </ul>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">2. Bagaimana Data Digunakan</h2>
          <p>
            Informasi yang kami kumpulkan digunakan untuk memberikan layanan terbaik dan personal kepada Anda, termasuk:
          </p>
          <ul className="dark:text-white dark:bg-gray-900 list-disc pl-6 space-y-2">
            <li>Mengelola fitur seperti proteksi PIN untuk halaman Wallet.</li>
            <li>Menyimpan data pencatatan keuangan Anda secara aman di cloud.</li>
            <li>Meningkatkan fungsionalitas dan keamanan aplikasi MeowIQ.</li>
          </ul>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">3. Keamanan Data</h2>
          <p>
            MeowIQ menggunakan sistem autentikasi aman dan penyimpanan data terenkripsi melalui Firebase.
            Kami tidak pernah membagikan informasi pribadi pengguna kepada pihak ketiga tanpa izin.
          </p>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">4. Tidak Ada Transaksi Finansial Nyata</h2>
          <p>
            MeowIQ bukan layanan keuangan. Kami tidak melakukan transaksi finansial apa pun. Semua saldo, transaksi, dan aktivitas dalam aplikasi ini hanyalah simulasi.
            Pengguna bertanggung jawab penuh atas interpretasi dan penggunaan informasi dari aplikasi.
          </p>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">5. Kontak</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami melalui email resmi atau halaman kontak MeowIQ.
          </p>
        </section>
      </main>
    </LayoutShell>
  )
}

export default PrivacyPolicyPage
