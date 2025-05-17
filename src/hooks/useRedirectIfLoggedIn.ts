import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useRedirectIfLoggedIn = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isPublicPage = ["/", "/login", "/register"].includes(location.pathname);

    if (!loading && user?.emailVerified && isPublicPage) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, user, location.pathname]);
};