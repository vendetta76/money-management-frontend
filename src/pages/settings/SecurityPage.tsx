import React, { useEffect, useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import LayoutShell from "../../layouts/LayoutShell";

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      alert("Password baru tidak cocok");
      return;
    }
    setLoadingPwd(true);
    try {
      const cred = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      alert("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert("Gagal mengganti password: " + err.message);
    }
    setLoadingPwd(false);
  };

  return (
    <LayoutShell>
      <div className="max-w-xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Keamanan Akun</h1>

        {/* Ganti Password */}
        <form onSubmit={handlePasswordChange} className="mb-8">
          <h2 className="text-lg font-semibold mb-2">🔐 Ganti Password</h2>
          <input
            type="password"
            placeholder="Password Sekarang"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border w-full px-3 py-2 mb-2 rounded"
          />
          <input
            type="password"
            placeholder="Password Baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border w-full px-3 py-2 mb-2 rounded"
          />
          <input
            type="password"
            placeholder="Konfirmasi Password Baru"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border w-full px-3 py-2 mb-4 rounded"
          />
          <button
            type="submit"
            disabled={loadingPwd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Simpan Password
          </button>
        </form>
      </div>
    </LayoutShell>
  );
};

export default SecurityPage;