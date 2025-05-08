// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PinLockProvider } from './context/PinLockContext' // ✅ Tambahkan ini
import routes from './routes'
import { Toaster } from 'react-hot-toast'
import AutoLogoutWrapper from './components/AutoLogoutWrapper'
import { useTheme } from './hooks/useThemeAdvanced' // ✅ Trigger global theme (dark/original/system/light)

function AppRoutes() {
  return useRoutes(routes)
}

function App() {
  useTheme() // ✅ Apply global theme

  return (
    <AuthProvider>
      <PinLockProvider> {/* ✅ Tambahkan provider ini */}
        <Router>
          <Toaster position="top-center" reverseOrder={false} />
          <AutoLogoutWrapper>
            <AppRoutes />
          </AutoLogoutWrapper>
        </Router>
      </PinLockProvider>
    </AuthProvider>
  )
}

export default App
