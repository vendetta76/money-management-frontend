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
  const absoluteTimerRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const visibilityChangeRef = useRef<number>(0);
  const logoutScheduledRef = useRef<boolean>(false);
  const logoutTimeRef = useRef<number>(0);

  // Debug logging
  useEffect(() => {
    console.log("🕒 Auto Logout initialized with timeout:", logoutTimeout);
    console.log("Current auto logout settings:");
    console.log("- Value in context:", logoutTimeout);
    console.log("- localStorage value:", localStorage.getItem('logoutTimeout'));

    // Simpan timestamp untuk perhitungan absolut
    logoutTimeRef.current = 0;
    logoutScheduledRef.current = false;

    return () => {
      console.log("🕒 Auto Logout component unmounted");
    };
  }, [logoutTimeout]);

  // Schedule absolute timeout - logout akan terjadi pada waktu tertentu
  // tidak peduli apakah tab aktif atau tidak
  const scheduleAbsoluteLogout = useCallback(() => {
    // Jika timeout 0, fitur dinonaktifkan
    if (!logoutTimeout || logoutTimeout === 0) return;
    
    // Hapus timer sebelumnya jika ada
    if (absoluteTimerRef.current) {
      clearTimeout(absoluteTimerRef.current);
      absoluteTimerRef.current = null;
    }
    
    // Tetapkan waktu logout absolut
    const now = Date.now();
    const logoutTime = now + logoutTimeout;
    logoutTimeRef.current = logoutTime;
    logoutScheduledRef.current = true;
    
    console.log(`⏰ Logout absolut dijadwalkan pada: ${new Date(logoutTime).toLocaleTimeString()}`);
    
    // Hitung selisih waktu untuk warning
    const timeToWarning = logoutTimeout - AUTO_LOGOUT_WARNING_TIME;
    
    // Set timer untuk warning
    setTimeout(() => {
      if (!showWarning && logoutScheduledRef.current) {
        // Tampilkan warning jika masih aktif
        if (document.visibilityState === 'visible') {
          console.log("⚠️ Menampilkan peringatan logout (absolute timer)");
          showLogoutWarning(AUTO_LOGOUT_WARNING_TIME);
        }
      }
    }, timeToWarning);
    
    // Set absolute timer untuk logout
    absoluteTimerRef.current = window.setTimeout(() => {
      if (logoutScheduledRef.current) {
        console.log("⏰ Logout absolut berjalan pada:", new Date().toLocaleTimeString());
        handleLogout();
      }
    }, logoutTimeout);
    
    // Simpan waktu jadwal ke localStorage untuk sinkronisasi antar tab
    localStorage.setItem('logoutScheduledTime', logoutTime.toString());
    
  }, [logoutTimeout, showWarning]);

  // Reset activity timer when user interacts
  const resetActivityTimer = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    lastActivityRef.current = now;
    setShowWarning(false);
    
    // Reset jadwal logout absolut
    logoutScheduledRef.current = false;
    scheduleAbsoluteLogout();
    
    // Clear any existing warning interval
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = null;
    }
  }, [scheduleAbsoluteLogout]);

  // Handle visibility change (tab switch)
  const handleVisibilityChange = useCallback(() => {
    const now = Date.now();
    
    if (document.visibilityState === 'visible') {
      console.log("🟢 Tab menjadi terlihat pada:", new Date(now).toLocaleTimeString());
      
      // Cek apakah jadwal logout absolut sudah tiba waktunya
      if (logoutScheduledRef.current && now >= logoutTimeRef.current) {
        console.log("⏰ Logout dijalankan karena waktu absolut sudah terlewat");
        handleLogout();
        return;
      }
      
      // Hitung waktu yang tersisa sampai logout
      if (logoutScheduledRef.current && logoutTimeRef.current > 0) {
        const remainingMs = logoutTimeRef.current - now;
        console.log(`⏳ Waktu tersisa sampai logout: ${Math.round(remainingMs/1000)} detik`);
        
        // Jika waktu tersisa kurang dari warning time, tampilkan warning
        if (remainingMs <= AUTO_LOGOUT_WARNING_TIME) {
          console.log("⚠️ Menampilkan peringatan logout (saat tab kembali aktif)");
          showLogoutWarning(remainingMs);
        }
      }
      
      // Jika tidak ada jadwal aktif, tetapkan jadwal baru
      if (!logoutScheduledRef.current && logoutTimeout > 0) {
        scheduleAbsoluteLogout();
      }
      
    } else {
      console.log("🔴 Tab menjadi tersembunyi pada:", new Date(now).toLocaleTimeString());
      
      // Jika tab hidden, simpan timestamp untuk perhitungan
      visibilityChangeRef.current = now;
      
      // Simpan aktivitas terakhir ke localStorage untuk referensi antar tab
      localStorage.setItem('lastActivityTime', lastActivityRef.current.toString());
    }
  }, [logoutTimeout, scheduleAbsoluteLogout]);
  
  // Show logout warning
  const showLogoutWarning = useCallback((timeLeftMs: number) => {
    if (showWarning) return; // Already showing
    
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
  }, [showWarning]);

  // Handle continue session from warning dialog
  const handleContinueSession = useCallback(() => {
    resetActivityTimer();
  }, [resetActivityTimer]);

  // Handle logout from warning dialog
  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    
    // Hentikan semua timer
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
    
    // Reset jadwal
    logoutScheduledRef.current = false;
    localStorage.removeItem('logoutScheduledTime');
    
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
        if (absoluteTimerRef.current) {
          clearTimeout(absoluteTimerRef.current);
          absoluteTimerRef.current = null;
        }
      };
    }

    console.log("⚙️ Auto logout is enabled with timeout:", logoutTimeout, "ms");

    // Set up initial absolute timer
    scheduleAbsoluteLogout();

    // Check if there's a schedule from other tabs
    const storedScheduleTime = localStorage.getItem('logoutScheduledTime');
    if (storedScheduleTime) {
      const scheduledTime = parseInt(storedScheduleTime, 10);
      const now = Date.now();
      
      // If time already passed, logout
      if (scheduledTime && scheduledTime <= now) {
        console.log("⏰ Jadwal logout dari tab lain sudah terlewat, logout sekarang");
        handleLogout();
      }
      // If time is in the future, use it
      else if (scheduledTime && scheduledTime > now) {
        logoutTimeRef.current = scheduledTime;
        logoutScheduledRef.current = true;
        
        // Set remaining time
        const remainingTime = scheduledTime - now;
        console.log(`⏳ Menggunakan jadwal logout dari tab lain, tersisa: ${Math.round(remainingTime/1000)} detik`);
        
        // Set timer for warning
        if (remainingTime > AUTO_LOGOUT_WARNING_TIME) {
          setTimeout(() => {
            if (!showWarning && logoutScheduledRef.current) {
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
          if (logoutScheduledRef.current) {
            handleLogout();
          }
        }, remainingTime);
      }
    }

    // Periodic check pada tab yang aktif
    const checkInactivity = () => {
      // Skip if not visible
      if (document.visibilityState !== 'visible') {
        return;
      }
      
      // Cek apakah waktu absolut sudah terlewati
      const now = Date.now();
      if (logoutScheduledRef.current && logoutTimeRef.current > 0 && now >= logoutTimeRef.current) {
        console.log("⏰ Waktu logout absolut terdeteksi terlewati saat pengecekan periodik");
        handleLogout();
        return;
      }
    };

    // Start periodic checking
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
      if (absoluteTimerRef.current) {
        clearTimeout(absoluteTimerRef.current);
        absoluteTimerRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logoutTimeout, showWarning, handleVisibilityChange, showLogoutWarning, resetActivityTimer, handleLogout, scheduleAbsoluteLogout]);

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
      
      // Store scheduled time for other tabs
      if (logoutScheduledRef.current && logoutTimeRef.current > 0) {
        localStorage.setItem('logoutScheduledTime', logoutTimeRef.current.toString());
      }
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