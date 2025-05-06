import React from "react"
import LayoutShell from "../../layouts/LayoutShell"

const AboutPage = () => {
  return (
    <LayoutShell>
      <main className="2xl:px-20 max-w-screen-md md:ml-64 md:px-8 mx-auto px-4 py-10 sm:px-6 xl:px-12">
        <h1 className="dark:text-white font-bold mb-6 text-3xl">Tentang Moniq</h1>

        <section className="dark:text-white leading-relaxed space-y-5 text-gray-700 text-sm">
          <p>
            <strong>Moniq</strong> adalah aplikasi pencatat dan pengatur keuangan pribadi yang dirancang untuk membantu Anda memahami dan mengelola kondisi finansial secara lebih cerdas dan terstruktur.
            Aplikasi ini menghadirkan fitur-fitur simulatif yang memungkinkan Anda melacak pemasukan, pengeluaran, hingga merencanakan keuangan secara efisien.
          </p>

          <p>
            Kami percaya bahwa setiap orang berhak memiliki kendali atas keuangannya sendiri, dan Moniq hadir sebagai asisten keuangan pribadi yang dapat diandalkan, tanpa risiko, tanpa tekanan, dan 100% berbasis simulasi.
          </p>

          <h2 className="dark:text-white font-semibold text-lg">Fitur Utama Moniq</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pencatatan pemasukan dan pengeluaran harian</li>
            <li>Histori transaksi lengkap dan transparan</li>
            <li>Proteksi halaman Wallet dengan PIN (untuk pengguna Premium)</li>
            <li>Preferensi tampilan & pengaturan personalisasi akun</li>
            <li>Dashboard finansial sederhana dan informatif</li>
          </ul>

          <h2 className="dark:text-white font-semibold text-lg">Tidak Menggunakan Uang Asli</h2>
          <p>
            Seluruh fitur Moniq bersifat simulatif dan tidak melibatkan transaksi uang sungguhan. Kami tidak menyimpan, menerima, maupun mengirim uang dalam bentuk apa pun.
            Tujuan utama Moniq adalah memberikan pengalaman edukatif dalam mengelola keuangan pribadi.
          </p>

          <h2 className="dark:text-white font-semibold text-lg">Tim Pengembang</h2>
          <p>
            Moniq dikembangkan oleh tim independen dengan semangat membangun solusi keuangan berbasis teknologi yang aman, praktis, dan mudah digunakan oleh siapa pun.
          </p>

          <h2 className="dark:text-white font-semibold text-lg">Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan, masukan, atau ingin berkolaborasi, silakan hubungi kami melalui email resmi atau halaman kontak di dalam aplikasi.
          </p>
        </section>
      </main>
    </LayoutShell>
  )
}

export default AboutPage
