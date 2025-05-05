import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export const useVerifiedUserOnly = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { replace: true, state: { from: location } })
      } else if (!user.emailVerified && location.pathname !== "/verify-email-pending") {
        navigate("/verify-email-pending", {
          replace: true,
          state: { email: user.email }
        })
      }
    }
  }, [user, loading, navigate, location])

  return { user, loading }
}
