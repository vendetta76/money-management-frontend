import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { db } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import LayoutShell from "../../layouts/LayoutShell";

const SecurityPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const fetchPin = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data?.pin) {
          setPin(data.pin);
        }
      }
    };
    fetchPin();
  }, [user]);

  const handleResetPassword = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        alert("Email reset password telah dikirim.");
      } else {
        const err = await res.json();
        alert("Gagal mengirim email reset password: " + err.message);
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("Terjadi kesalahan.");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      alert("Password baru tidak cocok");
      return;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      alert("Gagal mengganti password: " + error.message);
    }
    setLoading(false);
  };

  const handleDeletePin = async () => {
    if (!user) return;
    if (confirmPin !== pin) {
      alert("PIN tidak cocok");
      return;
    }
    try {
      await updateDoc(doc(db, "users", user.uid), { pin: "" });
      alert("PIN berhasil dihapus");
      setPin("");
      setConfirmPin("");
      setShowModal(false);
    } catch (error) {
      alert("Gagal menghapus PIN");
      console.error(error);
    }
  };

  return (
    <LayoutShell>
      <main className="p-4 sm:p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔒 Keamanan</h1>

        <div className="mb-6">
          <label className="block font-medium mb-1">Email</label>
          <input
            type="text"
            value={email}
            disabled
            className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-4 py-2"
          />
        </div>

        <div className="mb-8">
          <h2 className="font-semibold mb-2">Ganti PIN Akses</h2>

          {pin ? (
            <>
              <p className="mb-2">PIN saat ini telah disetel.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-500 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Hapus PIN
              </button>
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
                  } catch (error) {
                    alert("Gagal menyimpan PIN");
                    console.error(error);
                  }
                }}
                className="bg-red-400 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Setel PIN
              </button>
            </>
          )}
        </div>

        <form onSubmit={handlePasswordChange}>
          <h2 className="font-semibold mb-2">Ganti Password</h2>
          <input
            type="password"
            placeholder="Password lama"
            className="block w-full mb-2 border rounded px-4 py-2"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            className="block w-full mb-2 border rounded px-4 py-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Ulangi password"
            className="block w-full mb-4 border rounded px-4 py-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? "Menyimpan..." : "Ubah Password"}
          </button>

          <div className="mt-4">
            <button
              onClick={handleResetPassword}
              type="button"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
            >
              Reset Password via Email
            </button>
          </div>
        </form>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus PIN</h3>
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
      </main>
    </LayoutShell>
  );
};

export default SecurityPage;
