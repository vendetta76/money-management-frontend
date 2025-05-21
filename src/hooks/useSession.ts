import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogoutTimeout } from '../context/LogoutTimeoutContext';
import { usePinTimeout } from '../context/PinTimeoutContext';

/**
 * Custom hook that combines session-related functionality from multiple contexts
 * This helps break circular dependencies by providing a single interface
 */
export const useSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { logoutTimeout } = useLogoutTimeout();
  const { isPinVerified, pinTimeout, verifyPin, lockPin } = usePinTimeout();
  
  const [isActive, setIsActive] = useState(true);
  
  // Check if current page is an auth page
  const isAuthPage = useCallback(() => {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email-pending'];
    return authPages.some(path => location.pathname.includes(path));
  }, [location.pathname]);
  
  // Logout the user and navigate to login page
  const handleLogout = useCallback(async (reason: 'timeout' | 'user' = 'user') => {
    if (isAuthPage() || !user) {
      return;
    }
    
    console.log(`🚪 Logging out (reason: ${reason}) at ${new Date().toLocaleTimeString()}`);
    
    try {
      // Store the logout reason
      sessionStorage.setItem('logoutReason', reason);
      
      // Clear local storage except the logout reason
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      localStorage.removeItem('remember');
      localStorage.removeItem('lastActivityTime');
      localStorage.removeItem('logoutScheduledTime');
      
      // Wait for storage changes to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Sign out
      await signOut();
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("❌ Error during logout:", error);
      
      // Try to force navigation even if logout fails
      navigate('/login', { replace: true });
    }
  }, [signOut, navigate, isAuthPage, user]);
  
  // Continue user session
  const continueSession = useCallback(() => {
    setIsActive(true);
    if (pinTimeout && pinTimeout > 0) {
      verifyPin();
    }
  }, [pinTimeout, verifyPin]);
  
  // Lock the session manually
  const lockSession = useCallback(() => {
    if (pinTimeout && pinTimeout > 0) {
      lockPin();
    }
  }, [pinTimeout, lockPin]);
  
  // Check if session is valid
  const isSessionValid = useCallback(() => {
    return !!user && (!pinTimeout || pinTimeout === 0 || isPinVerified);
  }, [user, pinTimeout, isPinVerified]);
  
  // Return an API that can be used by components
  return {
    // Auth state
    user,
    isAuthenticated: !!user,
    isAuthPage: isAuthPage(),
    
    // Session state
    isActive,
    isSessionValid: isSessionValid(),
    logoutTimeout,
    pinTimeout,
    isPinVerified,
    
    // Actions
    logout: handleLogout,
    continueSession,
    lockSession,
    verifyPin,
    lockPin,
  };
};