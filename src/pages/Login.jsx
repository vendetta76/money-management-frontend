import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ DEBUG LOGS
    console.log("🔐 Login Payload:", { email, password });
    console.log("🌐 API Base URL:", import.meta.env.VITE_API_URL);

    try {
      const res = await API.post("/auth/login", { email, password });

      // ✅ RESPONSE LOG
      console.log("✅ Login Success Response:", res.data);

      const token = res.data.token;
      const user = {
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        role: res.data.role
      };

      login(user, token);
      navigate("/app");
    } catch (err) {
      // ❌ ERROR LOG
      console.error("❌ Login Error:", err);
      alert("Login gagal. Cek email/password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-purple-600">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2"
          required
        />
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Masuk
        </button>
      </form>
    </div>
  );
}
