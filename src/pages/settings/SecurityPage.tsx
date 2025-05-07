import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import LayoutShell from "../../layouts/LayoutShell";

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPwd, setLoadingPwd] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.pin) setPin(data.pin);
      }
    });
  }, [user]);

  const handleDeletePin = async () => {
    if (confirmPin !== pin) {
      alert("PIN tidak cocok");
      return;
    }
    try {
      await updateDoc(doc(db, "users", user!.uid), { pin: "" });
      alert("PIN berhasil dihapus");
      setPin("");
      setConfirmPin("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus PIN");
    }
  };

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
      <main className="p-4 sm:p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔒 Keamanan</h1>

        {/* Email */}
        <div className="mb-6">
          <label className="block font-medium mb-1">Email</label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full bg-gray-100 dark:bg-gray-800 border rounded px-4 py-2"
          />
        </div>

        {/* Ganti PIN Akses */}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Ganti PIN Akses</h2>
          {pin ? (
            <>
              <p className="mb-2">PIN saat ini telah disetel.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded flex-1"
                >
                  Hapus PIN
                </button>
                <button
                  onClick={() => navigate("/forgot-pin")}
                  className="bg-yellow-500 text-black px-4 py-2 rounded flex-1"
                >
                  Reset PIN
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="4–6 digit"
                className="block w-full mb-2 border rounded px-4 py-2"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <input
                type="password"
                placeholder="Ulangi PIN"
                className="block w-full mb-2 border rounded px-4 py-2"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!user) return;
                  if (pin !== confirmPin) {
                    alert("PIN tidak cocok");
                    return;
                  }
                  try {
                    await updateDoc(doc(db, "users", user.uid), { pin });
                    alert("PIN berhasil disimpan");
                  } catch (err) {
                    console.error(err);
                    alert("Gagal menyimpan PIN");
                  }
                }}
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Setel PIN
              </button>
            </>
          )}
        </div>

        {/* Form Hapus PIN Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm">
              <h3 className="text-lg font-semibold mb-4">
                Konfirmasi Hapus PIN
              </h3>
              <input
                type="password"
                placeholder="Masukkan PIN untuk konfirmasi"
                className="w-full mb-4 border rounded px-4 py-2"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeletePin}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ganti Password */}
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <h2 className="font-semibold mb-2">Ganti Password</h2>
          <input
            type="password"
            placeholder="Password lama"
            className="block w-full border rounded px-4 py-2"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            className="block w-full border rounded px-4 py-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Ulangi password"
            className="block w-full border rounded px-4 py-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loadingPwd}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full"
          >
            {loadingPwd ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </main>
    </LayoutShell>
  );
};

export default SecurityPage;
