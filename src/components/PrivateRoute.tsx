import { ReactNode, useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface PrivateRouteProps {
  children: ReactNode
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Refresh status verifikasi user
    if (user) user.reload()
  }, [user])

  if (loading) return <div>Loading...</div>

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (!user.emailVerified && location.pathname !== "/verify-email-pending") {
    return <Navigate to="/verify-email-pending" state={{ email: user.email }} replace />
  }

  return <>{children}</>
}

export default PrivateRoute
