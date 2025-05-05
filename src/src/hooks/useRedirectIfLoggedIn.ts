import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export const useRedirectIfLoggedIn = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, loading, navigate])
}
