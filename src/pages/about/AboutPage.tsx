import React from "react"
import LayoutShell from "../../layouts/LayoutShell"

const AboutPage = () => {
  return (
    <LayoutShell>
      <main className="dark:text-white dark:bg-gray-900 max-w-screen-md mx-auto px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 py-10 md:ml-64">
        <h1 className="dark:text-white dark:bg-gray-900 text-3xl font-bold mb-6">Tentang MeowIQ</h1>

        <section className="dark:text-white dark:bg-gray-900 space-y-5 text-sm text-gray-700 leading-relaxed">
          <p>
            <strong>MeowIQ</strong> adalah aplikasi pencatat dan pengatur keuangan pribadi yang dirancang untuk membantu Anda memahami dan mengelola kondisi finansial secara lebih cerdas dan terstruktur.
            Aplikasi ini menghadirkan fitur-fitur simulatif yang memungkinkan Anda melacak pemasukan, pengeluaran, hingga merencanakan keuangan secara efisien.
          </p>

          <p>
            Kami percaya bahwa setiap orang berhak memiliki kendali atas keuangannya sendiri, dan MeowIQ hadir sebagai asisten keuangan pribadi yang dapat diandalkan, tanpa risiko, tanpa tekanan, dan 100% berbasis simulasi.
          </p>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">Fitur Utama MeowIQ</h2>
          <ul className="dark:text-white dark:bg-gray-900 list-disc pl-6 space-y-2">
            <li>Pencatatan pemasukan dan pengeluaran harian</li>
            <li>Histori transaksi lengkap dan transparan</li>
            <li>Proteksi halaman Wallet dengan PIN (untuk pengguna Premium)</li>
            <li>Preferensi tampilan & pengaturan personalisasi akun</li>
            <li>Dashboard finansial sederhana dan informatif</li>
          </ul>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">Tidak Menggunakan Uang Asli</h2>
          <p>
            Seluruh fitur MeowIQ bersifat simulatif dan tidak melibatkan transaksi uang sungguhan. Kami tidak menyimpan, menerima, maupun mengirim uang dalam bentuk apa pun.
            Tujuan utama MeowIQ adalah memberikan pengalaman edukatif dalam mengelola keuangan pribadi.
          </p>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">Tim Pengembang</h2>
          <p>
            MeowIQ dikembangkan oleh tim independen dengan semangat membangun solusi keuangan berbasis teknologi yang aman, praktis, dan mudah digunakan oleh siapa pun.
          </p>

          <h2 className="dark:text-white dark:bg-gray-900 text-lg font-semibold">Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan, masukan, atau ingin berkolaborasi, silakan hubungi kami melalui email resmi atau halaman kontak di dalam aplikasi.
          </p>
        </section>
      </main>
    </LayoutShell>
  )
}

export default AboutPage
