import React, { ReactNode, useEffect, useState, useCallback } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { auth } from "../lib/firebaseClient"
import { signOut } from "firebase/auth"

interface PrivateRouteProps {
  children: ReactNode
  requiredRole?: string
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { user, loading, userMeta } = useAuth()
  const location = useLocation()

  useEffect(() => {
    console.log("🔥 [PrivateRoute] role from userMeta:", userMeta?.role);
  }, [userMeta]);
  
  // Reload user metadata on mount
  useEffect(() => {
    if (user) user.reload()
  }, [user])

  // Track user activity
  const [lastActivity, setLastActivity] = useState(Date.now())
  const registerActivity = useCallback(() => {
    if (logoutTimeoutMs > 0) {
      setLastActivity(Date.now())
    }
  }, [logoutTimeoutMs])

  useEffect(() => {
    if (logoutTimeoutMs <= 0 || !user) return
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"]
    events.forEach(evt => window.addEventListener(evt, registerActivity))
    return () => events.forEach(evt => window.removeEventListener(evt, registerActivity))
  }, [logoutTimeoutMs, user, registerActivity])

  useEffect(() => {
    if (logoutTimeoutMs <= 0 || !user) return
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > logoutTimeoutMs) {
        signOut(auth)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [logoutTimeoutMs, lastActivity, user])

  if (loading || !userMeta) return <div>Loading...</div>

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.emailVerified && location.pathname !== "/verify-email-pending") {
    return (
      <Navigate
        to="/verify-email-pending"
        state={{ email: user.email }}
        replace
      />
    )
  }

  if (requiredRole && userMeta?.role?.toLowerCase() !== requiredRole.toLowerCase()) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
