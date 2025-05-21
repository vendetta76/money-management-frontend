import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Home } from "lucide-react";
import catMascot from "/assets/cat-hanging.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const [isTimeoutLogout, setIsTimeoutLogout] = useState(false);

  useEffect(() => {
    setTimeout(() => setFormVisible(true), 100);
    
    // Check if the user was logged out due to timeout
    const logoutReason = sessionStorage.getItem('logoutReason');
    if (logoutReason === 'timeout') {
      setError("Your session expired. Please login again.");
      setIsTimeoutLogout(true);
      sessionStorage.removeItem('logoutReason');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setIsLoading(true);
      
      // Add a small delay before login attempt if coming from timeout logout
      // This gives Firebase time to fully complete the previous signOut operation
      if (isTimeoutLogout) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem("remember", "true");
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      
      // Handle different error codes
      if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Email atau password salah.");
      }
      
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    navigate("/reset-password", { state: { email } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      <button 
        onClick={() => navigate("/")} 
        className="absolute top-4 left-4 p-2 rounded-full bg-muted/40 hover:bg-muted text-foreground transition-colors flex items-center gap-2"
      >
        <Home size={18} />
        <span className="text-sm font-medium">Home</span>
      </button>

      <div className={`relative w-full max-w-sm mx-auto mt-28 transition-all duration-500 ${
        formVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}>
        {/* Maskot di luar form */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-10">
          <img
            src={catMascot}
            alt="Maskot"
            className="w-36 h-auto pointer-events-none"
          />
        </div>

        {/* Login Card */}
        <div className="relative z-0 bg-card border border-border shadow-lg rounded-xl px-6 py-8">
          <h2 className="text-xl font-bold text-center mb-4 mt-2">Welcome to MoniQ</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 mb-4 animate-shake">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  placeholder="Email"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={handleResetPassword}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="remember" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black hover:bg-black/90 text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="text-center pt-4 text-sm">
            <span className="text-muted-foreground">Don't have an account?</span>{" "}
            <a href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;