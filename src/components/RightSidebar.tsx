import React, { ReactNode } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Divider,
  Fade,
  Backdrop,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';

interface RightSidebarProps {
  // Core props
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  
  // Customization props
  width?: number | string;
  icon?: ReactNode;
  subtitle?: string;
  
  // Header customization
  headerActions?: ReactNode;
  headerColor?: 'primary' | 'secondary' | 'default';
  
  // Footer customization  
  footer?: ReactNode;
  
  // Behavior props
  disableBackdropClose?: boolean;
  disableEscapeClose?: boolean;
  keepMounted?: boolean;
  
  // Mobile behavior
  fullscreenOnMobile?: boolean;
  
  // Advanced props
  className?: string;
  elevation?: number;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  // Core props
  open,
  onClose,
  title,
  children,
  
  // Customization props
  width = 'auto',
  icon,
  subtitle,
  
  // Header customization
  headerActions,
  headerColor = 'primary',
  
  // Footer customization
  footer,
  
  // Behavior props
  disableBackdropClose = false,
  disableEscapeClose = false,
  keepMounted = true,
  
  // Mobile behavior
  fullscreenOnMobile = true,
  
  // Advanced props
  className,
  elevation = 1
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Calculate sidebar width
  const getDrawerWidth = (): string | number => {
    if (isFullscreen) return '100vw';
    if (isMobile && fullscreenOnMobile) return '100vw';
    
    // Handle different width types
    if (typeof width === 'number') return width;
    if (typeof width === 'string') {
      if (width === 'small') return 320;
      if (width === 'medium') return 480;
      if (width === 'large') return 640;
      if (width === 'auto') return isMobile ? '100vw' : 480;
      return width;
    }
    
    return 480; // default
  };

  const handleClose = () => {
    if (!disableBackdropClose) {
      onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!disableEscapeClose && event.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <>
      {/* Custom Backdrop for better control */}
      <Backdrop
        open={open}
        onClick={handleClose}
        sx={{
          zIndex: theme.zIndex.drawer - 1,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        className={className}
        hideBackdrop // We use custom backdrop above
        PaperProps={{
          elevation,
          sx: {
            width: getDrawerWidth(),
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            zIndex: theme.zIndex.drawer,
          }
        }}
        ModalProps={{
          keepMounted,
        }}
        SlideProps={{
          direction: 'left'
        }}
      >
        {/* Header */}
        <AppBar 
          position="static" 
          color={headerColor} 
          elevation={1}
          sx={{
            bgcolor: headerColor === 'default' ? 'background.paper' : undefined,
            color: headerColor === 'default' ? 'text.primary' : undefined
          }}
        >
          <Toolbar>
            {/* Left side - Icon and Title */}
            <Box display="flex" alignItems="center" gap={1} sx={{ flex: 1 }}>
              {icon && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'inherit'
                }}>
                  {icon}
                </Box>
              )}
              
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  noWrap
                  sx={{ 
                    color: 'inherit',
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  {title}
                </Typography>
                
                {subtitle && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      opacity: 0.8,
                      color: 'inherit',
                      display: 'block',
                      lineHeight: 1
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {/* Right side - Actions and Controls */}
            <Box display="flex" alignItems="center" gap={0.5}>
              {/* Custom header actions */}
              {headerActions}
              
              {/* Fullscreen toggle (desktop only) */}
              {!isMobile && (
                <IconButton 
                  color="inherit" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              )}
              
              {/* Close button */}
              <IconButton 
                color="inherit" 
                onClick={onClose}
                size="small"
                sx={{ ml: 0.5 }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content Area */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Fade in={open} timeout={300}>
            <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
              {children}
            </Box>
          </Fade>
        </Box>

        {/* Footer (optional) */}
        {footer && (
          <>
            <Divider />
            <Paper 
              elevation={0}
              sx={{ 
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 0
              }}
            >
              {footer}
            </Paper>
          </>
        )}
      </Drawer>
    </>
  );
};

export default RightSidebar;