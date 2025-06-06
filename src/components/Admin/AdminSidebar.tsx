// src/components/AdminSidebar.tsx - ENHANCED VERSION WITH ALL NEW FEATURES
import { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  Button,
  Divider,
  useTheme,
  alpha,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  Logout as LogOutIcon,
  People,
  AccountBalanceWallet,
  Receipt,
  Settings,
  History,
  ExpandLess,
  ExpandMore,
  Security,
  Notifications,
  Assessment,
  AdminPanelSettings,
  Storage,
  BarChart,
  PieChart,
  TrendingUp,
  Person,
  Tune,
  Article,
  // New icons for enhanced features
  Campaign,
  Email,
  SystemUpdate,
  MonitorHeart,
  BugReport,
  Shield,
  VpnKey,
  Timeline,
  PhoneAndroid,
  Speed,
  CloudSync,
  Warning,
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { toast } from "react-hot-toast";

const DRAWER_WIDTH = 280;

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'temporary' | 'permanent';
}

const AdminSidebar = ({ isOpen, onClose, variant = 'temporary' }: AdminSidebarProps) => {
  const [isManagementOpen, setIsManagementOpen] = useState(true);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("admin");
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        if (data.avatar) setPhotoURL(data.avatar);
        if (data.name) setName(data.name);
        if (data.role) setRole(data.role.toLowerCase());
        setLoading(false);
      },
      (error) => {
        console.error("🔥 Firestore error:", error);
        toast.error("Failed to load user data.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Successfully logged out.");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to logout.");
    }
  };

  const getRoleChip = (userRole: string) => {
    const configs = {
      superadmin: { label: "👑 Super Admin", color: "error" as const },
      admin: { label: "🛡️ Admin", color: "warning" as const },
      staff: { label: "👨‍💼 Staff", color: "info" as const },
      viewer: { label: "👁️ Viewer", color: "default" as const },
    };
    return configs[userRole as keyof typeof configs] || configs.admin;
  };

  const mainMenuItems = [
    { 
      path: "/admin/dashboard", 
      label: "Dashboard", 
      icon: <Dashboard />, 
      exact: true,
      badge: null
    },
  ];

  const managementItems = [
    { path: "/admin/users", label: "User Management", icon: <People /> },
    { path: "/admin/wallets", label: "Wallet Management", icon: <AccountBalanceWallet /> },
    { path: "/admin/transactions", label: "Transactions", icon: <Receipt /> },
    { path: "/admin/posts", label: "Post Management", icon: <Article /> },
  ];

  // 📨 NEW: Communication System
  const communicationItems = [
    { 
      path: "/admin/communications", 
      label: "Communications Hub", 
      icon: <Campaign />,
      badge: null
    },
    { 
      path: "/admin/notifications", 
      label: "Push Notifications", 
      icon: <Notifications />,
      badge: 3 // Active notifications count
    },
    { 
      path: "/admin/communications", 
      label: "Email Templates", 
      icon: <Email /> 
    },
  ];

  // 🛠️ NEW: System Management
  const systemItems = [
    { 
      path: "/admin/system", 
      label: "System Health", 
      icon: <MonitorHeart />,
      badge: null
    },
    { 
      path: "/admin/system/performance", 
      label: "Performance", 
      icon: <Speed /> 
    },
    { 
      path: "/admin/system/backup", 
      label: "Backup Manager", 
      icon: <CloudSync /> 
    },
    { 
      path: "/admin/system/maintenance", 
      label: "Maintenance", 
      icon: <SystemUpdate /> 
    },
  ];

  // 🔐 NEW: Enhanced Security
  const securityItems = [
    { 
      path: "/admin/security", 
      label: "Security Overview", 
      icon: <Shield />,
      badge: null
    },
    { 
      path: "/admin/security/alerts", 
      label: "Security Alerts", 
      icon: <Warning />,
      badge: 2 // Active security alerts
    },
    { 
      path: "/admin/security/sessions", 
      label: "Session Management", 
      icon: <Timeline /> 
    },
    { 
      path: "/admin/security/whitelist", 
      label: "IP Whitelist", 
      icon: <VpnKey /> 
    },
    { 
      path: "/admin/security/bugs", 
      label: "Bug Reports", 
      icon: <BugReport />,
      badge: 5 // Open bug reports
    },
  ];

  const reportsItems = [
    { path: "/admin/reports/overview", label: "Overview", icon: <Assessment /> },
    { path: "/admin/reports/analytics", label: "Analytics", icon: <BarChart /> },
    { path: "/admin/reports/charts", label: "Charts", icon: <PieChart /> },
    { path: "/admin/reports/trends", label: "Trends", icon: <TrendingUp /> },
  ];

  const settingsItems = [
    { path: "/admin/settings/general", label: "General", icon: <Tune /> },
    { path: "/admin/settings/security", label: "Security", icon: <Security /> },
    { path: "/admin/settings/notifications", label: "Notifications", icon: <Notifications /> },
  ];

  // Original system items (kept for audit logs)
  const auditItems = [
    { path: "/admin/audit-logs", label: "Audit Logs", icon: <History /> },
  ];

  const handleItemClick = () => {
    if (variant === 'temporary') {
      onClose();
    }
  };

  const NavListItem = ({ path, label, icon, exact = false, badge = null }: any) => (
    <ListItem disablePadding sx={{ backgroundColor: 'transparent' }}>
      <ListItemButton
        component={NavLink}
        to={path}
        onClick={handleItemClick}
        sx={{
          borderRadius: 2,
          mx: 1,
          mb: 0.5,
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          '&.active': {
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            color: 'white',
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
            '& .MuiListItemText-primary': {
              color: 'white',
            },
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            transform: 'translateY(-1px)',
            '& .MuiListItemIcon-root': {
              transform: 'scale(1.1)',
              color: theme.palette.primary.main,
            },
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: theme.palette.text.secondary,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {badge ? (
            <Badge badgeContent={badge} color="error">
              {icon}
            </Badge>
          ) : (
            icon
          )}
        </ListItemIcon>
        <ListItemText 
          primary={label} 
          primaryTypographyProps={{ 
            fontWeight: 500,
            fontSize: '0.9rem',
            color: theme.palette.text.primary,
          }} 
        />
      </ListItemButton>
    </ListItem>
  );

  const SectionHeader = ({ onClick, isOpen, icon, title, badge = null }: any) => (
    <ListItem disablePadding>
      <ListItemButton 
        onClick={onClick}
        sx={{ 
          mx: 1, 
          borderRadius: 2,
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.08),
          }
        }}
      >
        <ListItemIcon sx={{ color: theme.palette.text.secondary }}>
          {badge ? (
            <Badge badgeContent={badge} color="error">
              {icon}
            </Badge>
          ) : (
            icon
          )}
        </ListItemIcon>
        <ListItemText 
          primary={title} 
          primaryTypographyProps={{ 
            color: theme.palette.text.primary,
            fontWeight: 600,
          }}
        />
        {isOpen ? 
          <ExpandLess sx={{ color: theme.palette.text.secondary }} /> : 
          <ExpandMore sx={{ color: theme.palette.text.secondary }} />
        }
      </ListItemButton>
    </ListItem>
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          🛡️ AdminPanel
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: 'block',
            mb: 3,
          }}
        >
          Enhanced Management System
        </Typography>

        {/* Admin Profile */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={photoURL?.replace("/upload/", "/upload/f_auto/") || "/default-avatar.png"}
            sx={{ 
              width: 56, 
              height: 56, 
              mb: 1,
              border: `3px solid ${theme.palette.primary.main}`,
              boxShadow: theme.shadows[3],
            }}
          />
          <Typography 
            variant="subtitle1" 
            fontWeight={600}
            sx={{
              color: theme.palette.text.primary,
            }}
          >
            {name || "Admin User"}
          </Typography>
          <Chip
            label={getRoleChip(role).label}
            color={getRoleChip(role).color}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: theme.palette.divider }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {/* Main Dashboard */}
          {mainMenuItems.map((item) => (
            <NavListItem key={item.path} {...item} />
          ))}

          <Divider sx={{ my: 1, mx: 2 }} />

          {/* Management Section */}
          <SectionHeader
            onClick={() => setIsManagementOpen(!isManagementOpen)}
            isOpen={isManagementOpen}
            icon={<AdminPanelSettings />}
            title="Core Management"
          />
          {isManagementOpen && (
            <Box sx={{ pl: 2, backgroundColor: 'transparent' }}>
              {managementItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          )}

          {/* 📨 NEW: Communication Section */}
          <SectionHeader
            onClick={() => setIsCommunicationOpen(!isCommunicationOpen)}
            isOpen={isCommunicationOpen}
            icon={<Campaign />}
            title="Communications"
            badge={3}
          />
          {isCommunicationOpen && (
            <Box sx={{ pl: 2, backgroundColor: 'transparent' }}>
              {communicationItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          )}

          {/* 🛠️ NEW: System Management Section */}
          <SectionHeader
            onClick={() => setIsSystemOpen(!isSystemOpen)}
            isOpen={isSystemOpen}
            icon={<MonitorHeart />}
            title="System Management"
          />
          {isSystemOpen && (
            <Box sx={{ pl: 2, backgroundColor: 'transparent' }}>
              {systemItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          )}

          {/* 🔐 NEW: Enhanced Security Section */}
          <SectionHeader
            onClick={() => setIsSecurityOpen(!isSecurityOpen)}
            isOpen={isSecurityOpen}
            icon={<Shield />}
            title="Security Center"
            badge={7}
          />
          {isSecurityOpen && (
            <Box sx={{ pl: 2, backgroundColor: 'transparent' }}>
              {securityItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          )}

          {/* Reports Section */}
          <SectionHeader
            onClick={() => setIsReportsOpen(!isReportsOpen)}
            isOpen={isReportsOpen}
            icon={<Assessment />}
            title="Reports & Analytics"
          />
          {isReportsOpen && (
            <Box sx={{ pl: 2, backgroundColor: 'transparent' }}>
              {reportsItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          )}

          {/* Audit Logs (Standalone) */}
          {auditItems.map((item) => (
            <NavListItem key={item.path} {...item} />
          ))}

          {/* Settings Section */}
          <SectionHeader
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            isOpen={isSettingsOpen}
            icon={<Settings />}
            title="Settings"
          />
          {isSettingsOpen && (
            <Box sx={{ pl: 2, backgroundColor: 'transparent' }}>
              {settingsItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          )}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ 
        p: 2, 
        borderTop: `1px solid ${theme.palette.divider}`,
      }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogOutIcon />}
          onClick={handleLogout}
          sx={{
            mb: 2,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: theme.shadows[4],
            },
          }}
        >
          Logout
        </Button>
        
        {/* System Status Indicator */}
        <Box sx={{ 
          mt: 2, 
          p: 1.5, 
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="success.main">
            🟢 All Systems Online
          </Typography>
        </Box>

        {/* Mobile Enhancement Indicator */}
        <Box sx={{ 
          mt: 1, 
          p: 1, 
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          borderRadius: 2,
          textAlign: 'center',
          display: { xs: 'block', md: 'none' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <PhoneAndroid sx={{ fontSize: 14 }} color="info" />
            <Typography variant="caption" color="info.main">
              Mobile Enhanced
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;