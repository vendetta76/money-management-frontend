import { useEffect, ReactNode, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface Props {
  children: ReactNode
}

const AutoLogoutWrapper = ({ children }: Props) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const timeoutRef = useRef<number | null>(null)

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    // 10 menit = 600.000 ms
    timeoutRef.current = window.setTimeout(async () => {
      if (user) {
        await signOut()
        navigate("/login")
      }
    }, 600000)
  }

  useEffect(() => {
    if (user) {
      const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]
      events.forEach((event) => window.addEventListener(event, resetTimer))

      resetTimer()

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        events.forEach((event) => window.removeEventListener(event, resetTimer))
      }
    }
  }, [user])

  return <>{children}</>
}

export default AutoLogoutWrapper
