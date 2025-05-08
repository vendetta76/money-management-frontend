
import React, { useEffect, useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import { usePinLock } from "../../context/PinLockContext";
import LayoutShell from "../../layouts/LayoutShell";

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  // PIN related state
  const [newPin, setNewPin] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [resetPinVal, setResetPinVal] = useState("");

  const { pin, setPin, resetPin, removePin } = usePinLock();

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

  const handleResetPin = async () => {
    if (!authPassword) {
      alert("Mohon isi Password Akun terlebih dahulu.");
      return;
    }

    try {
      const cred = EmailAuthProvider.credential(user?.email!, authPassword);
      await reauthenticateWithCredential(user!, cred);
      if (resetPinVal.length < 4) return alert("PIN minimal 4 digit");
      resetPin(resetPinVal);
      setResetPinVal("");
      alert("PIN berhasil di-reset!");
    } catch (err: any) {
      alert("Gagal autentikasi: " + err.message);
    }
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

        {/* Atur PIN Baru */}
        {!pin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">🔒 Atur PIN Baru</h2>
            <input
              type="password"
              placeholder="PIN baru"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="border w-full px-3 py-2 mb-2 rounded"
            />
            <button
              onClick={() => {
                if (newPin.length < 4) return alert("PIN minimal 4 digit");
                setPin(newPin);
                setNewPin("");
                alert("PIN berhasil disimpan!");
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Simpan PIN
            </button>
          </div>
        )}

        {/* Reset PIN */}
        {pin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">🔁 Reset PIN (dengan Password)</h2>
            <input
              type="password"
              placeholder="Password Akun"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="border w-full px-3 py-2 mb-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="PIN baru"
              value={resetPinVal}
              onChange={(e) => setResetPinVal(e.target.value)}
              className="border w-full px-3 py-2 mb-2 rounded"
            />
            <button
              onClick={handleResetPin}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Reset PIN
            </button>
          </div>
        )}

        {/* Hapus PIN */}
        {pin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">🗑️ Hapus PIN</h2>
            <button
              onClick={() => {
                if (window.confirm("Yakin ingin menghapus PIN?")) {
                  removePin();
                  alert("PIN berhasil dihapus.");
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Hapus PIN
            </button>
          </div>
        )}
      </div>
    </LayoutShell>
  );
};

export default SecurityPage;
