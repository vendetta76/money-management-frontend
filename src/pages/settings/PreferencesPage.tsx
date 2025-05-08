// src/pages/settings/PreferencesPage.tsx
import React, { useState, useEffect } from 'react'
import LayoutShell from '../../layouts/LayoutShell'
import { toast } from 'react-hot-toast'
import { usePreferences } from '../../context/PreferencesContext'

const PreferencesPage: React.FC = () => {
  const { preferences, setPreferences } = usePreferences()

  const [pendingLogoutTimeout, setPendingLogoutTimeout] = useState<number>(preferences.logoutTimeoutMs)
  const [applied, setApplied] = useState(true)

  useEffect(() => {
    setApplied(pendingLogoutTimeout === preferences.logoutTimeoutMs)
  }, [pendingLogoutTimeout, preferences])

  const handleApply = () => {
    localStorage.setItem('logoutTimeout', pendingLogoutTimeout.toString())
    setPreferences({
      ...preferences,
      logoutTimeoutMs: pendingLogoutTimeout,
    })
    setApplied(true)
    toast.success('Preferensi berhasil diterapkan')
  }

  return (
    <LayoutShell>
      <main className="px-4 py-6 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">⚙️ Preferensi</h1>

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

export default PreferencesPage;
