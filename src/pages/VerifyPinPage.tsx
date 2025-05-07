import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyPinPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/verify-pin', { pin });
      navigate('/wallet');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verifikasi gagal');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-80"
      >
        <h2 className="text-2xl font-semibold mb-4">Masukkan PIN</h2>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN 6 digit"
          className="border rounded p-2 w-full mb-3"
        />
        {error && <p className="text-red-500 mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 rounded bg-blue-600 text-white font-medium"
        >
          Verifikasi
        </button>
        <p className="mt-3 text-sm text-center">
          <a href="/forgot-pin" className="text-blue-600 hover:underline">
            Lupa PIN?
          </a>
        </p>
      </form>
    </div>
  );
};

export default VerifyPinPage;
