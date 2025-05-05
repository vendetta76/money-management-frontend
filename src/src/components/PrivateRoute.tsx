import { ReactNode, useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface PrivateRouteProps {
  children: ReactNode
  requiredRole?: string // "Admin", "Regular", "Premium" (opsional)
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { user, loading, userMeta } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (user) user.reload()
  }, [user])

  if (loading) return <div>Loading...</div>

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.emailVerified && location.pathname !== "/verify-email-pending") {
    return (
      <Navigate to="/verify-email-pending" state={{ email: user.email }} replace />
    )
  }

  // ✅ Jika ada role yang diwajibkan dan user bukan role itu
  if (requiredRole && userMeta?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

export default PrivateRoute
