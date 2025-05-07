// src/pages/ResetPinPage.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LayoutShell from '../layouts/LayoutShell';

const ResetPinPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      setMessage('PIN tidak cocok.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/reset-pin', { token, newPin: pin });
      setMessage('PIN berhasil di-reset! Redirect ke Wallet…');
      setTimeout(() => navigate('/wallet'), 1500);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Gagal reset PIN.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!token) {
      setMessage('Token tidak ditemukan di URL.');
    }
  }, [token]);

  return (
    <LayoutShell>
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔄 Reset PIN</h1>
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="PIN baru (4–6 digit)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="block w-full mb-3 border rounded px-4 py-2"
          />
          <input
            type="password"
            placeholder="Ulangi PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="block w-full mb-4 border rounded px-4 py-2"
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

export default ResetPinPage;
