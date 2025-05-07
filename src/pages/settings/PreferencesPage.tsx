// src/pages/settings/PreferencesPage.tsx
import { useState, useEffect } from 'react'
import LayoutShell from '../../layouts/LayoutShell'

const PreferencesPage: React.FC = () => {
  const [sessionTimeout, setSessionTimeout] = useState<number>(() => {
    const val = localStorage.getItem('sessionTimeout')
    return val ? Number(val) : 5 * 60 * 1000 // default 5 menit
  })

  useEffect(() => {
    localStorage.setItem('sessionTimeout', sessionTimeout.toString())
  }, [sessionTimeout])

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 pt-4 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">⚙️ Preferensi</h1>

        {/* Durasi Verifikasi PIN */}
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