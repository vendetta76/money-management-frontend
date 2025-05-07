// src/pages/WalletPage_WithPinVerify.tsx
import React, { useEffect, useState } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import WalletPage from './WalletPage'
import LayoutShell from '../layouts/LayoutShell'
import { usePreferences } from '../context/PreferencesContext'

const WalletPage_WithPinVerify: React.FC = () => {
  const { user } = useAuth()
  const { requirePinOnIdle, pinIdleTimeoutMs } = usePreferences()

  const [storedPin, setStoredPin] = useState<string>('')
  const [enteredPin, setEnteredPin] = useState<string>('')
  const [verified, setVerified] = useState<boolean>(false)
  const [loadingPin, setLoadingPin] = useState<boolean>(true)
  const [pinError, setPinError] = useState<string>('')

  // Ambil PIN user dari Firestore
  useEffect(() => {
    const fetchPin = async () => {
      if (!user?.uid) {
        setLoadingPin(false)
        return
      }
      const snap = await getDoc(doc(db, 'users', user.uid))
      setStoredPin(snap.exists() ? snap.data().pin || '' : '')
      setLoadingPin(false)
    }
    fetchPin()
  }, [user])

  // Cek sesi sebelumnya
  useEffect(() => {
    const at = Number(localStorage.getItem('walletPinVerifiedAt'))
    if (at && Date.now() - at < pinIdleTimeoutMs) {
      setVerified(true)
    }
  }, [pinIdleTimeoutMs])

  const handlePinSubmit = () => {
    if (enteredPin === storedPin) {
      localStorage.setItem('walletPinVerifiedAt', Date.now().toString())
      setVerified(true)
      setPinError('')
    } else {
      setPinError('PIN salah. Coba lagi.')
      setEnteredPin('')
    }
  }

  if (loadingPin) {
    return (
      <LayoutShell>
        <div className="p-6 text-center">Loading PIN…</div>
      </LayoutShell>
    )
  }

  // ⚠️ FIXED: Jangan bypass kalau requirePinOnIdle = false, cukup cek storedPin
  if (!storedPin) {
    return <WalletPage />
  }

  if (!verified) {
    return (
      <LayoutShell>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="p-6 bg-white rounded shadow-md w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">🔒 Masukkan PIN</h2>
            <input
              type="password"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="PIN Akses"
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handlePinSubmit()}
              className="w-full mb-3 px-4 py-2 border rounded text-center"
              autoFocus
            />
            {pinError && <p className="text-red-500 mb-3">{pinError}</p>}
            <button
              onClick={handlePinSubmit}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              disabled={enteredPin.length !== 6}
            >
              Verifikasi
            </button>
          </div>
        </div>
      </LayoutShell>
    )
  }

  return <WalletPage />
}

export default WalletPage_WithPinVerify
