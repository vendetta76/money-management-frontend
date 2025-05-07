// src/pages/ForgotPinPage.tsx
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import LayoutShell from '../layouts/LayoutShell';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebaseClient';

const ForgotPinPage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage('User belum terautentikasi');
      return;
    }
    if (!currentPassword || !newPin || !confirmPin) {
      setMessage('Lengkapi semua field.');
      return;
    }
    if (newPin !== confirmPin) {
      setMessage('PIN baru tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate dengan password lama
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update PIN di Firestore
      await updateDoc(doc(db, 'users', user.uid), { pin: newPin });

      setMessage('PIN berhasil di-reset!');
      setCurrentPassword('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setMessage(`Gagal reset PIN: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <LayoutShell>
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔑 Reset PIN via Password</h1>
        <form onSubmit={handleResetPin} className="space-y-4">
          <input
            type="password"
            placeholder="Password saat ini"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="block w-full border rounded px-4 py-2"
          />
          <input
            type="password"
            placeholder="PIN baru (4–6 digit)"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            className="block w-full border rounded px-4 py-2"
          />
          <input
            type="password"
            placeholder="Konfirmasi PIN baru"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="block w-full border rounded px-4 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg w-full"
          >
            {loading ? 'Memproses...' : 'Reset PIN'}
          </button>
        </form>
        {message && <p className="mt-4 text-center">{message}</p>}
      </main>
    </LayoutShell>
  );
};

export default ForgotPinPage;
