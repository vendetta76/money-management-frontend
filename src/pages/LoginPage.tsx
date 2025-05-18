import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import logo from "../assets/kucing-cuan.webp"; // Adjust the path as needed

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
    // Stagger animation of form elements
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
      
      // Simulating a login delay for animation
      setTimeout(() => {
        // Your actual login logic would be here
        // For "remember me" functionality:
        if (rememberMe) {
          localStorage.setItem("authToken", "example-auth-token");
        } else {
          sessionStorage.setItem("authToken", "example-auth-token");
        }
        
        navigate("/dashboard");
      }, 1500);
      
    } catch (err) {
      setError("Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div 
        className={`w-full max-w-md transition-all duration-500 ${
          formVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg relative">
          {/* Cat mascot peeking over the form */}
          <div className="flex flex-col items-center pb-4">
            <h1 className="text-2xl font-bold mt-8 mb-2 text-foreground">Welcome to MoniQ</h1>
            
            <div className="relative h-40 w-full flex justify-center">
              {/* This is a placeholder for your cat mascot */}
              <div className="absolute bottom-0 w-40 h-40">
                {/* You'd replace this with your actual cat SVG/image */}
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" fill="#FFA726" />
                  <circle cx="60" cy="80" r="25" fill="#8D6E63" />
                  <circle cx="140" cy="80" r="25" fill="#8D6E63" />
                  <path d="M70 65 L40 40" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
                  <path d="M130 65 L160 40" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
                  <circle cx="80" cy="90" r="5" fill="#212121" />
                  <circle cx="120" cy="90" r="5" fill="#212121" />
                  <path d="M90 105 Q100 115 110 105" stroke="#212121" strokeWidth="3" />
                  <path d="M60 75 Q70 85 70 70" fill="#FFC8C8" />
                  <path d="M140 75 Q130 85 130 70" fill="#FFC8C8" />
                  <path d="M85 120 L100 110 L115 120" fill="#FFFFFF" stroke="#212121" strokeWidth="2" />
                  <path d="M160 100 Q190 120 160 140" fill="#8D6E63" stroke="#6D4C41" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 pt-0">
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
                  <label className="block text-sm font-medium mb-1.5" htmlFor="password">
                    Password
                  </label>
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
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
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