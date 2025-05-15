import React from 'react';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PinLockProvider } from './context/PinLockContext';
import { LanguageProvider } from './context/LanguageContext';
import routes from './routes';
import { Toaster } from 'react-hot-toast';
import AutoLogoutWrapper from './components/AutoLogoutWrapper';
import { useTheme } from './hooks/useThemeAdvanced';

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
      <PinLockProvider>
        <LanguageProvider>
          <Router>
            <Toaster position="top-center" reverseOrder={false} />
            <AutoLogoutWrapper>
              {canInstall && (
                <div className="fixed top-4 right-4 z-50 bg-white border px-4 py-2 rounded-lg shadow-md">
                  <button
                    onClick={handleInstall}
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Install MoniQ
                  </button>
                </div>
              )}
              <AppRoutes />
            </AutoLogoutWrapper>
          </Router>
        </LanguageProvider>
      </PinLockProvider>
    </AuthProvider>
  );
}

export default App;