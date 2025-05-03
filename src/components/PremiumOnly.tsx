import { ReactNode } from "react"
import { useAuth } from "../context/AuthContext"

interface PremiumOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

const PremiumOnly = ({ children, fallback = null }: PremiumOnlyProps) => {
  const { userMeta, loading } = useAuth()

  if (loading) return null

  if (userMeta?.role === "premium") {
    return <>{children}</>
  }

  return <>{fallback}</>
}

export default PremiumOnly
