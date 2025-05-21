import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebaseClient";
import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn";
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { logActivity } from "../utils/logActivity";

const RegisterPage = () => {
  useRedirectIfLoggedIn();

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setFormVisible(true), 100);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: fullName,
        email,
        createdAt: serverTimestamp(),
        role: "Regular",
        premium: false,
        currency: "IDR",
      });

      await logActivity(email, "register");

      await sendEmailVerification(user);
      await signOut(auth);

      sessionStorage.setItem("moniq_temp_email", btoa(email));
      sessionStorage.setItem("moniq_temp_password", btoa(password));

      setRedirecting(true);

      setTimeout(() => {
        navigate("/verify-email-pending", {
          state: { email, password },
        });
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div
        className={`w-full max-w-md transition-all duration-500 ${
          formVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg">
          {/* Cat image in the middle top */}
          <div className="flex justify-center mt-6 mb-2">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background">
              <img
                src="/assets/attack-on catan.png"
                alt="MoniQ Cat"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(-1)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-muted"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                MoniQ
              </h2>
            </div>

            <h1 className="text-2xl font-bold mb-1">Daftar Akun</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Buat akun baru dan mulai kelola keuangan kamu!
            </p>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 mb-4 animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name Field */}
              <div
                className="transition-all duration-300 delay-100"
                style={{
                  opacity: formVisible ? 1 : 0,
                  transform: formVisible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User size={18} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div
                className="transition-all duration-300 delay-150"
                style={{
                  opacity: formVisible ? 1 : 0,
                  transform: formVisible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div
                className="transition-all duration-300 delay-200"
                style={{
                  opacity: formVisible ? 1 : 0,
                  transform: formVisible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
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
                <p className="text-xs text-muted-foreground mt-1.5">
                  Password harus minimal 6 karakter.
                </p>
              </div>

              {/* Submit Button */}
              <div
                className="pt-2 transition-all duration-300 delay-300"
                style={{
                  opacity: formVisible ? 1 : 0,
                  transform: formVisible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                <button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full bg-primary text-primary-foreground font-medium py-2.5 px-4 rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center disabled:opacity-70"
                >
                  {redirecting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengarahkan...</span>
                    </div>
                  ) : loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      <span>Mendaftarkan...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Daftar</span>
                      <CheckCircle size={18} />
                    </div>
                  )}
                </button>
              </div>
            </form>

            <div
              className="text-center pt-6 text-sm transition-all duration-300 delay-400"
              style={{
                opacity: formVisible ? 1 : 0,
                transform: formVisible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <span className="text-muted-foreground">Sudah punya akun?</span>{" "}
              <a href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Masuk di sini
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;