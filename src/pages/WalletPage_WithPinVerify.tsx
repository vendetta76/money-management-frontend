// src/pages/WalletPage_WithPinVerify.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebaseClient';
import WalletPage from './WalletPage';

const WalletPage_WithPinVerify: React.FC = () => {
  const { user } = useAuth();
  const [storedPin, setStoredPin] = useState<string>('');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [verified, setVerified] = useState<boolean>(false);
  const [loadingPin, setLoadingPin] = useState<boolean>(true);
  const [pinError, setPinError] = useState<string>('');

  // Ambil PIN user
  useEffect(() => {
    const fetchPin = async () => {
      if (!user?.uid) {
        setLoadingPin(false);
        return;
      }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setStoredPin(data.pin || '');
      }
      setLoadingPin(false);
    };
    fetchPin();
  }, [user]);

  // Baca timeout dari Preferences (localStorage)
  const sessionTimeout = useMemo<number>(() => {
    const val = localStorage.getItem('sessionTimeout');
    return val ? Number(val) : 5 * 60 * 1000;
  }, []);

  // Periksa apakah masih dalam window verifikasi
  useEffect(() => {
    const at = Number(localStorage.getItem('walletPinVerifiedAt'));
    if (at && Date.now() - at < sessionTimeout) {
      setVerified(true);
    }
  }, [sessionTimeout]);

  const handlePinSubmit = () => {
    if (enteredPin === storedPin) {
      localStorage.setItem('walletPinVerifiedAt', Date.now().toString());
      setVerified(true);
      setPinError('');
    } else {
      setPinError('PIN salah. Coba lagi.');
    }
  };

  // Loading
  if (loadingPin) {
    return <div className="p-6 text-center">Loading PIN...</div>;
  }
  // Kalau belum set PIN, langsung tampil Wallet
  if (!storedPin) {
    return <WalletPage />;
  }
  // Belum verifikasi
  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded shadow-md w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-4">🔒 Masukkan PIN</h2>
          <input
            type="password"
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            placeholder="PIN Akses"
            maxLength={6}
            className="w-full mb-3 px-4 py-2 border rounded"
            onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
          />
          {pinError && <p className="text-red-500 mb-3">{pinError}</p>}
          <button
            onClick={handlePinSubmit}
            className="w-full bg-purple-600 text-white py-2 rounded"
          >
            Verifikasi
          </button>
        </div>
      </div>
    );
  }

  // Setelah verifikasi, render WalletPage
  return <WalletPage />;
};

export default WalletPage_WithPinVerify;
