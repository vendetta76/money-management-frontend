// src/pages/PreferencesPage.tsx
import { useState, useEffect } from 'react'
import LayoutShell from '../../layouts/LayoutShell'

const PreferencesPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  )
  const [sessionTimeout, setSessionTimeout] = useState<number>(() => {
    const val = localStorage.getItem('sessionTimeout')
    return val ? Number(val) : 5 * 60 * 1000 // default 5 menit
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('sessionTimeout', sessionTimeout.toString())
  }, [sessionTimeout])

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 pt-4 md:ml-64 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">⚙️ Preferensi</h1>

        {/* Mode Gelap */}
        <div className="flex items-center justify-between mb-4">
          <span>Mode Gelap</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-purple-600 relative transition">
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-4 transition" />
            </div>
          </label>
        </div>

        {/* Session Timeout */}
        <div className="flex items-center justify-between mb-4">
          <span>Durasi Verifikasi PIN (ms)</span>
          <select
            value={sessionTimeout}
            onChange={e => setSessionTimeout(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            <option value={5 * 60 * 1000}>5 menit</option>
            <option value={10 * 60 * 1000}>10 menit</option>
            <option value={15 * 60 * 1000}>15 menit</option>
            <option value={30 * 60 * 1000}>30 menit</option>
          </select>
        </div>
      </main>
    </LayoutShell>
  )
}

export default PreferencesPage


// src/pages/WalletPage_WithPinVerify.tsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import LayoutShell from '../layouts/LayoutShell'
import WalletPage from './WalletPage'

const WalletPage_WithPinVerify: React.FC = () => {
  const { user } = useAuth()
  const [storedPin, setStoredPin] = useState<string>('')
  const [enteredPin, setEnteredPin] = useState<string>('')
  const [verified, setVerified] = useState<boolean>(false)
  const [loadingPin, setLoadingPin] = useState<boolean>(true)
  const [pinError, setPinError] = useState<string>('')

  // Ambil PIN & simpan ke state
  useEffect(() => {
    const fetchPin = async () => {
      if (!user?.uid) return
      const snap = await import('firebase/firestore').then(({ getDoc, doc }) =>
        getDoc(doc(import('../lib/firebaseClient').then(({ db }) => db), 'users', user.uid))
      )
      setStoredPin(snap.exists() ? snap.data().pin || '' : '')
      setLoadingPin(false)
    }
    fetchPin()
  }, [user])

  // Ambil sessionTimeout dari preferences
  const [sessionTimeout] = useState<number>(() => {
    const val = localStorage.getItem('sessionTimeout')
    return val ? Number(val) : 5 * 60 * 1000
  })

  // Cek sessionStorage verif PIN
  useEffect(() => {
    const at = Number(sessionStorage.getItem('walletPinVerifiedAt'))
    if (at && Date.now() - at < sessionTimeout) {
      setVerified(true)
    }
  }, [sessionTimeout])

  const handlePinSubmit = () => {
    if (enteredPin === storedPin) {
      sessionStorage.setItem('walletPinVerifiedAt', Date.now().toString())
      setVerified(true)
      setPinError('')
    } else {
      setPinError('PIN salah. Coba lagi.')
    }
  }

  if (loadingPin) {
    return <div>Loading PIN...</div>
  }
  if (!storedPin) return <WalletPage />
  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-6 bg-white rounded shadow">
          <h2 className="text-xl mb-4">🔒 Masukkan PIN</h2>
          <input
            type="password"
            value={enteredPin}
            onChange={e => setEnteredPin(e.target.value)}
            placeholder="PIN Akses"
            className="block w-full mb-2 px-4 py-2 border rounded"
          />
          {pinError && <p className="text-red-500 mb-2">{pinError}</p>}
          <button
            onClick={handlePinSubmit}
            className="w-full bg-purple-600 text-white py-2 rounded"
          >
            Verifikasi
          </button>
        </div>
      </div>
    )
  }

  return <WalletPage />
}

export default WalletPage_WithPinVerify
