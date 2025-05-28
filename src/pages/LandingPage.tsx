import { useRedirectIfLoggedIn } from "../hooks/useRedirectIfLoggedIn";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, ChevronRight, Shield, BarChart, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export const metadata = {
  title: "MeowIQ - Aplikasi Keuangan Pribadi & Pencatat Pengeluaran Harian Gratis dengan Konsep Unik",
  description: "MeowIQ membantu kamu mencatat pemasukan, pengeluaran, dan mengelola dompet dengan mudah. Gratis, aman, dan bisa diinstal ke perangkatmu.",
};

// Enhanced loading animation component
const LoadingAnimation = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Mohon Ditunggu, Sedang Mengambil Data Anda...");
  
  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 600);
    
    // Loading text animation
    const textAnimations = [
      "Mohon Ditunggu, Sedang Mengambil Data Anda...",
      "Menyiapkan Dashboard Keuangan Anda...",
      "Menghitung Saldo Dompet Anda...",
      "Hampir Selesai...",
    ];
    
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % textAnimations.length;
      setLoadingText(textAnimations[textIndex]);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);
  
  return (
    <div className="h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">MeowIQ</h2>
          <p className="text-muted-foreground min-h-10 transition-all duration-300">{loadingText}</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        
        {/* Spinning elements */}
        <div className="flex justify-center space-x-8">
          <div className="w-3 h-3 rounded-full bg-primary animate-spin" style={{ animationDuration: '1s' }}></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-spin" style={{ animationDuration: '1.4s' }}></div>
          <div className="w-3 h-3 rounded-full bg-primary animate-spin" style={{ animationDuration: '1.8s' }}></div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useRedirectIfLoggedIn();

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col overflow-hidden transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary to-purple-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            MeowIQ
          </h1>
          <nav className="flex gap-6">
            <a 
              href="/login" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Login
            </a>
            <a 
              href="/register" 
              className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              Register
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background pointer-events-none"></div>
          
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-foreground/90 text-sm mb-4">
                <span className="animate-pulse mr-2">✨</span> 
                <span>Kelola uangmu dengan mudah</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                💸 Kelola Keuanganmu <span className="bg-gradient-to-r from-primary to-purple-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">Untuk Masa Depanmu</span>
              </h2>
              
              <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
                Aplikasi PWA ringan & pintar yang bantu kamu kelola dompet, transaksi, dan lihat laporan keuangan real-time.
              </p>

              <div className="flex gap-4 flex-wrap justify-center pt-4">
                <a
                  href="/login"
                  className="px-6 py-3 bg-background border border-border rounded-full font-medium hover:bg-muted transition-colors duration-200 flex items-center gap-2 shadow-sm"
                >
                  Masuk <ChevronRight size={16} />
                </a>
                <a
                  href="/register"
                  className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 shadow-md"
                >
                  Daftar Gratis <ArrowRight size={16} />
                </a>
              </div>
            </div>
            
            {/* App screenshot/preview */}
            <div className="mt-16 max-w-4xl mx-auto relative">
              <div className="aspect-[16/9] bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-xl overflow-hidden shadow-2xl border border-border/50 backdrop-blur flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Preview App</div>
              </div>
              
              {/* Floating elements for decoration */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary/10 rounded-full animate-bounce [animation-duration:6s]"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-purple-500/10 rounded-full animate-bounce [animation-duration:7s]"></div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">Fitur Utama</h3>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-background border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield size={24} />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Aman & Pribadi</h4>
                  <p className="text-muted-foreground">Data keuanganmu terenkripsi dan hanya bisa diakses olehmu.</p>
                </div>
                
                <div className="bg-background border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart size={24} />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Statistik Cerdas</h4>
                  <p className="text-muted-foreground">Lihat grafik pemasukan & pengeluaran untuk bantu keputusan finansialmu.</p>
                </div>
                
                <div className="bg-background border border-border/50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">Ringan & Cepat</h4>
                  <p className="text-muted-foreground">Dibuat dengan teknologi PWA, bisa diakses offline dan super cepat!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-step section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-12">Cara Memulai dengan MeowIQ 🚀</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative pl-10 text-left">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Daftar Akun</h4>
                  <p className="text-muted-foreground">Secara gratis dan login ke dashboard kamu.</p>
                </div>
                
                <div className="relative pl-10 text-left">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Buat Dompet Digital</h4>
                  <p className="text-muted-foreground">Sesuai kebutuhanmu: pribadi, usaha, atau tabungan.</p>
                </div>
                
                <div className="relative pl-10 text-left">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    3
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Catat Transaksi</h4>
                  <p className="text-muted-foreground">Catat pemasukan dan pengeluaran kamu setiap hari.</p>
                </div>
                
                <div className="relative pl-10 text-left">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    4
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Lihat Laporan</h4>
                  <p className="text-muted-foreground">Lihat laporan keuangan dan pantau kemajuan finansialmu.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary/80 to-purple-500/80 dark:from-primary/20 dark:to-purple-500/20 text-white dark:text-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">Yuk mulai kelola uangmu sekarang!</h3>
              <p className="text-white/80 dark:text-foreground/80 max-w-lg mx-auto">
                Bergabunglah dengan ribuan pengguna yang telah mengelola keuangan mereka dengan MeowIQ.
              </p>
              <div>
                <a
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white dark:bg-background text-primary dark:text-primary font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  Daftar Sekarang <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                MeowIQ
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Aplikasi Manajemen Keuangan Pribadi dan Pintar
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © 2025 MeowIQ. Dibuat dengan ❤️
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;