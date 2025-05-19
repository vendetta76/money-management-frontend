import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  LinearProgress,
  Box,
  Typography,
} from '@mui/material';
import { useLogoutTimeout } from '../context/LogoutTimeoutContext';
import { useAuth } from '../context/AuthContext';

const AUTO_LOGOUT_WARNING_TIME = 60000; // 1 minute warning before logout

const AutoLogout: React.FC = () => {
  const { logoutTimeout } = useLogoutTimeout();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const warningIntervalRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const absoluteTimerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const visibilityChangeRef = useRef<number>(0);
  const logoutScheduledRef = useRef<boolean>(false);
  const logoutTimeRef = useRef<number>(0);

  const isAuthPage = useCallback(() => {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email-pending'];
    return authPages.some(path => location.pathname.includes(path));
  }, [location]);

  const clearAllLogoutSchedules = useCallback(() => {
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
    
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    if (absoluteTimerRef.current) {
      clearTimeout(absoluteTimerRef.current);
      absoluteTimerRef.current = null;
    }
    
    logoutScheduledRef.current = false;
    logoutTimeRef.current = 0;
    
    localStorage.removeItem('logoutScheduledTime');
  }, []);

  useEffect(() => {
    if (!user || isAuthPage()) {
      clearAllLogoutSchedules();
      return;
    }
    
    logoutTimeRef.current = 0;
    logoutScheduledRef.current = false;
  }, [logoutTimeout, user, isAuthPage, location.pathname, clearAllLogoutSchedules]);

  const scheduleAbsoluteLogout = useCallback(() => {
    if (isAuthPage() || !user) {
      clearAllLogoutSchedules();
      return;
    }
    
    if (!logoutTimeout || logoutTimeout === 0) {
      clearAllLogoutSchedules();
      return;
    }
    
    if (absoluteTimerRef.current) {
      clearTimeout(absoluteTimerRef.current);
      absoluteTimerRef.current = null;
    }
    
    const now = Date.now();
    const logoutTime = now + logoutTimeout;
    logoutTimeRef.current = logoutTime;
    logoutScheduledRef.current = true;
    
    const timeToWarning = logoutTimeout - AUTO_LOGOUT_WARNING_TIME;
    
    setTimeout(() => {
      if (!user || isAuthPage()) return;
      
      if (!showWarning && logoutScheduledRef.current) {
        if (document.visibilityState === 'visible') {
          showLogoutWarning(AUTO_LOGOUT_WARNING_TIME);
        }
      }
    }, timeToWarning);
    
    absoluteTimerRef.current = window.setTimeout(() => {
      if (!user || isAuthPage()) return;
      
      if (logoutScheduledRef.current) {
        handleLogout();
      }
    }, logoutTimeout);
    
    localStorage.setItem('logoutScheduledTime', logoutTime.toString());
    
  }, [logoutTimeout, showWarning, user, isAuthPage, clearAllLogoutSchedules]);

  const resetActivityTimer = useCallback(() => {
    if (isAuthPage() || !user) return;
    
    const now = Date.now();
    setLastActivity(now);
    lastActivityRef.current = now;
    setShowWarning(false);
    
    logoutScheduledRef.current = false;
    scheduleAbsoluteLogout();
    
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, [scheduleAbsoluteLogout, isAuthPage, user]);

  // Handle visibility change (tab switch)
  const handleVisibilityChange = useCallback(() => {
    // Skip if on auth pages or no user
    if (isAuthPage() || !user) return;
    
    const now = Date.now();
    
    if (document.visibilityState === 'visible') {
      // Check if absolute logout time has passed
      if (logoutScheduledRef.current && now >= logoutTimeRef.current) {
        handleLogout();
        return;
      }
      
      // Calculate remaining time until logout
      if (logoutScheduledRef.current && logoutTimeRef.current > 0) {
        const remainingMs = logoutTimeRef.current - now;
        
        // Show warning if time is running short
        if (remainingMs <= AUTO_LOGOUT_WARNING_TIME) {
          showLogoutWarning(remainingMs);
        }
      }
      
      // If no active schedule, create a new one
      if (!logoutScheduledRef.current && logoutTimeout > 0) {
        scheduleAbsoluteLogout();
      }
      
    } else {
      // Save timestamp for later calculations
      visibilityChangeRef.current = now;
      
      // Save last activity to localStorage for cross-tab reference
      localStorage.setItem('lastActivityTime', lastActivityRef.current.toString());
    }
  }, [logoutTimeout, scheduleAbsoluteLogout, isAuthPage, user]);
  
  // Show logout warning
  const showLogoutWarning = useCallback((timeLeftMs: number) => {
    // Skip if already showing or on auth pages or no user
    if (showWarning || isAuthPage() || !user) return;
    
    setShowWarning(true);
    setRemainingTime(Math.max(timeLeftMs, 1000)); // At least 1 second
    
    // Start countdown for remaining time
    warningIntervalRef.current = window.setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          if (warningIntervalRef.current) {
            clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
          }
          handleLogout();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [showWarning, isAuthPage, user]);

  // Handle continue session from warning dialog
  const handleContinueSession = useCallback(() => {
    resetActivityTimer();
  }, [resetActivityTimer]);

  // Handle logout from warning dialog
  const handleLogout = useCallback(async () => {
    // Skip if already on auth pages or no user
    if (isAuthPage() || !user) {
      clearAllLogoutSchedules();
      return;
    }
    
    setShowWarning(false);
    clearAllLogoutSchedules();
    
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      // Error silenced
    }
  }, [signOut, navigate, isAuthPage, user, clearAllLogoutSchedules]);

  // Main effect for handling inactivity
  useEffect(() => {
    // Exit early if on auth pages or no user
    if (isAuthPage() || !user) {
      clearAllLogoutSchedules();
      return () => {};
    }
    
    // If timeout is 0, auto logout is disabled
    if (!logoutTimeout || logoutTimeout === 0) {
      clearAllLogoutSchedules();
      return () => {};
    }

    // Set up initial absolute timer
    scheduleAbsoluteLogout();

    // Check if there's a schedule from other tabs
    const storedScheduleTime = localStorage.getItem('logoutScheduledTime');
    if (storedScheduleTime) {
      const scheduledTime = parseInt(storedScheduleTime, 10);
      const now = Date.now();
      
      // If scheduled time has passed, logout
      if (scheduledTime && scheduledTime <= now) {
        handleLogout();
      }
      // If scheduled time is in the future, use it
      else if (scheduledTime && scheduledTime > now) {
        logoutTimeRef.current = scheduledTime;
        logoutScheduledRef.current = true;
        
        // Calculate remaining time
        const remainingTime = scheduledTime - now;
        
        // Set timer for warning
        if (remainingTime > AUTO_LOGOUT_WARNING_TIME) {
          setTimeout(() => {
            if (!showWarning && logoutScheduledRef.current && user && !isAuthPage()) {
              if (document.visibilityState === 'visible') {
                showLogoutWarning(AUTO_LOGOUT_WARNING_TIME);
              }
            }
          }, remainingTime - AUTO_LOGOUT_WARNING_TIME);
        }
        else if (document.visibilityState === 'visible') {
          showLogoutWarning(remainingTime);
        }
        
        // Set timer for logout
        absoluteTimerRef.current = window.setTimeout(() => {
          if (logoutScheduledRef.current && user && !isAuthPage()) {
            handleLogout();
          }
        }, remainingTime);
      }
    }

    // Periodic check for active tabs
    const checkInactivity = () => {
      // Skip if not visible
      if (document.visibilityState !== 'visible') {
        return;
      }
      
      // Skip if on auth pages or no user
      if (isAuthPage() || !user) {
        clearAllLogoutSchedules();
        return;
      }
      
      // Check if absolute logout time has passed
      const now = Date.now();
      if (logoutScheduledRef.current && logoutTimeRef.current > 0 && now >= logoutTimeRef.current) {
        handleLogout();
        return;
      }
    };

    // Start periodic checking
    checkIntervalRef.current = window.setInterval(checkInactivity, 5000);
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
        warningIntervalRef.current = null;
      }
      if (absoluteTimerRef.current) {
        clearTimeout(absoluteTimerRef.current);
        absoluteTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    logoutTimeout, 
    showWarning, 
    handleVisibilityChange, 
    showLogoutWarning, 
    resetActivityTimer, 
    handleLogout, 
    scheduleAbsoluteLogout,
    user,
    isAuthPage,
    clearAllLogoutSchedules
  ]);

  // Register user activity event listeners
  useEffect(() => {
    // Skip if on auth pages, no user, or timeout is 0
    if (isAuthPage() || !user || !logoutTimeout || logoutTimeout === 0) {
      return;
    }

    // Track user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click', 'keypress'
    ];

    const handleActivity = () => {
      resetActivityTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Track time before page is unloaded
    window.addEventListener('beforeunload', () => {
      // Only save if logged in and not on auth pages
      if (user && !isAuthPage()) {
        // Store last activity time for cross-tab detection
        localStorage.setItem('lastActivityTime', lastActivityRef.current.toString());
        
        // Store scheduled time for other tabs
        if (logoutScheduledRef.current && logoutTimeRef.current > 0) {
          localStorage.setItem('logoutScheduledTime', logoutTimeRef.current.toString());
        }
      }
    });

    // Clean up event listeners
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('beforeunload', () => {});
    };
  }, [logoutTimeout, resetActivityTimer, isAuthPage, user]);

  // Route change effect - clear schedules when navigating to auth pages
  useEffect(() => {
    if (isAuthPage()) {
      clearAllLogoutSchedules();
    }
  }, [location.pathname, isAuthPage, clearAllLogoutSchedules]);

  // Calculate progress percentage for warning dialog
  const progressPercentage = (remainingTime / AUTO_LOGOUT_WARNING_TIME) * 100;

  // Don't show warning on auth pages
  if (isAuthPage() || !user) {
    return null;
  }

  return (
    <Dialog
      open={showWarning}
      aria-labelledby="logout-warning-dialog-title"
      aria-describedby="logout-warning-dialog-description"
      className="dark:bg-gray-900"
    >
      <DialogTitle id="logout-warning-dialog-title" className="dark:bg-gray-800 dark:text-white">
        Peringatan Sesi Akan Berakhir
      </DialogTitle>
      <DialogContent className="dark:bg-gray-800">
        <DialogContentText id="logout-warning-dialog-description" className="dark:text-gray-300">
          Anda akan keluar secara otomatis dalam {Math.ceil(remainingTime / 1000)} detik karena tidak ada aktivitas.
        </DialogContentText>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progressPercentage} color="warning" />
          <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }} className="dark:text-gray-300">
            {Math.ceil(remainingTime / 1000)} detik tersisa
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions className="dark:bg-gray-800">
        <Button onClick={handleLogout} color="error" className="dark:text-red-400">
          Logout Sekarang
        </Button>
        <Button onClick={handleContinueSession} color="primary" variant="contained" autoFocus className="dark:bg-blue-600">
          Lanjutkan Sesi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoLogout;