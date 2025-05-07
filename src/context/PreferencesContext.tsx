// src/context/PreferencesContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Preferences {
  requirePinOnIdle: boolean
  pinIdleTimeoutMs: number
  logoutTimeoutMs: number
}

const defaultPrefs: Preferences = {
  requirePinOnIdle: false,
  pinIdleTimeoutMs: 5 * 60 * 1000,  // default 5 menit
  logoutTimeoutMs: 0,               // 0 = off
}

interface PrefContextValue {
  preferences: Preferences
  setPreferences: (prefs: Preferences) => void
}

const PreferencesContext = createContext<PrefContextValue>({
  preferences: defaultPrefs,
  setPreferences: () => {},
})

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPrefs)
  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export const usePreferences = () => useContext(PreferencesContext)
