import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://moniq.pages.dev/auto-login"
      },      
    });

    if (signupError) {
      toast.error("Gagal daftar: " + signupError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId, username, role: "user" });

      if (insertError) {
        toast.error("Gagal simpan profil: " + insertError.message);
        setLoading(false);
        return;
      }
    }

    toast.success("Daftar berhasil. Cek email kamu untuk verifikasi!");
    navigate("/check-email");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 relative">
      <Toaster />
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 text-black hover:text-gray-800 bg-white/80 p-2 rounded-full shadow"
      >
        <ArrowLeft size={20} />
      </button>
      <form
        onSubmit={handleRegister}
        className="bg-white/90 backdrop-blur p-6 rounded-xl shadow-lg w-full max-w-md space-y-4 animate-fade-in"
      >
        <img src="https://i.postimg.cc/T1sVKy2r/logo.webp" alt="MoneyApp" className="w-10 mx-auto" />
        <h2 className="text-2xl font-bold text-center text-purple-600">Daftar Akun MoneyApp</h2>

        <input
          type="text"
          placeholder="Nama Pengguna"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
          required
        />
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

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          disabled={loading || !email || !password || !username}
        >
          {loading ? "Mendaftar..." : "Daftar"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full text-sm text-purple-600 hover:underline text-center"
        >
          Sudah punya akun? Masuk
        </button>
        <p className="text-xs text-gray-500 text-center mt-6">
          © 2025 MoneyApp By Vendetta
        </p>
      </form>
    </div>
  );
}
