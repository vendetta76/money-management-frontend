
import { useState, useEffect } from 'react'
import LayoutWithSidebar from '../../layouts/LayoutWithSidebar'

const PreferencesPage = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <LayoutWithSidebar>
      <div className="p-4 md:p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">⚙️ Preferensi</h1>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Mode Gelap</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-600 relative transition duration-300">
              <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

export default PreferencesPage
