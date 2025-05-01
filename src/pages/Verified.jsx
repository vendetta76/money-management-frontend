import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Verified() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/login");
    }, 5000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">✅ Email kamu sudah diverifikasi!</h1>
        <p className="text-lg">Kamu akan diarahkan ke halaman login dalam beberapa detik...</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-white text-green-600 px-4 py-2 rounded shadow hover:bg-gray-100"
        >
          Langsung ke Login
        </button>
      </div>
    </div>
  );
}
