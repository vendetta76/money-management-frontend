// src/App.tsx
import React from 'react'
import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PreferencesProvider } from './context/PreferencesContext'
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
    <PreferencesProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-center" reverseOrder={false} />
          <AutoLogoutWrapper>
            <AppRoutes />
          </AutoLogoutWrapper>
        </Router>
      </AuthProvider>
    </PreferencesProvider>
  )
}

export default App
