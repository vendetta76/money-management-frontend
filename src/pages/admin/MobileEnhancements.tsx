// src/components/MobileEnhancements.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Slide,
  SwipeableDrawer,
  AppBar,
  Toolbar,
  Avatar,
  Badge,
  Chip,
} from '@mui/material';
import {
  Add,
  Notifications,
  Search,
  Menu,
  Close,
  Settings,
  Person,
  Dashboard,
  AccountBalanceWallet,
  Receipt,
  Security,
  GetApp,
  Share,
  Fullscreen,
  FullscreenExit,
  TouchApp,
  Swipe,
  Vibration,
  WifiOff,
  CloudOff,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';

// PWA Install Prompt Component
interface PWAInstallPromptProps {
  deferredPrompt: any;
  onInstall: () => void;
  onDismiss: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ deferredPrompt, onInstall, onDismiss }) => {
  const [open, setOpen] = useState(Boolean(deferredPrompt));

  useEffect(() => {
    setOpen(Boolean(deferredPrompt));
  }, [deferredPrompt]);

  const handleInstall = () => {
    onInstall();
    setOpen(false);
  };

  const handleDismiss = () => {
    onDismiss();
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleDismiss} maxWidth="sm" fullWidth>
      <DialogTitle>Install Admin Panel</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <GetApp sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Install for Better Experience
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Install the admin panel as a PWA for:
          </Typography>
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <Typography variant="body2">• Faster loading times</Typography>
            <Typography variant="body2">• Offline functionality</Typography>
            <Typography variant="body2">• Native app-like experience</Typography>
            <Typography variant="body2">• Push notifications support</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismiss}>Maybe Later</Button>
        <Button variant="contained" onClick={handleInstall} startIcon={<GetApp />}>
          Install Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Mobile Quick Actions Fab
interface MobileQuickActionsProps {
  onAction: (action: string) => void;
}

const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  const actions = [
    { icon: <Add />, name: 'Add User', action: 'add-user' },
    { icon: <Receipt />, name: 'New Transaction', action: 'add-transaction' },
    { icon: <AccountBalanceWallet />, name: 'Create Wallet', action: 'add-wallet' },
    { icon: <Notifications />, name: 'Send Notification', action: 'send-notification' },
  ];

  return (
    <SpeedDial
      ariaLabel="Quick Actions"
      sx={{ position: 'fixed', bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.action}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={() => {
            onAction(action.action);
            setOpen(false);
          }}
        />
      ))}
    </SpeedDial>
  );
};

// Mobile Navigation Drawer
interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
}

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ open, onClose, currentUser }) => {
  const navItems = [
    { icon: <Dashboard />, text: 'Dashboard', path: '/admin/dashboard' },
    { icon: <Person />, text: 'Users', path: '/admin/users' },
    { icon: <AccountBalanceWallet />, text: 'Wallets', path: '/admin/wallets' },
    { icon: <Receipt />, text: 'Transactions', path: '/admin/transactions' },
    { icon: <Security />, text: 'Security', path: '/admin/security' },
    { icon: <Settings />, text: 'Settings', path: '/admin/settings' },
  ];

  return (
    <SwipeableDrawer
      anchor="left"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      swipeAreaWidth={20}
    >
      <Box sx={{ width: 280 }}>
        {/* User Profile Header */}
        <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.dark' }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6">{currentUser?.name || 'Admin'}</Typography>
              <Chip label="Administrator" size="small" sx={{ bgcolor: 'primary.dark', color: 'white' }} />
            </Box>
          </Box>
        </Box>

        {/* Navigation Items */}
        <List>
          {navItems.map((item) => (
            <ListItem button key={item.text} onClick={onClose}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </SwipeableDrawer>
  );
};

// Touch Gesture Helper
const TouchGestureHelper: React.FC = () => {
  const [showHint, setShowHint] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (isMobile) {
      const hasSeenHint = localStorage.getItem('gesture-hint-seen');
      if (!hasSeenHint) {
        setTimeout(() => setShowHint(true), 2000);
      }
    }
  }, [isMobile]);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('gesture-hint-seen', 'true');
  };

  if (!isMobile) return null;

  return (
    <Snackbar
      open={showHint}
      onClose={dismissHint}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={5000}
    >
      <Alert 
        onClose={dismissHint} 
        severity="info"
        sx={{ minWidth: 300 }}
        icon={<Swipe />}
      >
        <Typography variant="body2">
          <strong>Touch Gestures:</strong><br />
          • Swipe right from edge to open menu<br />
          • Pull down to refresh data<br />
          • Long press for context menu
        </Typography>
      </Alert>
    </Snackbar>
  );
};

// Offline Status Indicator
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bgcolor: 'error.main',
        color: 'white',
        p: 1,
        textAlign: 'center',
        zIndex: 9999,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <WifiOff fontSize="small" />
        <Typography variant="body2">
          You're offline. Some features may be limited.
        </Typography>
      </Box>
    </Box>
  );
};

// Pull to Refresh Component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || window.scrollY > 0) return;
    
    const touch = e.touches[0];
    const startY = touch.clientY;
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentY = touch.clientY;
      const diff = currentY - startY;
      
      if (diff > 100 && !isPulling) {
        setIsPulling(true);
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    };
    
    const handleTouchEnd = async () => {
      if (isPulling) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setIsPulling(false);
        }
      }
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <Box onTouchStart={handleTouchStart}>
      {(isPulling || refreshing) && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bgcolor: 'primary.main',
            color: 'white',
            p: 1,
            textAlign: 'center',
            zIndex: 1000,
          }}
        >
          <Typography variant="body2">
            {refreshing ? 'Refreshing...' : 'Release to refresh'}
          </Typography>
        </Box>
      )}
      {children}
    </Box>
  );
};

// Main Mobile Enhancements Component
interface MobileEnhancementsProps {
  children: React.ReactNode;
  currentUser?: any;
}

const MobileEnhancements: React.FC<MobileEnhancementsProps> = ({ children, currentUser }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // PWA Install Prompt Handler
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Fullscreen API
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle PWA Install
  const handlePWAInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
  };

  // Handle Quick Actions
  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Implement your quick action logic here
    switch (action) {
      case 'add-user':
        // Navigate to add user page or open dialog
        break;
      case 'add-transaction':
        // Navigate to add transaction page or open dialog
        break;
      case 'add-wallet':
        // Navigate to add wallet page or open dialog
        break;
      case 'send-notification':
        // Open notification dialog
        break;
    }
  };

  // Handle Pull to Refresh
  const handleRefresh = async () => {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.reload();
  };

  return (
    <Box>
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt
        deferredPrompt={deferredPrompt}
        onInstall={handlePWAInstall}
        onDismiss={() => setDeferredPrompt(null)}
      />

      {/* Touch Gesture Helper */}
      <TouchGestureHelper />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentUser={currentUser}
      />

      {/* Pull to Refresh Wrapper */}
      <PullToRefresh onRefresh={handleRefresh}>
        {children}
      </PullToRefresh>

      {/* Mobile Quick Actions */}
      <MobileQuickActions onAction={handleQuickAction} />

      {/* Mobile-specific Floating Action Buttons */}
      {isMobile && (
        <>
          {/* Fullscreen Toggle */}
          <Fab
            color="secondary"
            size="small"
            sx={{ position: 'fixed', bottom: 16, left: 16 }}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </Fab>

          {/* Menu Toggle (if needed for custom layouts) */}
          <Fab
            color="primary"
            size="medium"
            sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1100 }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu />
          </Fab>
        </>
      )}
    </Box>
  );
};

export default MobileEnhancements;