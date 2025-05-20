import React, { useState } from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LogoutTimeoutProvider } from './context/LogoutTimeoutContext';
import { PinTimeoutProvider } from './context/PinTimeoutContext'; // Import the PinTimeoutProvider
import { LanguageProvider } from './context/LanguageContext';
import routes from './routes';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useThemeAdvanced';
import AutoLogout from './components/AutoLogout';

function AppRoutes() {
  return useRoutes(routes);
}

function App() {
  useTheme();

  const [canInstall, setCanInstall] = React.useState(false);
  const deferredPromptRef = React.useRef<any>(null);

  React.useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
      console.log('✅ beforeinstallprompt triggered');
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    const { outcome } = await deferredPromptRef.current.userChoice;
    if (outcome === 'accepted') {
      console.log('✅ User accepted install');
    }
    deferredPromptRef.current = null;
    setCanInstall(false);
  };

  return (
    <AuthProvider>
      <LogoutTimeoutProvider>
        <PinTimeoutProvider> {/* Add PinTimeoutProvider here */}
          <LanguageProvider>
            <Router>
              <Toaster position="top-center" reverseOrder={false} />
              {canInstall && (
                <div className="fixed top-4 right-4 z-50 bg-background border border-border px-4 py-2 rounded-lg shadow-md">
                  <button
                    onClick={handleInstall}
                    className="bg-primary text-primary-foreground px-4 py-1 rounded hover:bg-opacity-90 transition"
                  >
                    Install MoniQ
                  </button>
                </div>
              )}

              {/* AutoLogout Component */}
              <AutoLogout />

              {/* Main Routes */}
              <AppRoutes />
            </Router>
          </LanguageProvider>
        </PinTimeoutProvider> {/* Close PinTimeoutProvider */}
      </LogoutTimeoutProvider>
    </AuthProvider>
  );
}

export default App;