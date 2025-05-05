import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const RoleRedirect = () => {
  const { userMeta } = useAuth()

  if (!userMeta) return null

  if (userMeta.role === "admin") return <Navigate to="/admin" />
  return <Navigate to="/dashboard" />
}

export default RoleRedirect
