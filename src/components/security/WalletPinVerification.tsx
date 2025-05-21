import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Fingerprint as FingerprintIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { usePinTimeout } from '@/context/PinTimeoutContext';

interface WalletPinVerificationProps {
  open: boolean;
  onClose: () => void;
}

const WalletPinVerification: React.FC<WalletPinVerificationProps> = ({ open, onClose }) => {
  const {
    verifyPinValue,
    pinAttempts,
    isPinLocked,
    pinLockExpiry,
    hasPin,
    isPinVerified
  } = usePinTimeout();

  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [remainingLockTime, setRemainingLockTime] = useState<string | null>(null);

  // Max PIN attempts
  const MAX_PIN_ATTEMPTS = 5;

  // Calculate remaining lock time
  useEffect(() => {
    if (!isPinLocked || !pinLockExpiry) {
      setRemainingLockTime(null);
      return;
    }

    const updateRemainingTime = () => {
      const remainingMs = pinLockExpiry - Date.now();
      
      if (remainingMs <= 0) {
        setRemainingLockTime(null);
        return;
      }
      
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      
      setRemainingLockTime(`${minutes}m ${seconds}s`);
    };

    // Update immediately
    updateRemainingTime();
    
    // Then update every second
    const interval = setInterval(updateRemainingTime, 1000);
    
    return () => clearInterval(interval);
  }, [isPinLocked, pinLockExpiry]);

  // Handle PIN verification
  const handleVerify = async () => {
    if (!pin) {
      setError('Masukkan PIN');
      return;
    }

    if (isPinLocked) {
      setError(`PIN terkunci. Coba lagi dalam ${remainingLockTime}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await verifyPinValue(pin);
      
      if (success) {
        setPin('');
        onClose();
      } else {
        if (isPinLocked) {
          setError(`PIN terkunci. Coba lagi dalam ${remainingLockTime}`);
        } else {
          const remainingAttempts = MAX_PIN_ATTEMPTS - pinAttempts;
          setError(`PIN salah. ${remainingAttempts} kesempatan tersisa.`);
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setPin(value);
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  // Close dialog if already verified
  useEffect(() => {
    if (isPinVerified && open) {
      onClose();
    }
  }, [isPinVerified, open, onClose]);

  // Auto-focus the PIN input
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const pinInput = document.getElementById('wallet-pin-input');
        if (pinInput) {
          pinInput.focus();
        }
      }, 100);
    }
  }, [open]);

  // Don't show dialog if PIN is not set
  if (!hasPin) {
    return null;
  }

  return (
    <Dialog
      open={open && !isPinVerified}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center">
          <LockIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Verifikasi PIN Dompet</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {isPinLocked ? (
          <Alert 
            severity="error" 
            icon={<LockIcon />}
            sx={{ mb: 2, mt: 1 }}
          >
            <Typography variant="body2">
              PIN terkunci karena terlalu banyak percobaan gagal.
              <br />
              Coba lagi dalam {remainingLockTime}.
            </Typography>
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Masukkan PIN untuk membuka halaman dompet Anda.
            </Typography>
            
            <TextField
              id="wallet-pin-input"
              fullWidth
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={handlePinChange}
              onKeyDown={handleKeyDown}
              placeholder="Masukkan PIN"
              autoFocus
              disabled={loading || isPinLocked}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FingerprintIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPin(!showPin)}
                      edge="end"
                      disabled={loading || isPinLocked}
                    >
                      {showPin ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
                inputProps: { 
                  inputMode: 'numeric', 
                  pattern: '[0-9]*',
                  maxLength: 6
                }
              }}
            />
            
            {error && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
            {pinAttempts > 0 && !isPinLocked && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Percobaan gagal: {pinAttempts}/{MAX_PIN_ATTEMPTS}</span>
                  <span>{MAX_PIN_ATTEMPTS - pinAttempts} kesempatan tersisa</span>
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(pinAttempts / MAX_PIN_ATTEMPTS) * 100} 
                  color="warning"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button 
          onClick={handleVerify} 
          variant="contained" 
          disabled={loading || isPinLocked || !pin}
          startIcon={loading ? <CircularProgress size={16} /> : <LockOpenIcon />}
        >
          {loading ? 'Memverifikasi...' : 'Verifikasi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletPinVerification;