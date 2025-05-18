import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Home } from "lucide-react";
import catMascot from "/assets/cat-hanging.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setFormVisible(true), 100);
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

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        localStorage.setItem("remember", "true");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Email atau password salah.");
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

      <div 
        className={`w-full max-w-md transition-all duration-500 pt-14 ${
          formVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-card border border-border rounded-3xl overflow-visible shadow-lg relative">
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 w-60 pointer-events-none">
            <img 
              src={catMascot} 
              alt="MoniQ Cat" 
              className="w-full object-contain"
            />
          </div>

          <div className="pt-20 pb-8 px-8">
            <h1 className="text-2xl font-bold text-center mb-6">Welcome to MoniQ</h1>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 mb-4 animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div 
                  className="transition-all duration-300 delay-100"
                  style={{ opacity: formVisible ? 1 : 0, transform: formVisible ? 'translateY(0)' : 'translateY(10px)' }}
                >
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

                <div 
                  className="transition-all duration-300 delay-200"
                  style={{ opacity: formVisible ? 1 : 0, transform: formVisible ? 'translateY(0)' : 'translateY(10px)' }}
                >
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

                <div 
                  className="flex items-center transition-all duration-300 delay-250"
                  style={{ opacity: formVisible ? 1 : 0, transform: formVisible ? 'translateY(0)' : 'translateY(10px)' }}
                >
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

                <div 
                  className="pt-2 transition-all duration-300 delay-300"
                  style={{ opacity: formVisible ? 1 : 0, transform: formVisible ? 'translateY(0)' : 'translateY(10px)' }}
                >
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

            <div 
              className="text-center pt-4 text-sm transition-all duration-300 delay-400"
              style={{ opacity: formVisible ? 1 : 0, transform: formVisible ? 'translateY(0)' : 'translateY(10px)' }}
            >
              <span className="text-muted-foreground">Don't have an account?</span>{" "}
              <a href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;