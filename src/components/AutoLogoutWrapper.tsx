// src/components/AutoLogoutWrapper.tsx
import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AutoLogoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Durasi Logout Otomatis dari Preferences (ms), default 0 = off
  const logoutTimeout = Number(localStorage.getItem('logoutTimeout')) || 0

  useEffect(() => {
    if (logoutTimeout <= 0) return

    let timer: ReturnType<typeof setTimeout>
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        logout()
        navigate('/login')
      }, logoutTimeout)
    }

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ]
    events.forEach(ev => window.addEventListener(ev, resetTimer))

    resetTimer()
    return () => {
      clearTimeout(timer)
      events.forEach(ev => window.removeEventListener(ev, resetTimer))
    }
  }, [logoutTimeout, logout, navigate])

  return <>{children}</>
}

export default AutoLogoutWrapper
