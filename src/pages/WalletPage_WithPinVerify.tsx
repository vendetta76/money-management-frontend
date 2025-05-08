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

  if (typeof pinIdleTimeoutMs !== 'number') {
    return <LayoutShell><div className="p-6 text-center">Loading preference…</div></LayoutShell>
  }
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

  // Validasi sesi aktif dan PIN
  useEffect(() => {
    const pinVerifiedAt = Number(localStorage.getItem('walletPinVerifiedAt'))
    const walletSession = Number(localStorage.getItem('lastWalletAccess'))
    const now = Date.now()

    const sessionValid = walletSession && now - walletSession < pinIdleTimeoutMs
    const pinValid = pinVerifiedAt && now - pinVerifiedAt < pinIdleTimeoutMs

    console.log({ sessionValid, pinValid, pinIdleTimeoutMs })
    if (sessionValid || pinValid) {
      setVerified(true)
    }
  }, [pinIdleTimeoutMs])

  const handlePinSubmit = () => {
    if (enteredPin === storedPin) {
      localStorage.setItem('walletPinVerifiedAt', Date.now().toString())
      localStorage.setItem('lastWalletAccess', Date.now().toString()) // ✅ PATCH HERE
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

  if (!storedPin) {
    return <WalletPage />
  }

  if (!verified) {
    return (
      <LayoutShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-center">Masukkan PIN</h2>
            <input
              type="password"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-2"
              placeholder="PIN"
            />
            {pinError && <p className="text-red-500 text-sm mb-2">{pinError}</p>}
            <button
              onClick={handlePinSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
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
