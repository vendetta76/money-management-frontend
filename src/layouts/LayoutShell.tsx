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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Pets as CatIcon,
} from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { useTheme as useCustomTheme } from "../hooks/useThemeAdvanced";
import { useGesture } from "@use-gesture/react";

const DRAWER_WIDTH = 280;

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell = ({ children }: LayoutShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme: customTheme } = useCustomTheme();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Gesture handling for PWA slide functionality
  const bind = useGesture({
    onDragEnd: ({ swipe: [x], movement: [mx] }) => {
      if (!isMobile) return;
      
      // Swipe right to open (from left edge)
      if (x === 1 || (mx > 100 && !mobileOpen)) {
        setMobileOpen(true);
      }
      // Swipe left to close
      if (x === -1 || (mx < -100 && mobileOpen)) {
        setMobileOpen(false);
      }
    },
    onDrag: ({ movement: [mx], first, memo = mobileOpen }) => {
      if (!isMobile) return memo;
      
      // Only handle gestures from the edge when closed, or anywhere when open
      if (!memo && first && mx < 20) return memo;
      
      return memo;
    },
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box 
      {...bind()} 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        touchAction: 'pan-y',
      }}
    >
      <CssBaseline />
      
      {/* Mobile App Bar */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'block', md: 'none' },
          width: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)}, ${alpha(theme.palette.secondary.main, 0.9)})`,
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
            <CatIcon sx={{ mr: 1, fontSize: '1.5rem' }} />
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              MoniQ
            </Typography>
          </Box>
          
          <Box sx={{ width: 48 }} />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar 
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content - Simplified approach */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          // Remove complex width calculations, let flexGrow handle it
        }}
      >
        {/* Spacer for mobile app bar */}
        <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
        
        <Box
          sx={{
            minHeight: { xs: 'calc(100vh - 64px)', md: '100vh' },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Gesture hint for PWA */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 4,
          height: 60,
          background: `linear-gradient(to right, transparent, ${alpha(theme.palette.primary.main, 0.3)})`,
          borderRadius: '0 8px 8px 0',
          display: { xs: 'block', md: 'none' },
          pointerEvents: 'none',
          opacity: mobileOpen ? 0 : 0.6,
          transition: 'opacity 0.3s ease',
          zIndex: 1000,
        }}
      />
    </Box>
  );
};

export default LayoutShell;