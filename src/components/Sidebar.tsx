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
  Collapse,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Home,
  Logout as LogOutIcon,
  AccountBalanceWallet,
  Pets as CatIcon, // Cat representation
  Receipt,
  History,
  ExpandLess,
  ExpandMore,
  CreditCard,
  SwapHoriz,
  Settings,
  Info,
  Person,
  Security,
  Tune,
  MenuBook,
  Policy,
  Description,
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { toast } from "react-hot-toast";
import ThemeSelect from "../components/ThemeSelect";
import InstallButton from "../components/InstallButton";

const DRAWER_WIDTH = 280;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'temporary' | 'permanent';
}

const Sidebar = ({ isOpen, onClose, variant = 'temporary' }: SidebarProps) => {
  const [isTransactionOpen, setIsTransactionOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("regular");
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const theme = useTheme();
  
  const allowedEmails = ["joeverson.kamantha@gmail.com"];
  const showVirtualMenu = user?.email && allowedEmails.includes(user.email);

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
        toast.error("Gagal memuat data pengguna.");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Berhasil logout.");
      navigate("/login");
    } catch (err) {
      toast.error("Gagal logout.");
    }
  };

  const getRoleChip = (userRole: string) => {
    const configs = {
      admin: { label: "👑 Admin", color: "error" as const },
      premium: { label: "🐱 Premium", color: "warning" as const },
      regular: { label: "🐾 Regular", color: "default" as const },
    };
    return configs[userRole as keyof typeof configs] || configs.regular;
  };

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home />, exact: true },
    { path: "/wallet", label: "Cat Wallet", icon: <CatIcon />, exact: true },
    ...(showVirtualMenu ? [{ path: "/virtual-wallet", label: "Virtual Wallet", icon: <CreditCard />, exact: true }] : []),
  ];

  const transactionItems = [
    { path: "/income", label: "Income", icon: <CatIcon /> },
    { path: "/outcome", label: "Outcome", icon: <Receipt /> },
    { path: "/transfer", label: "Transfer Antar Wallet", icon: <SwapHoriz /> },
  ];

  const settingsItems = [
    { path: "/settings/profile", label: "Profile", icon: <Person /> },
    { path: "/settings/security", label: "Security", icon: <Security /> },
    { path: "/settings/preferences", label: "Preferences", icon: <Tune /> },
  ];

  const aboutItems = [
    { path: "/about", label: "Tentang", icon: <MenuBook /> },
    { path: "/about/privacy-policy", label: "Kebijakan Privasi", icon: <Policy /> },
    { path: "/about/terms-and-conditions", label: "Syarat & Ketentuan", icon: <Description /> },
  ];

  const handleItemClick = () => {
    if (variant === 'temporary') {
      onClose();
    }
  };

  const NavListItem = ({ path, label, icon, exact = false }: any) => (
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
          '&.active': {
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
            '& .MuiListItemText-primary': {
              color: 'white',
            },
            transform: 'translateY(-1px)',
            boxShadow: theme.shadows[4],
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
            color: theme.palette.text.primary,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {icon}
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

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          🐱 MoniQ
        </Typography>

        {/* User Profile */}
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
          <Typography variant="subtitle1" fontWeight={600}>
            {name || "User"}
          </Typography>
          <Chip
            label={getRoleChip(role).label}
            color={getRoleChip(role).color}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List>
          {menuItems.map((item) => (
            <NavListItem key={item.path} {...item} />
          ))}

          {/* Transaction Section */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setIsTransactionOpen(!isTransactionOpen)}
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
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                <CatIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Transactions" 
                primaryTypographyProps={{ color: theme.palette.text.primary }}
              />
              {isTransactionOpen ? 
                <ExpandLess sx={{ color: theme.palette.text.primary }} /> : 
                <ExpandMore sx={{ color: theme.palette.text.primary }} />
              }
            </ListItemButton>
          </ListItem>
          <Collapse in={isTransactionOpen} timeout="auto" unmountOnExit>
            <Box sx={{ 
              pl: 2, 
              backgroundColor: 'transparent',
              '& .MuiListItem-root': {
                backgroundColor: 'transparent',
              }
            }}>
              {transactionItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          </Collapse>

          {/* History */}
          <NavListItem path="/history" label="History" icon={<History />} />

          {/* Settings Section */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
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
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                <Settings />
              </ListItemIcon>
              <ListItemText 
                primary="Settings" 
                primaryTypographyProps={{ color: theme.palette.text.primary }}
              />
              {isSettingsOpen ? 
                <ExpandLess sx={{ color: theme.palette.text.primary }} /> : 
                <ExpandMore sx={{ color: theme.palette.text.primary }} />
              }
            </ListItemButton>
          </ListItem>
          <Collapse in={isSettingsOpen} timeout="auto" unmountOnExit>
            <Box sx={{ 
              pl: 2, 
              backgroundColor: 'transparent',
              '& .MuiListItem-root': {
                backgroundColor: 'transparent',
              }
            }}>
              {settingsItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          </Collapse>

          {/* About Section */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setIsAboutOpen(!isAboutOpen)}
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
              <ListItemIcon sx={{ color: theme.palette.text.primary }}>
                <Info />
              </ListItemIcon>
              <ListItemText 
                primary="About MoniQ" 
                primaryTypographyProps={{ color: theme.palette.text.primary }}
              />
              {isAboutOpen ? 
                <ExpandLess sx={{ color: theme.palette.text.primary }} /> : 
                <ExpandMore sx={{ color: theme.palette.text.primary }} />
              }
            </ListItemButton>
          </ListItem>
          <Collapse in={isAboutOpen} timeout="auto" unmountOnExit>
            <Box sx={{ 
              pl: 2, 
              backgroundColor: 'transparent',
              '& .MuiListItem-root': {
                backgroundColor: 'transparent',
              }
            }}>
              {aboutItems.map((item) => (
                <NavListItem key={item.path} {...item} />
              ))}
            </Box>
          </Collapse>
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ mb: 2 }}>
          <InstallButton />
        </Box>
        
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
        
        <ThemeSelect />
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
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundImage: 'none',
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
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
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

export default Sidebar;