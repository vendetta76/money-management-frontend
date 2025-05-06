import React from "react"
import LayoutShell from "../../layouts/LayoutShell"

const TermsAndConditionsPage = () => {
  return (
    <LayoutShell>
      <main className="max-w-screen-md mx-auto px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 py-10 ">
        <h1 className="text-3xl font-bold mb-6">Syarat dan Ketentuan</h1>

        <section className="space-y-5 text-sm text-gray-700 leading-relaxed">
          <p>
            Dengan menggunakan aplikasi Moniq, Anda menyetujui Syarat dan Ketentuan yang dijabarkan di bawah ini.
            Jika Anda tidak menyetujui salah satu bagian dari syarat ini, mohon untuk tidak menggunakan layanan Moniq.
          </p>

          <h2 className="text-lg font-semibold">1. Deskripsi Layanan</h2>
          <p>
            Moniq adalah aplikasi pencatat dan pengelola keuangan pribadi berbasis simulasi.
            Aplikasi ini tidak menyediakan layanan keuangan nyata dan tidak melibatkan uang asli dalam bentuk apa pun.
            Semua data transaksi, saldo, dan pengeluaran di dalam aplikasi hanya bersifat simulatif dan digunakan untuk tujuan edukatif serta perencanaan pribadi.
          </p>

          <h2 className="text-lg font-semibold">2. Kepemilikan Akun</h2>
          <p>
            Pengguna bertanggung jawab penuh atas informasi akun mereka termasuk alamat email, PIN, dan aktivitas yang dilakukan melalui akun tersebut.
            Moniq tidak bertanggung jawab atas penyalahgunaan akun oleh pihak ketiga akibat kelalaian pengguna.
          </p>

          <h2 className="text-lg font-semibold">3. Batasan Tanggung Jawab</h2>
          <p>
            Moniq tidak bertanggung jawab atas keputusan keuangan yang diambil berdasarkan data atau simulasi yang tersedia dalam aplikasi.
            Kami tidak menjamin keakuratan hasil simulasi dan tidak memberikan nasihat keuangan profesional.
          </p>

          <h2 className="text-lg font-semibold">4. Penggunaan yang Dilarang</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Menggunakan aplikasi untuk tindakan penipuan atau kegiatan ilegal.</li>
            <li>Menyalin, memodifikasi, atau mendistribusikan konten aplikasi tanpa izin.</li>
            <li>Mengganggu sistem keamanan atau mencoba mengakses data pengguna lain.</li>
          </ul>

          <h2 className="text-lg font-semibold">5. Hak Pengembang</h2>
          <p>
            Pengembang Moniq berhak untuk mengubah, menangguhkan, atau menghentikan sebagian atau seluruh fitur aplikasi tanpa pemberitahuan sebelumnya.
            Perubahan terhadap syarat ini akan diinformasikan melalui halaman resmi aplikasi.
          </p>

          <h2 className="text-lg font-semibold">6. Pengakhiran Akses</h2>
          <p>
            Moniq berhak menangguhkan atau menghapus akses pengguna yang terbukti melanggar ketentuan, membahayakan sistem, atau menyalahgunakan layanan.
          </p>

          <h2 className="text-lg font-semibold">7. Hukum yang Berlaku</h2>
          <p>
            Syarat dan Ketentuan ini tunduk pada hukum yang berlaku di wilayah hukum tempat pengembang aplikasi beroperasi.
          </p>

          <h2 className="text-lg font-semibold">8. Kontak</h2>
          <p>
            Untuk pertanyaan lebih lanjut mengenai Syarat dan Ketentuan ini, silakan hubungi tim pengembang melalui email resmi atau halaman kontak Moniq.
          </p>
        </section>
      </main>
    </LayoutShell>
  )
}

export default TermsAndConditionsPage
