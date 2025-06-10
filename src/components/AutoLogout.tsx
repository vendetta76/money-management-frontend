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

const AUTO_LOGOUT_WARNING_TIME = 60000; // 1 minute warning
const ACTIVITY_CHECK_INTERVAL = 15000; // Check every 15 seconds (FIXED: was 5s)
const ACTIVITY_DEBOUNCE = 500; // Debounce activity events
const LEADER_HEARTBEAT_INTERVAL = 2000; // Leader heartbeat every 2 seconds
const LEADER_TIMEOUT = 5000; // Consider leader dead after 5 seconds

// Storage keys for cross-tab communication
const STORAGE_KEYS = {
  LEADER_ID: 'autoLogout_leaderId',
  LEADER_HEARTBEAT: 'autoLogout_leaderHeartbeat',
  LEADER_CLAIM_TIME: 'autoLogout_leaderClaimTime', // NEW: For atomic election
  LOGOUT_TIME: 'autoLogout_scheduledTime',
  WARNING_TIME: 'autoLogout_warningTime',
  LAST_ACTIVITY: 'autoLogout_lastActivity',
  FORCE_LOGOUT: 'autoLogout_forceLogout',
  SESSION_EXTENDED: 'autoLogout_sessionExtended'
};

interface CrossTabState {
  logoutTime: number;
  warningTime: number;
  lastActivity: number;
  isActive: boolean;
}

const AutoLogout: React.FC = () => {
  const { user, isAuthPage, logout, continueSession, logoutTimeout } = useSession();
  
  // Warning dialog state
  const [warningState, setWarningState] = useState({
    show: false,
    remainingTime: 0
  });
  
  // Tab identity and leadership
  const tabIdRef = useRef<string>(`tab_${Date.now()}_${Math.random()}`);
  const isLeaderRef = useRef<boolean>(false);
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const leaderHeartbeatRef = useRef<number | null>(null);
  
  // Timer management
  const timersRef = useRef<{
    logout?: number;
    warning?: number;
    countdown?: number;
    activityCheck?: number;
    leaderElection?: number;
  }>({});
  
  // Activity and state tracking
  const lastActivityRef = useRef<number>(Date.now());
  const lastActivityEventRef = useRef<number>(Date.now());
  const isProcessingRef = useRef<boolean>(false);
  const stateRef = useRef<CrossTabState>({
    logoutTime: 0,
    warningTime: 0,
    lastActivity: Date.now(),
    isActive: false
  });

  // Utility functions for localStorage
  const setStorageItem = useCallback((key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set localStorage item:', key, error);
    }
  }, []);

  const getStorageItem = useCallback((key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get localStorage item:', key, error);
      return null;
    }
  }, []);

  const removeStorageItem = useCallback((key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove localStorage item:', key, error);
    }
  }, []);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    Object.values(timersRef.current).forEach(timerId => {
      if (timerId) {
        clearTimeout(timerId);
        clearInterval(timerId);
      }
    });
    timersRef.current = {};
  }, []);

  // Clean up storage when becoming leader or shutting down
  const cleanupStorage = useCallback(() => {
    removeStorageItem(STORAGE_KEYS.LOGOUT_TIME);
    removeStorageItem(STORAGE_KEYS.WARNING_TIME);
    removeStorageItem(STORAGE_KEYS.FORCE_LOGOUT);
    removeStorageItem(STORAGE_KEYS.SESSION_EXTENDED);
  }, [removeStorageItem]);

  // FIXED: Atomic leader election with compare-and-swap
  const becomeLeader = useCallback(() => {
    if (isLeaderRef.current) return;
    
    const now = Date.now();
    const claimTime = now.toString();
    
    // Atomic compare-and-swap operation
    const currentClaim = getStorageItem(STORAGE_KEYS.LEADER_CLAIM_TIME);
    const currentLeader = getStorageItem(STORAGE_KEYS.LEADER_ID);
    
    // Only claim leadership if no recent claim or if current leader is dead
    if (!currentClaim || !currentLeader || 
        (now - parseInt(currentClaim, 10) > LEADER_TIMEOUT)) {
      
      // Set claim time first (atomic operation)
      setStorageItem(STORAGE_KEYS.LEADER_CLAIM_TIME, claimTime);
      
      // Small delay to allow other tabs to see the claim
      setTimeout(() => {
        const latestClaim = getStorageItem(STORAGE_KEYS.LEADER_CLAIM_TIME);
        
        // Only become leader if our claim is still the latest
        if (latestClaim === claimTime) {
          isLeaderRef.current = true;
          setIsLeader(true);
          setStorageItem(STORAGE_KEYS.LEADER_ID, tabIdRef.current);
          setStorageItem(STORAGE_KEYS.LEADER_HEARTBEAT, now.toString());
          
          // Start heartbeat
          if (leaderHeartbeatRef.current) {
            clearInterval(leaderHeartbeatRef.current);
          }
          leaderHeartbeatRef.current = window.setInterval(() => {
            setStorageItem(STORAGE_KEYS.LEADER_HEARTBEAT, Date.now().toString());
          }, LEADER_HEARTBEAT_INTERVAL);
          
          console.log(`🏆 Tab ${tabIdRef.current} became leader`);
        }
      }, 50); // 50ms delay for atomic election
    }
  }, [setStorageItem, getStorageItem]);

  // Resign from leadership
  const resignLeadership = useCallback(() => {
    if (!isLeaderRef.current) return;
    
    isLeaderRef.current = false;
    setIsLeader(false);
    
    // Clear heartbeat first
    if (leaderHeartbeatRef.current) {
      clearInterval(leaderHeartbeatRef.current);
      leaderHeartbeatRef.current = null;
    }
    
    // Clear all timers
    clearAllTimers();
    
    // Clear leadership claim (do this last to avoid race conditions)
    removeStorageItem(STORAGE_KEYS.LEADER_ID);
    removeStorageItem(STORAGE_KEYS.LEADER_HEARTBEAT);
    removeStorageItem(STORAGE_KEYS.LEADER_CLAIM_TIME);
    
    // Clean up session storage
    cleanupStorage();
    
    console.log(`👋 Tab ${tabIdRef.current} resigned leadership`);
  }, [clearAllTimers, removeStorageItem, cleanupStorage]);

  // FIXED: Improved leadership check with atomic election
  const checkLeadership = useCallback(() => {
    const currentLeader = getStorageItem(STORAGE_KEYS.LEADER_ID);
    const lastHeartbeat = getStorageItem(STORAGE_KEYS.LEADER_HEARTBEAT);
    
    if (!currentLeader || currentLeader === tabIdRef.current) {
      if (!isLeaderRef.current) {
        becomeLeader();
      }
      return;
    }
    
    // Check if leader is still alive
    if (lastHeartbeat) {
      const heartbeatTime = parseInt(lastHeartbeat, 10);
      if (isNaN(heartbeatTime)) return; // Invalid heartbeat
      
      const now = Date.now();
      
      if (now - heartbeatTime > LEADER_TIMEOUT) {
        // Try atomic leader election
        becomeLeader();
      }
    } else {
      // No heartbeat, try to become leader
      becomeLeader();
    }
  }, [getStorageItem, becomeLeader]);

  // Handle logout
  const handleLogout = useCallback(async (reason: 'timeout' | 'user' = 'user') => {
    if (isAuthPage || !user || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    
    // If leader, broadcast logout to other tabs
    if (isLeaderRef.current) {
      setStorageItem(STORAGE_KEYS.FORCE_LOGOUT, Date.now().toString());
    }
    
    clearAllTimers();
    resignLeadership();
    setWarningState({ show: false, remainingTime: 0 });
    
    try {
      await logout(reason);
    } finally {
      isProcessingRef.current = false;
    }
  }, [logout, isAuthPage, user, clearAllTimers, resignLeadership, setStorageItem]);

  // Start warning countdown
  const startWarningCountdown = useCallback((remainingMs: number) => {
    if (warningState.show || isAuthPage || !user) return;
    
    // Clear any existing countdown timer
    if (timersRef.current.countdown) {
      clearInterval(timersRef.current.countdown);
      delete timersRef.current.countdown;
    }
    
    setWarningState({
      show: true,
      remainingTime: Math.max(remainingMs, 1000)
    });
    
    timersRef.current.countdown = window.setInterval(() => {
      setWarningState(prev => {
        // Guard against component unmounting
        if (!prev.show) {
          return prev;
        }
        
        const newTime = prev.remainingTime - 1000;
        if (newTime <= 0) {
          handleLogout('timeout');
          return { show: false, remainingTime: 0 };
        }
        return { ...prev, remainingTime: newTime };
      });
    }, 1000);
  }, [warningState.show, isAuthPage, user, handleLogout]);

  // FIXED: Added validation for negative timeouts
  const scheduleLogout = useCallback(() => {
    if (!isLeaderRef.current || isAuthPage || !user || !logoutTimeout || logoutTimeout === 0) {
      return;
    }
    
    // FIXED: Validate minimum timeout
    if (logoutTimeout < 1000) {
      console.warn('Logout timeout too short, minimum 1 second required');
      return;
    }
    
    clearAllTimers();
    
    const now = Date.now();
    const logoutTime = now + logoutTimeout;
    
    // FIXED: Proper validation for warning time
    const effectiveWarningTime = Math.max(0, Math.min(AUTO_LOGOUT_WARNING_TIME, logoutTimeout - 1000));
    const warningTime = logoutTime - effectiveWarningTime;
    
    stateRef.current = {
      logoutTime,
      warningTime,
      lastActivity: lastActivityRef.current,
      isActive: true
    };
    
    // Broadcast schedule to other tabs
    setStorageItem(STORAGE_KEYS.LOGOUT_TIME, logoutTime.toString());
    setStorageItem(STORAGE_KEYS.WARNING_TIME, warningTime.toString());
    setStorageItem(STORAGE_KEYS.LAST_ACTIVITY, lastActivityRef.current.toString());
    
    // Schedule warning
    if (effectiveWarningTime > 0 && logoutTimeout > effectiveWarningTime) {
      timersRef.current.warning = window.setTimeout(() => {
        if (stateRef.current.isActive && document.visibilityState === 'visible') {
          startWarningCountdown(effectiveWarningTime);
        }
      }, logoutTimeout - effectiveWarningTime);
    } else {
      // If timeout is very short, show warning immediately
      if (document.visibilityState === 'visible') {
        startWarningCountdown(logoutTimeout);
      }
    }
    
    // Schedule logout
    timersRef.current.logout = window.setTimeout(() => {
      if (stateRef.current.isActive) {
        handleLogout('timeout');
      }
    }, logoutTimeout);
    
    console.log(`⏰ Leader scheduled logout for ${new Date(logoutTime).toLocaleTimeString()}`);
  }, [isAuthPage, user, logoutTimeout, clearAllTimers, startWarningCountdown, handleLogout, setStorageItem]);

  // Reset activity (leader updates, followers listen)
  const resetActivity = useCallback(() => {
    if (isAuthPage || !user || isProcessingRef.current) return;
    
    const now = Date.now();
    
    // Debounce activity events
    if (now - lastActivityEventRef.current < ACTIVITY_DEBOUNCE) return;
    lastActivityEventRef.current = now;
    
    lastActivityRef.current = now;
    
    // Hide warning if showing
    if (warningState.show) {
      setWarningState({ show: false, remainingTime: 0 });
      if (timersRef.current.countdown) {
        clearInterval(timersRef.current.countdown);
        delete timersRef.current.countdown;
      }
    }
    
    // If leader, reschedule and broadcast
    if (isLeaderRef.current) {
      setStorageItem(STORAGE_KEYS.SESSION_EXTENDED, now.toString());
      scheduleLogout();
    }
  }, [isAuthPage, user, warningState.show, scheduleLogout, setStorageItem]);

  // Handle continue session
  const handleContinueSession = useCallback(() => {
    setWarningState({ show: false, remainingTime: 0 });
    if (timersRef.current.countdown) {
      clearInterval(timersRef.current.countdown);
      delete timersRef.current.countdown;
    }
    resetActivity();
    continueSession();
  }, [resetActivity, continueSession]);

  // Handle storage events from other tabs
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (isAuthPage || !user) return;
    
    // Ignore events from this tab (some browsers fire storage events for the origin tab)
    if (e.storageArea !== localStorage) return;
    
    switch (e.key) {
      case STORAGE_KEYS.FORCE_LOGOUT:
        if (e.newValue && e.newValue !== e.oldValue) {
          handleLogout('timeout');
        }
        break;
        
      case STORAGE_KEYS.SESSION_EXTENDED:
        if (e.newValue && e.newValue !== e.oldValue && !isLeaderRef.current) {
          // Another tab extended the session, hide warning
          if (warningState.show) {
            setWarningState({ show: false, remainingTime: 0 });
            if (timersRef.current.countdown) {
              clearInterval(timersRef.current.countdown);
              delete timersRef.current.countdown;
            }
          }
        }
        break;
        
      case STORAGE_KEYS.WARNING_TIME:
        if (e.newValue && e.newValue !== e.oldValue && !isLeaderRef.current && !warningState.show) {
          const warningTime = parseInt(e.newValue, 10);
          if (isNaN(warningTime)) return; // Invalid value
          
          const now = Date.now();
          if (warningTime <= now && document.visibilityState === 'visible') {
            const logoutTimeStr = getStorageItem(STORAGE_KEYS.LOGOUT_TIME);
            if (logoutTimeStr) {
              const logoutTime = parseInt(logoutTimeStr, 10);
              if (!isNaN(logoutTime)) {
                const remainingTime = logoutTime - now;
                if (remainingTime > 0 && remainingTime <= AUTO_LOGOUT_WARNING_TIME) {
                  startWarningCountdown(remainingTime);
                }
              }
            }
          }
        }
        break;
        
      case STORAGE_KEYS.LEADER_ID:
        // Leader changed, check if we should become leader
        if (e.newValue !== tabIdRef.current) {
          // Small delay to prevent race conditions
          setTimeout(checkLeadership, 100);
        }
        break;
    }
  }, [isAuthPage, user, warningState.show, handleLogout, getStorageItem, startWarningCountdown, checkLeadership]);

  // Periodic activity check (leader only)
  const checkActivity = useCallback(() => {
    if (!isLeaderRef.current || isAuthPage || !user || !stateRef.current.isActive) return;
    if (document.visibilityState !== 'visible') return;
    
    const now = Date.now();
    const inactiveTime = now - lastActivityRef.current;
    
    // If we've been inactive longer than the timeout, logout
    if (logoutTimeout && inactiveTime >= logoutTimeout) {
      handleLogout('timeout');
      return;
    }
    
    // Check if absolute logout time has passed
    if (now >= stateRef.current.logoutTime) {
      handleLogout('timeout');
      return;
    }
    
    // Check if we should show warning
    const timeUntilLogout = stateRef.current.logoutTime - now;
    if (timeUntilLogout <= AUTO_LOGOUT_WARNING_TIME && !warningState.show) {
      startWarningCountdown(timeUntilLogout);
    }
  }, [isAuthPage, user, logoutTimeout, warningState.show, handleLogout, startWarningCountdown]);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (isAuthPage || !user) return;
    
    if (document.visibilityState === 'visible') {
      // Check leadership when tab becomes visible
      checkLeadership();
      
      // If we're leader, check for expired logout time
      if (isLeaderRef.current && stateRef.current.isActive) {
        const now = Date.now();
        if (now >= stateRef.current.logoutTime) {
          handleLogout('timeout');
          return;
        }
        
        const timeUntilLogout = stateRef.current.logoutTime - now;
        if (timeUntilLogout <= AUTO_LOGOUT_WARNING_TIME && !warningState.show) {
          startWarningCountdown(timeUntilLogout);
        }
      }
    }
  }, [isAuthPage, user, checkLeadership, warningState.show, startWarningCountdown, handleLogout]);

  // Main effect - setup when user/timeout changes
  useEffect(() => {
    if (!user || isAuthPage) {
      clearAllTimers();
      resignLeadership();
      return;
    }
    
    if (!logoutTimeout || logoutTimeout === 0) {
      clearAllTimers();
      resignLeadership();
      return;
    }
    
    // Start leader election
    checkLeadership();
    
    // Setup leader election interval
    timersRef.current.leaderElection = window.setInterval(checkLeadership, LEADER_HEARTBEAT_INTERVAL);
    
    // Setup activity check (only runs when leader)
    timersRef.current.activityCheck = window.setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL);
    
    return () => {
      clearAllTimers();
      resignLeadership();
    };
  }, [user, isAuthPage, logoutTimeout, checkLeadership, checkActivity, clearAllTimers, resignLeadership]);

  // Leader scheduling effect
  useEffect(() => {
    if (isLeader && user && !isAuthPage && logoutTimeout && logoutTimeout > 0) {
      scheduleLogout();
    }
  }, [isLeader, user, isAuthPage, logoutTimeout, scheduleLogout]);

  // Activity tracking effect
  useEffect(() => {
    if (isAuthPage || !user || !logoutTimeout) {
      return;
    }
    
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 'scroll', 
      'touchstart', 'click', 'keypress', 'focus'
    ];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetActivity, { passive: true });
    });
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup on beforeunload
    const handleBeforeUnload = () => {
      if (isLeaderRef.current) {
        resignLeadership();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthPage, user, logoutTimeout, resetActivity, handleVisibilityChange, handleStorageChange, resignLeadership]);

  // Don't render on auth pages
  if (isAuthPage || !user) {
    return null;
  }
  
  const progressPercentage = Math.max(0, Math.min(100, 
    (warningState.remainingTime / AUTO_LOGOUT_WARNING_TIME) * 100
  ));
  
  return (
    <Dialog
      open={warningState.show}
      aria-labelledby="logout-warning-dialog-title"
      aria-describedby="logout-warning-dialog-description"
      className="dark:bg-gray-900"
    >
      <DialogTitle id="logout-warning-dialog-title" className="dark:bg-gray-800 dark:text-white">
        Peringatan Sesi Akan Berakhir
      </DialogTitle>
      <DialogContent className="dark:bg-gray-800">
        <DialogContentText id="logout-warning-dialog-description" className="dark:text-gray-300">
          Anda akan keluar secara otomatis dalam {Math.ceil(warningState.remainingTime / 1000)} detik karena tidak ada aktivitas.
        </DialogContentText>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progressPercentage} color="warning" />
          <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }} className="dark:text-gray-300">
            {Math.ceil(warningState.remainingTime / 1000)} detik tersisa
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