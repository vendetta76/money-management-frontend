import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
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

  const [email, setEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPin, setNewPin] = useState<string>("");
  const [confirmNewPin, setConfirmNewPin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const handleResetPinViaPassword = async () => {
    if (!user) return;
    if (!currentPassword || !newPin || !confirmNewPin) {
      alert("Lengkapi semua field");
      return;
    }
    if (newPin !== confirmNewPin) {
      alert("PIN baru tidak cocok");
      return;
    }
    setLoading(true);
    try {
      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(
        email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update PIN in Firestore
      await updateDoc(doc(db, "users", user.uid), { pin: newPin });

      alert("PIN berhasil di-reset");
      // Reset form
      setCurrentPassword("");
      setNewPin("");
      setConfirmNewPin("");
    } catch (err: any) {
      alert(`Gagal reset PIN: ${err.message}`);
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    // existing password change logic
  };

  return (
    <LayoutShell>
      <main className="p-4 sm:p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔒 Keamanan Akun</h1>

        <section className="mb-8">
          <h2 className="font-semibold mb-2">Ganti Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <input
              type="password"
              placeholder="Password lama"
              className="block w-full border rounded px-4 py-2"
              value={currentPassword /* reuse state? */}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {/* ... fields for new password here ... */}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full"
            >
              Ubah Password
            </button>
          </form>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Reset PIN</h2>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Password saat ini"
              className="block w-full border rounded px-4 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="PIN baru (4–6 digit)"
              className="block w-full border rounded px-4 py-2"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
            <input
              type="password"
              placeholder="Ulangi PIN baru"
              className="block w-full border rounded px-4 py-2"
              value={confirmNewPin}
              onChange={(e) => setConfirmNewPin(e.target.value)}
            />
            <button
              onClick={handleResetPinViaPassword}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg w-full"
            >
              {loading ? "Memproses..." : "Reset PIN"}
            </button>
          </div>
        </section>
      </main>
    </LayoutShell>
  );
};

export default SecurityPage;
