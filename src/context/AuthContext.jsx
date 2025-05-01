import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: sessionData, error } = await supabase.auth.getSession();
      console.log("🔥 SessionData:", sessionData);

      if (error || !sessionData.session) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const sessionUser = sessionData.session.user;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionUser.id)
        .single();

      if (profileError) {
        console.error("Gagal mengambil role user:", profileError);
      }

      setUser({ ...sessionUser, role: profile?.role || "user" });
      setIsLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setIsLoading(false);
        navigate("/login");
      }

      if (event === "SIGNED_IN" && session?.user) {
        const sessionUser = session.user;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionUser.id)
          .single();

        if (profileError) {
          console.error("Gagal mengambil role user (signin):", profileError);
        }

        setUser({ ...sessionUser, role: profile?.role || "user" });
        setIsLoading(false);

        if (location.pathname === "/login") {
          navigate("/dashboard");
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ✅ Fallback Supabase session jika reload manual
  useEffect(() => {
    const checkSessionManually = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔥 Manual session fallback:", sessionData);

      const sessionUser = sessionData?.session?.user;
      if (sessionUser) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", sessionUser.id)
          .single();

        setUser({ ...sessionUser, role: profile?.role || "user" });
      }

      setIsLoading(false);
    };

    checkSessionManually();
  }, []);

  useEffect(() => {
    let idleTimer;
    const idleLimit = 15 * 60 * 1000;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        toast("Kamu tidak aktif terlalu lama, keluar otomatis.");
        await supabase.auth.signOut();
      }, idleLimit);
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
