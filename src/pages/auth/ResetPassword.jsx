import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error("Gagal atur ulang password: " + error.message);
    } else {
      toast.success("Password berhasil diubah!");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-500 relative">
      <Toaster />
      <button
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 text-black hover:text-gray-800 bg-white/80 p-2 rounded-full shadow"
      >
        <ArrowLeft size={20} />
      </button>
      <form
        onSubmit={handleReset}
        className="bg-white/90 backdrop-blur p-6 rounded-xl shadow-lg w-full max-w-md space-y-4 animate-fade-in"
      >
        <h2 className="text-2xl font-bold text-center text-purple-600">Atur Ulang Password</h2>
        <p className="text-sm text-center text-gray-600">
          Masukkan password baru kamu di bawah ini.
        </p>
        <input
          type="password"
          placeholder="Password Baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          disabled={loading || !password}
        >
          {loading ? "Menyimpan..." : "Simpan Password"}
        </button>
      </form>
    </div>
  );
}
