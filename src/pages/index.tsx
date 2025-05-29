// pages/index.tsx
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ChevronRight, Rocket, Star } from 'lucide-react';

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>MeowIQ – Aplikasi Keuangan Pintar</title>
        <meta name="description" content="Kelola keuangan pribadi dan catat pengeluaran harian dengan MeowIQ. Gratis, unik, dan berbeda dari yang lain." />
        <meta name="keywords" content="aplikasi keuangan pribadi, pengeluaran harian, budgeting gratis, dompet digital" />
        <meta property="og:title" content="MeowIQ – Aplikasi Keuangan Pintar" />
        <meta property="og:description" content="Catat pengeluaran, kelola keuangan pribadi, dan nikmati fitur unik gratis. Cocok untuk semua kalangan." />
        <meta property="og:image" content="https://meowiq.com/assets/kucing-cuan.webp" />
        <meta property="og:url" content="https://meowiq.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://meowiq.com/" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col justify-center items-center p-8 text-center">
        <div className="text-5xl font-bold mb-4 drop-shadow-lg">
          Kelola Keuangan <br /> <span className="text-yellow-300">Dengan Cerdas</span>
        </div>
        <p className="text-xl max-w-xl mb-6">
          Aplikasi PWA revolusioner untuk mengelola keuangan pribadi, mencatat transaksi, dan melihat laporan dengan AI.
        </p>
        <div className="flex space-x-4">
          <a href="/login" className="bg-white text-pink-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
            Masuk Sekarang <ChevronRight className="inline-block w-4 h-4 ml-1" />
          </a>
          <a href="/register" className="bg-pink-600 px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition text-white">
            Mulai Gratis <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </a>
        </div>

        <div className="grid grid-cols-3 gap-8 mt-12 text-center">
          <div>
            <div className="text-3xl font-bold">50K+</div>
            <div>Pengguna Aktif</div>
          </div>
          <div>
            <div className="text-3xl font-bold">Rp10M+</div>
            <div>Dikelola</div>
          </div>
          <div>
            <div className="text-3xl font-bold">99.9%</div>
            <div>Uptime</div>
          </div>
        </div>

        <footer className="mt-16 text-sm text-white/80">
          Powered by <a href="https://meowiq.com" className="underline text-white">MeowIQ</a>
        </footer>
      </div>
    </>
  );
};

export default Home;
