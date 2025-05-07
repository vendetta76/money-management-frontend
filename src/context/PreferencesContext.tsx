// src/context/PreferencesContext.tsx
import React, { createContext, useContext, useState } from 'react'

interface Preferences {
  requirePinOnIdle: boolean
  pinIdleTimeoutMs: number
  logoutTimeoutMs: number
}

interface PreferencesContextType {
  preferences: Preferences
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>
}

const defaultPreferences: Preferences = {
  requirePinOnIdle: false,
  pinIdleTimeoutMs: 5 * 60 * 1000, // 5 menit
  logoutTimeoutMs: 15 * 60 * 1000, // 15 menit
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const pinTimeout = Number(localStorage.getItem('pinTimeout') || defaultPreferences.pinIdleTimeoutMs)
    const logoutTimeout = Number(localStorage.getItem('logoutTimeout') || defaultPreferences.logoutTimeoutMs)
    return {
      requirePinOnIdle: pinTimeout > 0,
      pinIdleTimeoutMs: pinTimeout,
      logoutTimeoutMs: logoutTimeout,
    }
  })

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used within a PreferencesProvider')
  return context
}
