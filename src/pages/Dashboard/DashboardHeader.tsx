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
  Paper,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Stack,
  Collapse
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
  Menu as MenuIcon
} from '@mui/icons-material';
import LangToggle from './LangToggle';

interface Props {
  displayName?: string | null;
}

const DashboardHeader: React.FC<Props> = ({ displayName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [showDetails, setShowDetails] = useState(!isMobile); // Auto-collapse on mobile

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    if (hour < 21) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'Transaksi Baru',
      message: 'Pemasukan sebesar Rp 500.000',
      time: '5 menit lalu',
      read: false,
      type: 'income'
    },
    {
      id: 2,
      title: 'Target Tercapai',
      message: 'Target tabungan bulan ini telah tercapai!',
      time: '1 jam lalu',
      read: false,
      type: 'achievement'
    },
    {
      id: 3,
      title: 'Reminder',
      message: 'Jangan lupa bayar tagihan listrik',
      time: '2 jam lalu',
      read: true,
      type: 'reminder'
    }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUpIcon color="success" fontSize="small" />;
      case 'achievement':
        return <StarIcon color="warning" fontSize="small" />;
      case 'reminder':
        return <ScheduleIcon color="info" fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const currentTime = new Date().toLocaleString('id-ID', {
    weekday: isSmallMobile ? 'short' : 'long',
    year: 'numeric',
    month: isSmallMobile ? 'short' : 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

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

                  {/* Notifications */}
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
                    <Badge badgeContent={unreadNotifications} color="error">
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
            /* Desktop Layout - Original */
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
                <Paper 
                  elevation={0}
                  sx={{ 
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    p: 1,
                    borderRadius: 2
                  }}
                >
                  <LangToggle />
                </Paper>

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
                    <Badge badgeContent={unreadNotifications} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </CardContent>

        {/* Notifications Menu - Responsive */}
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
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="bold">
                Notifikasi
              </Typography>
              <Chip 
                label={`${unreadNotifications} baru`}
                size="small"
                color="primary"
              />
            </Box>
          </Box>

          <Box sx={{ maxHeight: { xs: '50vh', sm: 400 }, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <MenuItem 
                key={notification.id}
                onClick={handleNotificationMenuClose}
                sx={{
                  alignItems: 'flex-start',
                  py: 2,
                  px: { xs: 1.5, sm: 2 },
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05)
                }}
              >
                <ListItemIcon sx={{ mt: 0.5, minWidth: { xs: 32, sm: 40 } }}>
                  {getNotificationIcon(notification.type)}
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
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
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
                        {notification.time}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            ))}
          </Box>

          <Box sx={{ p: { xs: 1.5, sm: 2 }, borderTop: 1, borderColor: 'divider' }}>
            <Button 
              fullWidth 
              variant="outlined" 
              size="small"
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              Lihat Semua Notifikasi
            </Button>
          </Box>
        </Menu>
      </Card>
    </Fade>
  );
};

export default DashboardHeader;