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
      <main className="dark:text-white dark:bg-gray-900 min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 pt-4 md:ml-64 max-w-screen-md mx-auto">
        <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold mb-4">⚙️ Preferensi</h1>
        <div className="dark:text-white dark:bg-gray-900 flex items-center justify-between mb-4">
          <span className="dark:text-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200">Mode Gelap</span>
          <label className="dark:text-white dark:bg-gray-900 relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="dark:text-white dark:bg-gray-900 sr-only peer"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="dark:text-white dark:bg-gray-900 w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-600 relative transition duration-300">
              <span className="dark:text-white dark:bg-gray-900 absolute left-1 top-1 w-3 h-3 bg-white dark:bg-gray-900 rounded-full transition-transform duration-300 peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      </main>
    </LayoutShell>
  )
}

export default PreferencesPage
