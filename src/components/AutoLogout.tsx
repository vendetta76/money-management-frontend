import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const warningIntervalRef = useRef<number | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const visibilityChangeRef = useRef<number>(0);

  // Debug logging
  useEffect(() => {
    console.log("🕒 Auto Logout initialized with timeout:", logoutTimeout);
    console.log("Current auto logout settings:");
    console.log("- Value in context:", logoutTimeout);
    console.log("- localStorage value:", localStorage.getItem('logoutTimeout'));
    return () => {
      console.log("🕒 Auto Logout component unmounted");
    };
  }, [logoutTimeout]);

  // Reset activity timer when user interacts
  const resetActivityTimer = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    lastActivityRef.current = now;
    setShowWarning(false);
    
    // Clear any existing warning interval
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

  // Handle visibility change (tab switch)
  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    
    if (document.visibilityState === 'visible') {
      console.log("🟢 Tab became visible");
      
      // Calculate how long the tab was hidden
      const timeHidden = now - visibilityChangeRef.current;
      console.log(`Tab was hidden for ${timeHidden}ms`);
      
      // Calculate current inactive time
      const inactiveTime = now - lastActivityRef.current;
      console.log(`Inactive time: ${inactiveTime}ms`);
      
      // If inactive for too long, show warning or logout
      if (logoutTimeout > 0) {
        if (inactiveTime >= logoutTimeout) {
          console.log("⏰ Inactive time exceeds timeout, logging out");
          handleLogout();
        } else if (inactiveTime >= logoutTimeout - AUTO_LOGOUT_WARNING_TIME) {
          console.log("⚠️ Inactive time exceeds warning threshold, showing warning");
          showLogoutWarning(inactiveTime);
        }
      }
    } else {
      console.log("🔴 Tab became hidden");
      visibilityChangeRef.current = now;
    }
  }, [logoutTimeout]);
  
  // Show logout warning
  const showLogoutWarning = useCallback((inactiveTime: number) => {
    if (showWarning) return; // Already showing
    
    setShowWarning(true);
    const timeLeftBeforeLogout = logoutTimeout - inactiveTime;
    setRemainingTime(Math.max(timeLeftBeforeLogout, 1000)); // At least 1 second
    
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
  }, [showWarning, logoutTimeout]);

  // Handle continue session from warning dialog
  const handleContinueSession = useCallback(() => {
    resetActivityTimer();
  }, [resetActivityTimer]);

  // Handle logout from warning dialog
  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
    
    try {
      console.log("🚪 Executing auto logout");
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [signOut, navigate]);

  // Check for inactivity
  useEffect(() => {
    // If timeout is 0 or not set, auto logout is disabled
    if (!logoutTimeout || logoutTimeout === 0) {
      console.log("⚙️ Auto logout is disabled (timeout=0)");
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        if (warningIntervalRef.current) {
          clearInterval(warningIntervalRef.current);
          warningIntervalRef.current = null;
        }
      };
    }

    console.log("⚙️ Auto logout is enabled with timeout:", logoutTimeout, "ms");

    const checkInactivity = () => {
      if (document.visibilityState !== 'visible') {
        // Skip check when tab is not visible, we'll check when it becomes visible
        return;
      }
      
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivityRef.current;
      const timeUntilWarning = logoutTimeout - AUTO_LOGOUT_WARNING_TIME;

      // Show warning dialog if inactive for (timeout - warningTime)
      if (inactiveTime >= timeUntilWarning && !showWarning) {
        console.log(`⚠️ Inactive for ${inactiveTime}ms, showing warning`);
        showLogoutWarning(inactiveTime);
      }
    };

    // Start checking inactivity
    checkIntervalRef.current = window.setInterval(checkInactivity, 5000); // Check every 5 seconds
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up intervals and listeners
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
        warningIntervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logoutTimeout, showWarning, handleVisibilityChange, showLogoutWarning, resetActivityTimer]);

  // Register user activity event listeners
  useEffect(() => {
    // If timeout is 0, auto logout is disabled
    if (!logoutTimeout || logoutTimeout === 0) {
      return;
    }

    console.log("👂 Setting up activity event listeners");

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
      // Store last activity time in localStorage for cross-tab detection
      localStorage.setItem('lastActivityTime', lastActivityRef.current.toString());
    });

    // Clean up event listeners
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('beforeunload', () => {});
    };
  }, [logoutTimeout, resetActivityTimer]);

  // On component mount, check if there's recent activity in other tabs
  useEffect(() => {
    const storedLastActivity = localStorage.getItem('lastActivityTime');
    if (storedLastActivity) {
      const lastActivityTime = parseInt(storedLastActivity, 10);
      // Use the most recent activity time
      if (lastActivityTime > lastActivityRef.current) {
        lastActivityRef.current = lastActivityTime;
        setLastActivity(lastActivityTime);
      }
    }
  }, []);

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