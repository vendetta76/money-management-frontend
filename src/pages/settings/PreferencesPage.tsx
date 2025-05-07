// src/pages/settings/PreferencesPage.tsx
import React, { useState, useEffect } from 'react'
import LayoutShell from '../../layouts/LayoutShell'
import { toast } from 'react-hot-toast'
import { usePreferences } from '../../context/PreferencesContext'

const PreferencesPage: React.FC = () => {
  const { preferences, setPreferences } = usePreferences()

  // Inisialisasi dari localStorage ke Context
  useEffect(() => {
    const pinVal = localStorage.getItem('pinTimeout')
    const logoutVal = localStorage.getItem('logoutTimeout')
    setPreferences({
      ...preferences,
      requirePinOnIdle: pinVal !== null,
      pinIdleTimeoutMs: pinVal ? Number(pinVal) : preferences.pinIdleTimeoutMs,
      logoutTimeoutMs: logoutVal ? Number(logoutVal) : preferences.logoutTimeoutMs,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // State pending form
  const [requirePinOnIdle, setRequirePinOnIdle] = useState<boolean>(preferences.requirePinOnIdle)
  const [pendingPinTimeout, setPendingPinTimeout] = useState<number>(preferences.pinIdleTimeoutMs)
  const [pendingLogoutTimeout, setPendingLogoutTimeout] = useState<number>(preferences.logoutTimeoutMs)

  // Cek apakah ada perubahan yang belum diterapkan
  const [applied, setApplied] = useState(true)
  useEffect(() => {
    setApplied(
      requirePinOnIdle === preferences.requirePinOnIdle &&
      pendingPinTimeout === preferences.pinIdleTimeoutMs &&
      pendingLogoutTimeout === preferences.logoutTimeoutMs
    )
  }, [requirePinOnIdle, pendingPinTimeout, pendingLogoutTimeout, preferences])

  const handleApply = () => {
    localStorage.setItem('pinTimeout', requirePinOnIdle ? pendingPinTimeout.toString() : '0')
    localStorage.setItem('logoutTimeout', pendingLogoutTimeout.toString())
    setPreferences({
      ...preferences,
      requirePinOnIdle,
      pinIdleTimeoutMs: pendingPinTimeout,
      logoutTimeoutMs: pendingLogoutTimeout,
    })
    setApplied(true)
    toast.success('Preferensi berhasil diterapkan')
  }

  return (
    <LayoutShell>
      <main className="px-4 py-6 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">⚙️ Preferensi</h1>

        {/* Toggle PIN on Idle */}
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={requirePinOnIdle}
              onChange={e => setRequirePinOnIdle(e.target.checked)}
              className="mr-2"
            />
            Minta PIN lagi setelah idle
          </label>
        </div>

        {/* Timeout PIN */}
        {requirePinOnIdle && (
          <div className="flex items-center justify-between mb-4">
            <span>Timeout PIN</span>
            <select
              value={pendingPinTimeout}
              onChange={e => setPendingPinTimeout(Number(e.target.value))}
              className="border rounded px-3 py-1"
            >
              <option value={0}>0 (Off)</option>
              <option value={5 * 60 * 1000}>5 menit</option>
              <option value={10 * 60 * 1000}>10 menit</option>
              <option value={15 * 60 * 1000}>15 menit</option>
              <option value={30 * 60 * 1000}>30 menit</option>
            </select>
          </div>
        )}

        {/* Logout Timeout */}
        <div className="flex items-center justify-between mb-6">
          <span>Durasi Logout Otomatis</span>
          <select
            value={pendingLogoutTimeout}
            onChange={e => setPendingLogoutTimeout(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            <option value={0}>Off</option>
            <option value={5 * 60 * 1000}>5 menit</option>
            <option value={10 * 60 * 1000}>10 menit</option>
            <option value={15 * 60 * 1000}>15 menit</option>
            <option value={30 * 60 * 1000}>30 menit</option>
          </select>
        </div>

        {/* Tombol Apply */}
        <div className="flex justify-end">
          <button
            onClick={handleApply}
            disabled={applied}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              applied
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {applied ? 'Applied' : 'Apply'}
          </button>
        </div>
      </main>
    </LayoutShell>
  )
}

export default PreferencesPage
