import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { useSession } from '../hooks/useSession';

// Constants moved to the top level
const AUTO_LOGOUT_WARNING_TIME = 60000; // 1 minute warning before logout
const ACTIVITY_CHECK_INTERVAL = 10000; // Check activity every 10 seconds
const ACTIVITY_THRESHOLD = 500; // Debounce threshold for activity events in ms

const AutoLogout: React.FC = () => {
  // Use our custom hook to get all session-related functionality
  const { 
    user, 
    isAuthPage, 
    logout, 
    continueSession,
    logoutTimeout 
  } = useSession();
  
  // States
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  // Refs for state persistence across renders
  const warningIntervalRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const absoluteTimerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const lastActivityEventRef = useRef<number>(Date.now());
  const logoutScheduledRef = useRef<boolean>(false);
  const logoutTimeRef = useRef<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);
  const initialTimeoutSetRef = useRef<boolean>(false);
  const activityProcessingRef = useRef<boolean>(false);

  // Clear all timers and schedules
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
    localStorage.removeItem('lastActivityTime');
    
    setShowWarning(false);
  }, []);

  // Handle logout with checks for running state
  const handleLogout = useCallback(async (reason: 'timeout' | 'user' = 'user') => {
    if (isAuthPage || !user || isLoggingOutRef.current) {
      clearAllLogoutSchedules();
      return;
    }
    
    isLoggingOutRef.current = true;
    setShowWarning(false);
    clearAllLogoutSchedules();
    
    try {
      await logout(reason);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, [logout, isAuthPage, user, clearAllLogoutSchedules]);

  // Show warning dialog before logout
  const showLogoutWarning = useCallback((timeLeftMs: number) => {
    if (showWarning || isAuthPage || !user || isLoggingOutRef.current) return;
    
    console.log(`⚠️ Showing logout warning with ${timeLeftMs / 1000} seconds remaining`);
    
    setShowWarning(true);
    setRemainingTime(Math.max(timeLeftMs, 1000));
    
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
    }
    
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

  // Schedule absolute logout time
  const scheduleAbsoluteLogout = useCallback(() => {
    if (isAuthPage || !user || isLoggingOutRef.current) {
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
    
    console.log(`⏰ Logout scheduled at ${new Date(logoutTime).toLocaleTimeString()}, in ${logoutTimeout / 1000} seconds`);
    
    const timeToWarning = logoutTimeout - AUTO_LOGOUT_WARNING_TIME;
    
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
    
    if (timeToWarning > 0) {
      setTimeout(() => {
        if (!user || isAuthPage || isLoggingOutRef.current) return;
        
        if (!showWarning && logoutScheduledRef.current) {
          if (document.visibilityState === 'visible') {
            showLogoutWarning(AUTO_LOGOUT_WARNING_TIME);
          }
        }
      }, timeToWarning);
    }
    
    absoluteTimerRef.current = window.setTimeout(() => {
      if (!user || isAuthPage || isLoggingOutRef.current) return;
      
      if (logoutScheduledRef.current) {
        console.log(`⌛ Logout timer expired at ${new Date().toLocaleTimeString()}`);
        handleLogout('timeout');
      }
    }, logoutTimeout);
    
    localStorage.setItem('logoutScheduledTime', logoutTime.toString());
    
  }, [logoutTimeout, showWarning, user, isAuthPage, clearAllLogoutSchedules, handleLogout, showLogoutWarning]);

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    if (isAuthPage || !user || isLoggingOutRef.current) return;
    
    if (activityProcessingRef.current) return;
    
    const now = Date.now();
    if (now - lastActivityEventRef.current < ACTIVITY_THRESHOLD) return;
    
    activityProcessingRef.current = true;
    lastActivityEventRef.current = now;
    
    lastActivityRef.current = now;
    
    if (showWarning) {
      setShowWarning(false);
    }
    
    logoutScheduledRef.current = false;
    scheduleAbsoluteLogout();
    
    activityProcessingRef.current = false;
    
  }, [scheduleAbsoluteLogout, isAuthPage, user, showWarning]);

  // Visibility change handler
  const handleVisibilityChange = useCallback(() => {
    if (isAuthPage || !user || isLoggingOutRef.current) return;
    
    const now = Date.now();
    
    if (document.visibilityState === 'visible') {
      console.log(`👁️ Tab became visible at ${new Date(now).toLocaleTimeString()}`);
      
      if (logoutScheduledRef.current && logoutTimeRef.current > 0 && now >= logoutTimeRef.current) {
        console.log(`⌛ Logout time has already passed (${new Date(logoutTimeRef.current).toLocaleTimeString()})`);
        handleLogout('timeout');
        return;
      }
      
      if (logoutScheduledRef.current && logoutTimeRef.current > 0) {
        const remainingMs = logoutTimeRef.current - now;
        
        if (remainingMs <= AUTO_LOGOUT_WARNING_TIME) {
          console.log(`⚠️ Showing warning with ${remainingMs / 1000} seconds remaining`);
          showLogoutWarning(remainingMs);
        }
      }
      
      if (!logoutScheduledRef.current && logoutTimeout > 0) {
        console.log(`🔄 No active schedule, creating new one`);
        scheduleAbsoluteLogout();
      }
      
    } else {
      localStorage.setItem('lastActivityTime', lastActivityRef.current.toString());
    }
  }, [logoutTimeout, scheduleAbsoluteLogout, isAuthPage, user, handleLogout, showLogoutWarning]);

  // Handle session continuation
  const handleContinueSession = useCallback(() => {
    console.log(`✅ User continued session`);
    resetActivityTimer();
    continueSession();
  }, [resetActivityTimer, continueSession]);

  // Initialize timeout on mount
  useEffect(() => {
    if (!user || isAuthPage || isLoggingOutRef.current) {
      clearAllLogoutSchedules();
      return;
    }
    
    if (!logoutTimeout || logoutTimeout === 0) {
      clearAllLogoutSchedules();
      return;
    }
    
    if (!initialTimeoutSetRef.current) {
      console.log(`📅 Initial logout scheduled in ${logoutTimeout / 1000} seconds`);
      initialTimeoutSetRef.current = true;
      resetActivityTimer();
    }
  }, [logoutTimeout, user, isAuthPage, clearAllLogoutSchedules, resetActivityTimer]);

  // Main inactivity tracking effect
  useEffect(() => {
    if (isAuthPage || !user) {
      clearAllLogoutSchedules();
      return () => {};
    }
    
    if (!logoutTimeout || logoutTimeout === 0) {
      clearAllLogoutSchedules();
      return () => {};
    }

    scheduleAbsoluteLogout();

    // Check for stored schedule from other tabs
    const storedScheduleTime = localStorage.getItem('logoutScheduledTime');
    if (storedScheduleTime) {
      const scheduledTime = parseInt(storedScheduleTime, 10);
      const now = Date.now();
      
      if (scheduledTime && scheduledTime <= now) {
        handleLogout('timeout');
      }
      else if (scheduledTime && scheduledTime > now) {
        logoutTimeRef.current = scheduledTime;
        logoutScheduledRef.current = true;
        
        const remainingTime = scheduledTime - now;
        
        if (remainingTime > AUTO_LOGOUT_WARNING_TIME) {
          setTimeout(() => {
            if (!showWarning && logoutScheduledRef.current && user && !isAuthPage && !isLoggingOutRef.current) {
              if (document.visibilityState === 'visible') {
                showLogoutWarning(AUTO_LOGOUT_WARNING_TIME);
              }
            }
          }, remainingTime - AUTO_LOGOUT_WARNING_TIME);
        }
        else if (document.visibilityState === 'visible') {
          showLogoutWarning(remainingTime);
        }
        
        absoluteTimerRef.current = window.setTimeout(() => {
          if (logoutScheduledRef.current && user && !isAuthPage && !isLoggingOutRef.current) {
            handleLogout('timeout');
          }
        }, remainingTime);
      }
    }

    // Periodic inactivity check
    const checkInactivity = () => {
      if (document.visibilityState !== 'visible') return;
      
      if (isAuthPage || !user || isLoggingOutRef.current) {
        clearAllLogoutSchedules();
        return;
      }
      
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;
      
      if (inactiveTime >= logoutTimeout) {
        handleLogout('timeout');
        return;
      }
      
      if (logoutScheduledRef.current && logoutTimeRef.current > 0 && now >= logoutTimeRef.current) {
        handleLogout('timeout');
        return;
      }
      
      const timeUntilLogout = logoutTimeRef.current - now;
      if (logoutScheduledRef.current && timeUntilLogout <= AUTO_LOGOUT_WARNING_TIME && !showWarning) {
        showLogoutWarning(timeUntilLogout);
      }
    };

    checkIntervalRef.current = window.setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
      if (absoluteTimerRef.current) clearTimeout(absoluteTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    logoutTimeout, 
    showWarning, 
    handleVisibilityChange, 
    showLogoutWarning, 
    handleLogout, 
    scheduleAbsoluteLogout,
    user,
    isAuthPage,
    clearAllLogoutSchedules
  ]);

  // Track user activity
  useEffect(() => {
    if (isAuthPage || !user || !logoutTimeout || logoutTimeout === 0) {
      return;
    }

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

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    window.addEventListener('beforeunload', () => {
      if (user && !isAuthPage && !isLoggingOutRef.current) {
        localStorage.setItem('lastActivityTime', lastActivityRef.current.toString());
        
        if (logoutScheduledRef.current && logoutTimeRef.current > 0) {
          localStorage.setItem('logoutScheduledTime', logoutTimeRef.current.toString());
        }
      }
    });

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('beforeunload', () => {});
    };
  }, [logoutTimeout, resetActivityTimer, isAuthPage, user]);

  // Don't render anything on auth pages
  if (isAuthPage || !user) {
    return null;
  }

  // Calculate progress percentage for warning dialog
  const progressPercentage = (remainingTime / AUTO_LOGOUT_WARNING_TIME) * 100;

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