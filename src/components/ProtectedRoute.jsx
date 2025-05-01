import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="p-6 text-center">⏳ Sedang memuat...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
