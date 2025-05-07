// src/components/PinProtect.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { usePreferences } from '../context/PreferencesContext'
import PinVerify from './PinVerify'

interface PinProtectProps {
  children: React.ReactNode
}

export default function PinProtect({ children }: PinProtectProps) {
  const { requirePinOnIdle, pinIdleTimeoutMs } = usePreferences()
  const [verified, setVerified] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const registerActivity = useCallback(() => {
    if (!requirePinOnIdle || !verified) return
    setLastActivity(Date.now())
  }, [requirePinOnIdle, verified])

  // Track activity events
  useEffect(() => {
    if (!requirePinOnIdle || !verified) return
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach(evt => window.addEventListener(evt, registerActivity))
    return () => events.forEach(evt => window.removeEventListener(evt, registerActivity))
  }, [requirePinOnIdle, verified, registerActivity])

  // Idle timeout check
  useEffect(() => {
    if (!requirePinOnIdle || !verified) return
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > pinIdleTimeoutMs) {
        setVerified(false)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [requirePinOnIdle, verified, lastActivity, pinIdleTimeoutMs])

  if (!requirePinOnIdle) return <>{children}</>
  if (!verified) return <PinVerify onSuccess={() => setVerified(true)} />
  return <>{children}</>
}
