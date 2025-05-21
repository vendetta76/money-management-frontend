import React, { useState, useEffect } from 'react';
import { Box, Container, AppBar, Toolbar, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { LockOpen as UnlockedIcon, Lock as LockedIcon } from '@mui/icons-material';
import { usePinTimeout } from '@/context/PinTimeoutContext';
import WalletPinVerification from './WalletPinVerification';
import WalletLockButton from './WalletLockButton';

interface WalletPageWrapperProps {
  children: React.ReactNode;
  title?: string;
}

const WalletPageWrapper: React.FC<WalletPageWrapperProps> = ({ 
  children,
  title = "Dompet"
}) => {
  const { isPinVerified, hasPin } = usePinTimeout();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Show PIN verification if PIN is set but not verified
  useEffect(() => {
    if (hasPin && !isPinVerified) {
      setShowPinDialog(true);
    } else {
      setShowPinDialog(false);
    }
  }, [hasPin, isPinVerified]);

  return (
    <>
      <Box sx={{ flexGrow: 1, pb: 2 }}>
        <AppBar 
          position="static" 
          color="default" 
          elevation={0}
          sx={{ 
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            
            {hasPin && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mr: 2,
                    color: isPinVerified ? 'success.main' : 'error.main'
                  }}
                >
                  {isPinVerified ? 
                    <UnlockedIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
                    <LockedIcon fontSize="small" sx={{ mr: 0.5 }} />
                  }
                  <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {isPinVerified ? 'Terbuka' : 'Terkunci'}
                  </Typography>
                </Box>
                
                {isPinVerified && (
                  <WalletLockButton 
                    variant="outlined"
                    size="small"
                    iconOnly={isMobile}
                  />
                )}
              </Box>
            )}
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {isPinVerified || !hasPin ? (
            children
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '50vh',
                textAlign: 'center',
                p: 3
              }}
            >
              <LockedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Halaman Dompet Terkunci
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                Untuk alasan keamanan, halaman dompet Anda terkunci. 
                Silakan verifikasi PIN untuk mengakses dompet Anda.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => setShowPinDialog(true)}
                startIcon={<UnlockedIcon />}
              >
                Buka Dompet
              </Button>
            </Box>
          )}
        </Container>
      </Box>
      
      <WalletPinVerification 
        open={showPinDialog} 
        onClose={() => setShowPinDialog(false)} 
      />
    </>
  );
};

export default WalletPageWrapper;