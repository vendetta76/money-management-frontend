// src/pages/settings/PreferencesPage.tsx
import { useState, useEffect } from 'react'
import LayoutShell from '../../layouts/LayoutShell'
import { toast } from 'react-hot-toast'

const PreferencesPage: React.FC = () => {
  // Load stored values or defaults
  const [pinTimeout, setPinTimeout] = useState<number>(() => {
    const val = localStorage.getItem('pinTimeout')
    return val ? Number(val) : 5 * 60 * 1000
  })
  const [logoutTimeout, setLogoutTimeout] = useState<number>(() => {
    const val = localStorage.getItem('logoutTimeout')
    return val ? Number(val) : 0
  })

  // Pending values in form
  const [pendingPinTimeout, setPendingPinTimeout] = useState<number>(pinTimeout)
  const [pendingLogoutTimeout, setPendingLogoutTimeout] = useState<number>(logoutTimeout)

  // Track if unapplied changes exist
  const [applied, setApplied] = useState<boolean>(true)
  useEffect(() => {
    setApplied(
      pendingPinTimeout === pinTimeout &&
      pendingLogoutTimeout === logoutTimeout
    )
  }, [pendingPinTimeout, pendingLogoutTimeout, pinTimeout, logoutTimeout])

  const handleApply = () => {
    localStorage.setItem('pinTimeout', pendingPinTimeout.toString())
    localStorage.setItem('logoutTimeout', pendingLogoutTimeout.toString())
    setPinTimeout(pendingPinTimeout)
    setLogoutTimeout(pendingLogoutTimeout)
    setApplied(true)
    toast.success('Preferensi berhasil diterapkan')
  }

  return (
    <LayoutShell>
      <main className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-4 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">⚙️ Preferensi</h1>

        {/* Durasi Verifikasi PIN */}
        <div className="flex items-center justify-between mb-4">
          <span>Durasi Verifikasi PIN</span>
          <select
            value={pendingPinTimeout}
            onChange={e => setPendingPinTimeout(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            <option value={0}>Off</option>
            <option value={5 * 60 * 1000}>5 menit</option>
            <option value={10 * 60 * 1000}>10 menit</option>
            <option value={15 * 60 * 1000}>15 menit</option>
            <option value={30 * 60 * 1000}>30 menit</option>
          </select>
        </div>

        {/* Durasi Logout Otomatis */}
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