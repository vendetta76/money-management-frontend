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

  // Reset activity timer when user interacts
  const resetActivityTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
    
    // Clear any existing warning interval
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, []);

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

    const checkInactivity = () => {
      const currentTime = Date.now();
      const inactiveTime = currentTime - lastActivity;
      const timeUntilWarning = logoutTimeout - AUTO_LOGOUT_WARNING_TIME;

      // Show warning dialog if inactive for (timeout - warningTime)
      if (inactiveTime >= timeUntilWarning && !showWarning) {
        setShowWarning(true);
        setRemainingTime(AUTO_LOGOUT_WARNING_TIME);
        
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
      }
    };

    // Start checking inactivity
    checkIntervalRef.current = window.setInterval(checkInactivity, 5000); // Check every 5 seconds
    
    // Clean up intervals
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
  }, [logoutTimeout, lastActivity, showWarning, handleLogout, resetActivityTimer]);

  // Register user activity event listeners
  useEffect(() => {
    // If timeout is 0, auto logout is disabled
    if (!logoutTimeout || logoutTimeout === 0) {
      return;
    }

    // Track user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click', 'keypress'
    ];

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetActivityTimer);
    });

    // Clean up event listeners
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetActivityTimer);
      });
    };
  }, [logoutTimeout, resetActivityTimer]);

  // Calculate progress percentage for warning dialog
  const progressPercentage = (remainingTime / AUTO_LOGOUT_WARNING_TIME) * 100;

  return (
    <Dialog
      open={showWarning}
      aria-labelledby="logout-warning-dialog-title"
      aria-describedby="logout-warning-dialog-description"
    >
      <DialogTitle id="logout-warning-dialog-title">
        Peringatan Sesi Akan Berakhir
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="logout-warning-dialog-description">
          Anda akan keluar secara otomatis dalam {Math.ceil(remainingTime / 1000)} detik karena tidak ada aktivitas.
        </DialogContentText>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progressPercentage} color="warning" />
          <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
            {Math.ceil(remainingTime / 1000)} detik tersisa
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLogout} color="error">
          Logout Sekarang
        </Button>
        <Button onClick={handleContinueSession} color="primary" variant="contained" autoFocus>
          Lanjutkan Sesi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoLogout;