import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function AutoLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const confirmLogin = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        toast.error("Gagal login otomatis. Silakan login manual.");
        navigate("/login");
        return;
      }

      toast.success("Verifikasi sukses! Masuk ke dashboard...");
      navigate("/dashboard");
    };

    confirmLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-white">
      <div>
        <h2 className="text-xl font-bold text-purple-600">🔄 Memverifikasi akun kamu...</h2>
        <p className="text-gray-500 text-sm mt-2">Sebentar ya, redirect otomatis...</p>
      </div>
    </div>
  );
}
