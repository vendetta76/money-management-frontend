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
const ACTIVITY_CHECK_INTERVAL = 10000; // Check activity every 10 seconds
const ACTIVITY_THRESHOLD = 500; // Debounce threshold for activity events in ms

const AutoLogout: React.FC = () => {
  const { logoutTimeout } = useLogoutTimeout();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  // Use refs to store timers and state that needs to be accessed across renders
  const warningIntervalRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const absoluteTimerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastActivityEventRef = useRef<number>(Date.now());
  const visibilityChangeRef = useRef<number>(0);
  const logoutScheduledRef = useRef<boolean>(false);
  const logoutTimeRef = useRef<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);
  const initialTimeoutSetRef = useRef<boolean>(false);
  const activityProcessingRef = useRef<boolean>(false);

  // Debug information
  const debugInfo = {
    currentTime: Date.now(),
    logoutTime: logoutTimeRef.current,
    timeUntilLogout: logoutTimeRef.current ? logoutTimeRef.current - Date.now() : null,
    lastActivity: lastActivityRef.current,
    inactiveTime: Date.now() - lastActivityRef.current,
    warningThreshold: logoutTimeout ? logoutTimeout - AUTO_LOGOUT_WARNING_TIME : null,
    timeUntilWarning: logoutTimeRef.current ? logoutTimeRef.current - AUTO_LOGOUT_WARNING_TIME - Date.now() : null,
    logoutScheduled: logoutScheduledRef.current,
    showingWarning: showWarning,
    remainingTime: remainingTime,
  };

  const isAuthPage = useCallback(() => {
    const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email-pending'];
    return authPages.some(path => location.pathname.includes(path));
  }, [location]);

  // Clear all logout schedules
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
    
    // Clear local storage to prevent stale data
    localStorage.removeItem('logoutScheduledTime');
    localStorage.removeItem('lastActivityTime');
    
    setShowWarning(false);
  }, []);

  // Check if we should schedule a logout
  useEffect(() => {
    // Skip if on auth page, no user, or already logging out
    if (!user || isAuthPage() || isLoggingOutRef.current) {
      clearAllLogoutSchedules();
      return;
    }
    
    // Skip if timeout is disabled
    if (!logoutTimeout || logoutTimeout === 0) {
      clearAllLogoutSchedules();
      return;
    }
    
    // Set the initial timeout if it hasn't been set yet
    if (!initialTimeoutSetRef.current) {
      console.log(`📅 Initial logout scheduled in ${logoutTimeout / 1000} seconds`);
      initialTimeoutSetRef.current = true;
      resetActivityTimer();
    }
    
  }, [logoutTimeout, user, isAuthPage, clearAllLogoutSchedules, resetActivityTimer]);

  // Schedule the absolute logout timer
  const scheduleAbsoluteLogout = useCallback(() => {
    // Skip if on auth page, no user, or already logging out
    if (isAuthPage() || !user || isLoggingOutRef.current) {
      clearAllLogoutSchedules();
      return;
    }
    
    // Skip if timeout is disabled
    if (!logoutTimeout || logoutTimeout === 0) {
      clearAllLogoutSchedules();
      return;
    }
    
    // Clear any existing absolute timer
    if (absoluteTimerRef.current) {
      clearTimeout(absoluteTimerRef.current);
      absoluteTimerRef.current = null;
    }
    
    // Calculate the logout time
    const now = Date.now();
    const logoutTime = now + logoutTimeout;
    logoutTimeRef.current = logoutTime;
    logoutScheduledRef.current = true;
    
    console.log(`⏰ Logout scheduled at ${new Date(logoutTime).toLocaleTimeString()}, in ${logoutTimeout / 1000} seconds`);
    
    // Schedule warning timer
    const timeToWarning = logoutTimeout - AUTO_LOGOUT_WARNING_TIME;
    
    // Clear any existing warning timer
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
    
    // Set timeout for warning
    if (timeToWarning > 0) {
      setTimeout(() => {
        if (!user || isAuthPage() || isLoggingOutRef.current) return;
        
        if (!showWarning && logoutScheduledRef.current) {
          if (document.visibilityState === 'visible') {
            showLogoutWarning(AUTO_LOGOUT_WARNING_TIME);
          }
        }
      }, timeToWarning);
    }
    
    // Set timeout for logout
    absoluteTimerRef.current = window.setTimeout(() => {
      if (!user || isAuthPage() || isLoggingOutRef.current) return;
      
      if (logoutScheduledRef.current) {
        console.log(`⌛ Logout timer expired at ${new Date().toLocaleTimeString()}`);
        handleLogout('timeout');
      }
    }, logoutTimeout);
    
    // Store the logout time in localStorage for cross-tab synchronization
    localStorage.setItem('logoutScheduledTime', logoutTime.toString());
    
  }, [logoutTimeout, showWarning, user, isAuthPage, clearAllLogoutSchedules, handleLogout, showLogoutWarning]);

  // Reset the activity timer when there's user activity
  const resetActivityTimer = useCallback(() => {
    // Skip if on auth page, no user, or already logging out
    if (isAuthPage() || !user || isLoggingOutRef.current) return;
    
    // Skip if already processing an activity event (debounce)
    if (activityProcessingRef.current) return;
    
    // Skip if a recent activity was just processed (debounce)
    const now = Date.now();
    if (now - lastActivityEventRef.current < ACTIVITY_THRESHOLD) return;
    
    // Mark as processing
    activityProcessingRef.current = true;
    lastActivityEventRef.current = now;
    
    // Update activity time
    setLastActivity(now);
    lastActivityRef.current = now;
    
    // Close warning dialog if open
    if (showWarning) {
      setShowWarning(false);
    }
    
    // Reset logout schedule
    logoutScheduledRef.current = false;
    scheduleAbsoluteLogout();
    
    // Done processing
    activityProcessingRef.current = false;
    
  }, [scheduleAbsoluteLogout, isAuthPage, user, showWarning]);

  // Handle visibility change (tab switch)
  const handleVisibilityChange = useCallback(() => {
    // Skip if on auth pages or no user or already logging out
    if (isAuthPage() || !user || isLoggingOutRef.current) return;
    
    const now = Date.now();
    
    if (document.visibilityState === 'visible') {
      console.log(`👁️ Tab became visible at ${new Date(now).toLocaleTimeString()}`);
      
      // Check if absolute logout time has passed
      if (logoutScheduledRef.current && logoutTimeRef.current > 0 && now >= logoutTimeRef.current) {
        console.log(`⌛ Logout time has already passed (${new Date(logoutTimeRef.current).toLocaleTimeString()})`);
        handleLogout('timeout');
        return;
      }
      
      // Calculate remaining time until logout
      if (logoutScheduledRef.current && logoutTimeRef.current > 0) {
        const remainingMs = logoutTimeRef.current - now;
        
        // Show warning if time is running short
        if (remainingMs <= AUTO_LOGOUT_WARNING_TIME) {
          console.log(`⚠️ Showing warning with ${remainingMs / 1000} seconds remaining`);
          showLogoutWarning(remainingMs);
        }
      }
      
      // If no active schedule, create a new one
      if (!logoutScheduledRef.current && logoutTimeout > 0) {
        console.log(`🔄 No active schedule, creating new one`);
        scheduleAbsoluteLogout();
      }
      
    } else {
      console.log(`👁️ Tab hidden at ${new Date(now).toLocaleTimeString()}`);
      
      // Save timestamp for later calculations
      visibilityChangeRef.current = now;
      
      // Save last activity to localStorage for cross-tab reference
      localStorage.setItem('lastActivityTime', lastActivityRef.current.toString());
    }
  }, [logoutTimeout, scheduleAbsoluteLogout, isAuthPage, user, handleLogout, showLogoutWarning]);
  
  // Show logout warning
  const showLogoutWarning = useCallback((timeLeftMs: number) => {
    // Skip if already showing or on auth pages or no user or already logging out
    if (showWarning || isAuthPage() || !user || isLoggingOutRef.current) return;
    
    console.log(`⚠️ Showing logout warning with ${timeLeftMs / 1000} seconds remaining`);
    
    setShowWarning(true);
    setRemainingTime(Math.max(timeLeftMs, 1000)); // At least 1 second
    
    // Clear any existing warning interval
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
    }
    
    // Start countdown for remaining time
    warningIntervalRef.current = window.setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          if (warningIntervalRef.current) {
            clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
          }
          handleLogout('timeout');
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [showWarning, isAuthPage, user, handleLogout]);

  // Handle continue session from warning dialog
  const handleContinueSession = useCallback(() => {
    console.log(`✅ User continued session`);
    resetActivityTimer();
  }, [resetActivityTimer]);

  // Handle logout with better logging
  const handleLogout = useCallback(async (reason: 'timeout' | 'user' = 'user') => {
    // Skip if already on auth pages or no user or already logging out
    if (isAuthPage() || !user || isLoggingOutRef.current) {
      clearAllLogoutSchedules();
      return;
    }
    
    // Set logging out flag to prevent duplicate logouts
    isLoggingOutRef.current = true;
    
    console.log(`🚪 Logging out (reason: ${reason}) at ${new Date().toLocaleTimeString()}`);
    
    setShowWarning(false);
    clearAllLogoutSchedules();
    
    try {
      // Store the logout reason before clearing storage
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
      
      // Sign out from Firebase
      await signOut();
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("❌ Error during logout:", error);
      
      // Try to force navigation even if logout fails
      try {
        sessionStorage.setItem('logoutReason', reason);
        navigate('/login', { replace: true });
      } catch (e) {
        // Last resort - reload the page
        window.location.href = '/login';
      }
    } finally {
      // Reset logging out flag (though this component will likely be unmounted)
      isLoggingOutRef.current = false;
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

    console.log(`🔄 Setting up logout monitoring with timeout of ${logoutTimeout / 1000} seconds`);

    // Set up initial absolute timer
    scheduleAbsoluteLogout();

    // Check if there's a schedule from other tabs
    const storedScheduleTime = localStorage.getItem('logoutScheduledTime');
    if (storedScheduleTime) {
      const scheduledTime = parseInt(storedScheduleTime, 10);
      const now = Date.now();
      
      console.log(`📱 Found stored schedule time: ${new Date(scheduledTime).toLocaleTimeString()}`);
      
      // If scheduled time has passed, logout
      if (scheduledTime && scheduledTime <= now) {
        console.log(`⌛ Stored schedule time has passed, logging out`);
        handleLogout('timeout');
      }
      // If scheduled time is in the future, use it
      else if (scheduledTime && scheduledTime > now) {
        console.log(`⏲️ Using stored schedule time (in ${(scheduledTime - now) / 1000} seconds)`);
        
        logoutTimeRef.current = scheduledTime;
        logoutScheduledRef.current = true;
        
        // Calculate remaining time
        const remainingTime = scheduledTime - now;
        
        // Set timer for warning
        if (remainingTime > AUTO_LOGOUT_WARNING_TIME) {
          setTimeout(() => {
            if (!showWarning && logoutScheduledRef.current && user && !isAuthPage() && !isLoggingOutRef.current) {
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
          if (logoutScheduledRef.current && user && !isAuthPage() && !isLoggingOutRef.current) {
            handleLogout('timeout');
          }
        }, remainingTime);
      }
    }

    // Periodic check for inactivity - more frequent than before
    const checkInactivity = () => {
      // Skip if not visible
      if (document.visibilityState !== 'visible') {
        return;
      }
      
      // Skip if on auth pages or no user
      if (isAuthPage() || !user || isLoggingOutRef.current) {
        clearAllLogoutSchedules();
        return;
      }
      
      // Calculate inactivity time
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;
      
      // Check if inactivity exceeds timeout
      if (inactiveTime >= logoutTimeout) {
        console.log(`⌛ Inactivity timeout exceeded (${inactiveTime / 1000}s > ${logoutTimeout / 1000}s)`);
        handleLogout('timeout');
        return;
      }
      
      // Check if absolute logout time has passed
      if (logoutScheduledRef.current && logoutTimeRef.current > 0 && now >= logoutTimeRef.current) {
        console.log(`⌛ Absolute logout time reached`);
        handleLogout('timeout');
        return;
      }
      
      // Check if warning should be shown
      const timeUntilLogout = logoutTimeRef.current - now;
      if (logoutScheduledRef.current && timeUntilLogout <= AUTO_LOGOUT_WARNING_TIME && !showWarning) {
        console.log(`⚠️ Warning threshold crossed during periodic check`);
        showLogoutWarning(timeUntilLogout);
      }
    };

    // Start periodic checking - more frequent than before
    checkIntervalRef.current = window.setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL);
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Debug log for diagnostics
    console.log(`📊 Current state:`, debugInfo);
    
    // Clean up
    return () => {
      console.log(`♻️ Cleaning up logout monitoring`);
      
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

    console.log(`🖱️ Setting up activity monitors`);

    // Track user activity with a comprehensive list of events
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click', 'keypress',
      'focus', 'mouseup', 'touchend'
    ];

    const handleActivity = () => {
      if (!isLoggingOutRef.current) {
        resetActivityTimer();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Track time before page is unloaded
    window.addEventListener('beforeunload', () => {
      // Only save if logged in and not on auth pages
      if (user && !isAuthPage() && !isLoggingOutRef.current) {
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
        <Button onClick={() => handleLogout('user')} color="error" className="dark:text-red-400">
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