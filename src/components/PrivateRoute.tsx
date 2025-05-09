import React, { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const { user, loading, userMeta } = useAuth();
  const location = useLocation();

  // Debug role dari context
  useEffect(() => {
    console.log("🔥 [PrivateRoute] role from userMeta:", userMeta?.role);
  }, [userMeta]);

  // Refresh user
  useEffect(() => {
    if (user) user.reload();
  }, [user]);

  if (loading || !userMeta) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified && location.pathname !== "/verify-email-pending") {
    return (
      <Navigate
        to="/verify-email-pending"
        state={{ email: user.email }}
        replace
      />
    );
  }

  if (
    requiredRole &&
    userMeta?.role?.toLowerCase() !== requiredRole.toLowerCase()
  ) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
