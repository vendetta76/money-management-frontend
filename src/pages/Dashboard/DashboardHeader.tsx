import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Button,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Stack,
  Collapse,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Update as UpdateIcon,
  Verified as VerifiedIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  CheckCircle as CheckCircleIcon,
  ClearAll as ClearAllIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import LangToggle from './LangToggle';

// 🚀 Import real notification system
import { useNotifications, getNotificationIcon, getNotificationColor } from '../hooks/useNotifications';

interface Props {
  displayName?: string | null;
}

const DashboardHeader: React.FC<Props> = ({ displayName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [showDetails, setShowDetails] = useState(!isMobile);

  // 🔔 Real notification system
  const { 
    notifications, 
    unreadCount, 
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead 
  } = useNotifications();

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    if (hour < 21) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  // 🔔 Handle notification click
  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    handleNotificationMenuClose();
  };

  // 🔔 Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const currentTime = new Date().toLocaleString('id-ID', {
    weekday: isSmallMobile ? 'short' : 'long',
    year: 'numeric',
    month: isSmallMobile ? 'short' : 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // 🔔 Format notification time
  const formatNotificationTime = (createdAt: any) => {
    if (!createdAt) return '';
    
    try {
      const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
      
      if (diffInMinutes < 1) return 'Baru saja';
      if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`;
      
      return format(date, 'dd MMM, HH:mm', { locale: localeID });
    } catch (error) {
      return '';
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Card 
        elevation={2}
        sx={{ 
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white'
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Mobile Layout */}
          {isMobile ? (
            <Box>
              {/* Top Row - Essential Info */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar 
                    sx={{ 
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      width: { xs: 36, sm: 42 },
                      height: { xs: 36, sm: 42 }
                    }}
                  >
                    <DashboardIcon fontSize={isSmallMobile ? 'medium' : 'large'} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isSmallMobile ? "h5" : "h4"}
                      fontWeight="bold" 
                      sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                      Dashboard
                    </Typography>
                    {!isSmallMobile && (
                      <Chip 
                        label="Pro" 
                        size="small"
                        sx={{ 
                          bgcolor: alpha(theme.palette.common.white, 0.2),
                          color: 'white',
                          fontWeight: 'bold',
                          mt: 0.5
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Mobile Controls */}
                <Stack direction="row" spacing={1} alignItems="center">
                  {/* Language Toggle - Compact */}
                  <Box
                    sx={{ 
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      borderRadius: 1,
                      p: 0.5
                    }}
                  >
                    <LangToggle variant="chip" compact={true} size="small" showFlags={!isSmallMobile} />
                  </Box>

                  {/* 🔔 Real Notifications */}
                  <IconButton
                    onClick={handleNotificationMenuOpen}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                      }
                    }}
                  >
                    <Badge 
                      badgeContent={unreadCount} 
                      color="error"
                      max={99}
                    >
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  </IconButton>

                  {/* Expand Details Button */}
                  <IconButton
                    onClick={() => setShowDetails(!showDetails)}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>

              {/* Greeting Row */}
              <Box mb={showDetails ? 1 : 0}>
                <Typography 
                  variant={isSmallMobile ? "body1" : "h6"}
                  sx={{ opacity: 0.9 }}
                >
                  {greeting}, {displayName ? (displayName.length > 15 && isSmallMobile ? displayName.substring(0, 15) + '...' : displayName) : 'User'}!
                  {!isSmallMobile && <VerifiedIcon fontSize="small" sx={{ ml: 1, opacity: 0.8 }} />}
                </Typography>
              </Box>

              {/* Collapsible Details */}
              <Collapse in={showDetails}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <UpdateIcon fontSize="small" />
                  {currentTime}
                </Typography>
              </Collapse>
            </Box>
          ) : (
            /* Desktop Layout */
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {/* Left Section */}
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    width: 48,
                    height: 48
                  }}
                >
                  <DashboardIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    sx={{ 
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    Dashboard
                    <Chip 
                      label="Pro" 
                      size="small"
                      sx={{ 
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      {greeting}, {displayName || 'User'}!
                    </Typography>
                    <VerifiedIcon fontSize="small" sx={{ opacity: 0.8 }} />
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      opacity: 0.8,
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <UpdateIcon fontSize="small" />
                    {currentTime}
                  </Typography>
                </Box>
              </Box>

              {/* Right Section */}
              <Box display="flex" alignItems="center" gap={2}>
                <Box 
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    p: 1,
                    borderRadius: 2
                  }}
                >
                  <LangToggle />
                </Box>

                {/* 🔔 Real Notifications */}
                <Tooltip title="Notifikasi">
                  <IconButton
                    onClick={handleNotificationMenuOpen}
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                      }
                    }}
                  >
                    <Badge 
                      badgeContent={unreadCount} 
                      color="error"
                      max={99}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </CardContent>

        {/* 🔔 Real Notifications Menu */}
        <Menu
          anchorEl={notificationMenuAnchor}
          open={Boolean(notificationMenuAnchor)}
          onClose={handleNotificationMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1,
              maxWidth: { xs: '90vw', sm: 400 },
              minWidth: { xs: 280, sm: 300 },
              maxHeight: { xs: '70vh', sm: 500 }
            },
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                🔔 Notifikasi
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {unreadCount > 0 && (
                  <Chip 
                    label={`${unreadCount} baru`}
                    size="small"
                    color="primary"
                  />
                )}
                {!notificationsLoading && unreadCount > 0 && (
                  <Tooltip title="Tandai semua sebagai dibaca">
                    <IconButton size="small" onClick={handleMarkAllAsRead}>
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ maxHeight: { xs: '50vh', sm: 400 }, overflow: 'auto' }}>
            {notificationsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Loading notifications...
                </Typography>
              </Box>
            ) : notifications.length === 0 ? (
              <Box p={3} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  🔕 Belum ada notifikasi
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Notifikasi akan muncul di sini
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    alignItems: 'flex-start',
                    py: 2,
                    px: { xs: 1.5, sm: 2 },
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      bgcolor: notification.read 
                        ? alpha(theme.palette.action.hover, 0.5)
                        : alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <ListItemIcon sx={{ mt: 0.5, minWidth: { xs: 32, sm: 40 } }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: alpha(getNotificationColor(notification.type), 0.1),
                        color: getNotificationColor(notification.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography 
                          variant="subtitle2" 
                          fontWeight="bold"
                          sx={{ 
                            fontSize: { xs: '0.85rem', sm: '0.875rem' },
                            lineHeight: 1.2
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <CircleIcon
                            sx={{
                              width: 8,
                              height: 8,
                              color: 'primary.main',
                              flexShrink: 0,
                              ml: 1
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            lineHeight: 1.3,
                            mb: 0.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {formatNotificationTime(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </MenuItem>
              ))
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box sx={{ p: { xs: 1.5, sm: 2 }, borderTop: 1, borderColor: 'divider' }}>
              <Button 
                fullWidth 
                variant="outlined" 
                size="small"
                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                onClick={handleNotificationMenuClose}
              >
                Tutup
              </Button>
            </Box>
          )}
        </Menu>
      </Card>
    </Fade>
  );
};

export default DashboardHeader;