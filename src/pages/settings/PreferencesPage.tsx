import { useState, useEffect } from 'react'
import LayoutShell from '../../layouts/LayoutShell'

const PreferencesPage = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <LayoutShell>
      <main className="2xl:px-20 max-w-screen-md md:ml-64 md:px-8 min-h-screen mx-auto pt-4 px-4 sm:px-6 w-full xl:px-12">
        <h1 className="font-bold mb-4 text-2xl">⚙️ Preferensi</h1>
        <div className="flex items-center justify-between mb-4">
          <span className="dark:text-gray-200 dark:text-white font-medium text-gray-700 text-sm">Mode Gelap</span>
          <label className="cursor-pointer inline-flex items-center relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="bg-gray-200 dark:bg-gray-700 duration-300 h-5 peer peer-checked:bg-purple-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 relative rounded-full transition w-9">
              <span className="absolute bg-white dark:bg-gray-900 duration-300 h-3 left-1 peer-checked:translate-x-4 rounded-full top-1 transition-transform w-3" />
            </div>
          </label>
        </div>
      </main>
    </LayoutShell>
  )
}

export default PreferencesPage
