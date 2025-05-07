import { useState, useEffect } from 'react'
import LayoutShell from '../../layouts/LayoutShell'

const PreferencesPage: React.FC = () => {
  // Ambil nilai yang tersimpan, default 0 (off)
  const [sessionTimeout, setSessionTimeout] = useState<number>(() => {
    const val = localStorage.getItem('sessionTimeout')
    return val ? Number(val) : 0
  })
  const [pendingTimeout, setPendingTimeout] = useState<number>(sessionTimeout)
  const [applied, setApplied] = useState<boolean>(true)

  useEffect(() => {
    setApplied(pendingTimeout === sessionTimeout)
  }, [pendingTimeout, sessionTimeout])

  const handleApply = () => {
    localStorage.setItem('sessionTimeout', pendingTimeout.toString())
    setSessionTimeout(pendingTimeout)
    setApplied(true)
  }

  return (
    <LayoutShell>
      <main className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-4 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">⚙️ Preferensi</h1>

        {/* Durasi Verifikasi PIN */}
        <div className="flex items-center justify-between mb-6">
          <span>Durasi Verifikasi PIN</span>
          <select
            value={pendingTimeout}
            onChange={(e) => setPendingTimeout(Number(e.target.value))}
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
