import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const AutoLogoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Baca timeout (ms) dari Preferences; default 0 = off
  const sessionTimeout = Number(localStorage.getItem('sessionTimeout')) || 0

  useEffect(() => {
    // Jika timeout <= 0, skip auto-logout
    if (sessionTimeout <= 0) return

    let timer: ReturnType<typeof setTimeout>
    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        logout()
        navigate('/login')
      }, sessionTimeout)
    }

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ]
    events.forEach((ev) => window.addEventListener(ev, resetTimer))

    // Mulai timer
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach((ev) => window.removeEventListener(ev, resetTimer))
    }
  }, [sessionTimeout, logout, navigate])

  return <>{children}</>
}

export default AutoLogoutWrapper
