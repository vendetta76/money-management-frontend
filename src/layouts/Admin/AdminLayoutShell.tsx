import { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  CssBaseline,
  alpha,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AdminPanelSettings,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  Security,
  Refresh,
} from "@mui/icons-material";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const DRAWER_WIDTH = 280;

interface AdminLayoutShellProps {
  children: React.ReactNode;
}

const AdminLayoutShell = ({ children }: AdminLayoutShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [systemStatus, setSystemStatus] = useState<'online' | 'maintenance' | 'warning'>('online');
  const [notificationCount, setNotificationCount] = useState(3);
  
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationOpen = Boolean(notificationAnchor);

  // Mock notifications data
  const notifications = [
    { id: 1, title: "New user registered", time: "2 minutes ago", type: "info" },
    { id: 2, title: "Large transaction detected", time: "5 minutes ago", type: "warning" },
    { id: 3, title: "System backup completed", time: "1 hour ago", type: "success" },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out.");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to logout.");
    }
    handleProfileMenuClose();
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'online': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'maintenance': return theme.palette.error.main;
      default: return theme.palette.success.main;
    }
  };

  const getStatusText = () => {
    switch (systemStatus) {
      case 'online': return 'System Online';
      case 'warning': return 'System Warning';
      case 'maintenance': return 'Maintenance Mode';
      default: return 'System Online';
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <CssBaseline />
      
      {/* Mobile App Bar */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'block', md: 'none' },
          width: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)}, ${alpha(theme.palette.primary.dark, 0.95)})`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.shadows[4],
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              '&:hover': {
                transform: 'scale(1.1)',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              },
              transition: 'all 0.3s ease',
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <AdminPanelSettings sx={{ mr: 1, fontSize: '1.5rem' }} />
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              Admin Panel
            </Typography>
          </Box>
          
          {/* Mobile Notifications */}
          <IconButton 
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Desktop Top Bar */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.paper, 0.9)})`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          
          {/* System Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                mr: 1,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                },
              }}
            />
            <Typography variant="body2" color="textSecondary">
              {getStatusText()}
            </Typography>
          </Box>

          {/* Refresh Button */}
          <IconButton 
            color="inherit"
            onClick={() => window.location.reload()}
            sx={{ mr: 1 }}
          >
            <Refresh />
          </IconButton>

          {/* Notifications */}
          <IconButton 
            color="inherit"
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton 
            onClick={handleProfileMenuOpen}
            sx={{ p: 0 }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            mt: 1,
          },
        }}
      >
        <MenuItem onClick={() => navigate('/admin/profile')}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => navigate('/admin/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => navigate('/admin/security')}>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          Security
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={isNotificationOpen}
        onClose={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 300,
            maxHeight: 400,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        {notifications.map((notification) => (
          <MenuItem key={notification.id} onClick={handleNotificationMenuClose}>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {notification.title}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button 
            fullWidth 
            size="small" 
            onClick={() => {
              navigate('/admin/notifications');
              handleNotificationMenuClose();
            }}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>

      {/* Sidebar */}
      <AdminSidebar 
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
        }}
      >
        {/* Spacer for mobile app bar */}
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
        {/* Spacer for desktop app bar */}
        <Toolbar sx={{ display: { xs: 'none', md: 'block' } }} />
        
        <Box
          sx={{
            minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 64px)' },
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayoutShell;