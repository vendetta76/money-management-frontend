import { useState } from "react"
import Sidebar from "../components/Sidebar"
import { useTheme } from "../hooks/useThemeAdvanced" // ✅ Tambahan penting

const LayoutShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme } = useTheme() // ✅ Trigger useEffect global

  return (
    <div className="flex relative min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar tetap muncul di desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Header mobile */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-60" : "md:ml-64"}`}>
        <header className="md:hidden p-4 flex justify-between items-center shadow bg-white dark:bg-gray-800 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-purple-700">MonIQ</h1>
          <div></div>
        </header>

        {/* Konten utama, offset dari sidebar */}
        <main className="w-full px-4 md:px-6 xl:px-8 2xl:px-10 pt-4">
          {children}
        </main>
      </div>
    </div>
  )
}

export default LayoutShell
