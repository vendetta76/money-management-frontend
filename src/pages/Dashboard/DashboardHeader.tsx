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
  Stack,
  Grid,
  Badge,
  useTheme,
  alpha,
  Fade,
  Slide
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Help as HelpIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  Star as StarIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import LangToggle from './LangToggle';

interface Props {
  displayName?: string | null;
}

const DashboardHeader: React.FC<Props> = ({ displayName }) => {
  const theme = useTheme();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 17) return 'Selamat Siang';
    if (hour < 21) return 'Selamat Sore';
    return 'Selamat Malam';
  }, []);

  // Get user initials for avatar
  const userInitials = useMemo(() => {
    if (!displayName) return 'U';
    return displayName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [displayName]);

  // Mock notifications (in real app, this would come from props or context)
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

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
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
          color: 'white',
          '&:hover': {
            elevation: 4,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Left Section - Main Title & Greeting */}
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
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
            </Grid>

            {/* Right Section - Controls & User Menu */}
            <Grid item xs={12} md={6}>
              <Box 
                display="flex" 
                justifyContent="flex-end" 
                alignItems="center" 
                gap={2}
                flexWrap="wrap"
              >
                {/* Language Toggle */}
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

                {/* Theme Toggle */}
                <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                  <IconButton
                    onClick={() => setDarkMode(!darkMode)}
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                      }
                    }}
                  >
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>

                {/* Search Button */}
                <Tooltip title="Pencarian">
                  <IconButton
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      color: 'white',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                      }
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </Tooltip>

                {/* Notifications */}
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

                {/* User Profile */}
                <Tooltip title="Profil & Pengaturan">
                  <Button
                    onClick={handleUserMenuOpen}
                    startIcon={
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: alpha(theme.palette.common.white, 0.2),
                          fontSize: '0.875rem'
                        }}
                      >
                        {userInitials}
                      </Avatar>
                    }
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                      },
                      borderRadius: 3,
                      px: 2
                    }}
                  >
                    <Box textAlign="left">
                      <Typography variant="body2" fontWeight="bold">
                        {displayName || 'User'}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Premium User
                      </Typography>
                    </Box>
                  </Button>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 8,
            sx: {
              mt: 1,
              minWidth: 200,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1.5,
              },
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {userInitials}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {displayName || 'User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Premium Account
                </Typography>
              </Box>
            </Box>
          </Box>

          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile Saya</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pengaturan</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <HelpIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Bantuan</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Keluar</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
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
              maxWidth: 400,
              minWidth: 300,
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

          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <MenuItem 
                key={notification.id}
                onClick={handleNotificationMenuClose}
                sx={{
                  alignItems: 'flex-start',
                  py: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05)
                }}
              >
                <ListItemIcon sx={{ mt: 0.5 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main'
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            ))}
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button fullWidth variant="outlined" size="small">
              Lihat Semua Notifikasi
            </Button>
          </Box>
        </Menu>
      </Card>
    </Fade>
  );
};

export default DashboardHeader;