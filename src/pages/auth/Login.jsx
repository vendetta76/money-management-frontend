import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Login gagal. Email atau password salah.");
      setLoading(false);
      return;
    }

    const { user } = data;
    if (!user?.email_confirmed_at) {
      toast.error("Email belum diverifikasi. Cek inbox atau spam kamu!");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    toast.success("Login berhasil!");
    setLoading(false);
    // Redirect dilakukan oleh useEffect di atas
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 relative">
      <Toaster />
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-black hover:text-gray-800 bg-white/80 p-2 rounded-full shadow"
      >
        <ArrowLeft size={20} />
      </button>
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur p-6 rounded-xl shadow-lg w-full max-w-md space-y-4 animate-fade-in"
      >
        <img src="https://i.postimg.cc/T1sVKy2r/logo.webp" alt="MoneyApp" className="w-10 mx-auto" />
        <h2 className="text-2xl font-bold text-center text-purple-600">Login ke MoneyApp</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-2 right-3 text-gray-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-purple-600"
            />
            Ingat saya
          </label>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-blue-500 hover:underline"
          >
            Lupa password?
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          disabled={loading || !email || !password}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="w-full text-sm text-purple-600 hover:underline text-center"
        >
          Belum punya akun? Daftar sekarang
        </button>
        <p className="text-xs text-gray-500 text-center mt-6">
          © 2025 MoneyApp • By Vendetta
        </p>
      </form>
    </div>
  );
}
