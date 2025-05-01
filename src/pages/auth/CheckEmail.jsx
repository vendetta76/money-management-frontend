import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient"; // Pastikan file ini ada

export default function CheckEmail() {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user?.email_confirmed_at) {
        setVerified(true);
        clearInterval(interval);
        navigate("/dashboard");
      }
    }, 5000); // cek setiap 5 detik

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-center p-6">
      <div className="space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-purple-700">🚀 Daftar Berhasil!</h1>
        <p className="text-gray-600">Cek email kamu dan klik link verifikasi yang kami kirim.</p>
        <p className="text-sm text-gray-400">
          Halaman ini akan otomatis lanjut ke dashboard setelah email kamu terverifikasi.
        </p>
        {!verified && <p className="text-xs text-gray-300">Menunggu verifikasi...</p>}
      </div>
    </div>
  );
}
