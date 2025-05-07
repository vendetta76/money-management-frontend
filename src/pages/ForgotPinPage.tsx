// src/pages/ForgotPinPage.tsx
import React, { useState } from 'react';
import axios from 'axios';
import LayoutShell from '../layouts/LayoutShell';

const ForgotPinPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    try {
      // assume token auth header sudah otomatis terpasang
      await axios.post('/api/request-pin-reset');
      setMessage('Email reset PIN telah dikirim!');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Gagal mengirim request.');
    }
    setLoading(false);
  };

  return (
    <LayoutShell>
      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔑 Lupa PIN?</h1>
        <p className="mb-4">
          Kami akan mengirim email berisi link untuk reset PIN Anda.
        </p>
        <button
          onClick={handleRequest}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg w-full"
        >
          {loading ? 'Mengirim...' : 'Kirim Link Reset PIN'}
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </main>
    </LayoutShell>
  );
};

export default ForgotPinPage;
