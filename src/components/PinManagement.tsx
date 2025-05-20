import React, { useState } from 'react';
import { usePinTimeout } from '../context/PinTimeoutContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Chip,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  Fingerprint,
  Key,
  Delete,
  Visibility,
  VisibilityOff,
  Info,
  Warning,
  CheckCircle,
  LockClock
} from '@mui/icons-material';

enum PinAction {
  NONE,
  CREATE,
  CHANGE,
  DELETE,
  VERIFY
}

const PinManagement: React.FC = () => {
  const {
    hasPin,
    createPin,
    changePin,
    deletePin,
    verifyPinValue,
    pinAttempts,
    isPinLocked,
    pinLockExpiry,
    resetPinAttempts
  } = usePinTimeout();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [action, setAction] = useState<PinAction>(PinAction.NONE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Password visibility toggles
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Calculate remaining lock time
  const getRemainingLockTime = () => {
    if (!pinLockExpiry) return null;
    
    const remainingMs = pinLockExpiry - Date.now();
    if (remainingMs <= 0) return null;
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setter(value);
      setError(null);
    }
  };

  const validatePin = (pin: string): boolean => {
    if (pin.length < 4) {
      setError('PIN harus minimal 4 digit');
      return false;
    }
    return true;
  };

  const handleCreatePin = async () => {
    if (!validatePin(newPin)) return;
    
    if (newPin !== confirmPin) {
      setError('PIN dan konfirmasi tidak cocok');
      return;
    }
    
    setLoading(true);
    const result = await createPin(newPin);
    setLoading(false);
    
    if (result) {
      setSuccess('PIN berhasil dibuat');
      setNewPin('');
      setConfirmPin('');
      setAction(PinAction.NONE);
    } else {
      setError('Gagal membuat PIN');
    }
  };

  const handleChangePin = async () => {
    if (!validatePin(currentPin) || !validatePin(newPin)) return;
    
    if (newPin !== confirmPin) {
      setError('PIN baru dan konfirmasi tidak cocok');
      return;
    }
    
    setLoading(true);
    const result = await changePin(currentPin, newPin);
    setLoading(false);
    
    if (result) {
      setSuccess('PIN berhasil diubah');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setAction(PinAction.NONE);
    } else {
      setError('PIN lama tidak valid atau terjadi kesalahan');
    }
  };

  const handleDeletePin = async () => {
    if (!validatePin(currentPin)) return;
    
    setLoading(true);
    const result = await deletePin(currentPin);
    setLoading(false);
    
    if (result) {
      setSuccess('PIN berhasil dihapus');
      setCurrentPin('');
      setAction(PinAction.NONE);
    } else {
      setError('PIN tidak valid atau terjadi kesalahan');
    }
  };

  const handleVerifyPin = async () => {
    if (!validatePin(currentPin)) return;
    
    setLoading(true);
    const result = await verifyPinValue(currentPin);
    setLoading(false);
    
    if (result) {
      setSuccess('PIN valid');
      setCurrentPin('');
      setAction(PinAction.NONE);
    } else {
      if (isPinLocked) {
        setError(`PIN terkunci. Coba lagi dalam ${getRemainingLockTime()}`);
      } else {
        setError(`PIN tidak valid. ${MAX_PIN_ATTEMPTS - pinAttempts} kesempatan tersisa.`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setSuccess(null);
    
    if (isPinLocked) {
      setError(`PIN terkunci. Coba lagi dalam ${getRemainingLockTime()}`);
      return;
    }
    
    switch (action) {
      case PinAction.CREATE:
        await handleCreatePin();
        break;
      case PinAction.CHANGE:
        await handleChangePin();
        break;
      case PinAction.DELETE:
        await handleDeletePin();
        break;
      case PinAction.VERIFY:
        await handleVerifyPin();
        break;
    }
  };
  
  const resetForm = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setError(null);
    setSuccess(null);
    setAction(PinAction.NONE);
  };

  // Constants
  const MAX_PIN_ATTEMPTS = 5;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Fingerprint sx={{ mr: 1, color: 'primary.main' }} />
        PIN Dompet
      </Typography>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          variant="outlined"
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          variant="outlined"
          icon={<CheckCircle />}
        >
          {success}
        </Alert>
      )}
      
      {action === PinAction.NONE ? (
        <Box>
          <Alert 
            severity="info" 
            variant="outlined" 
            sx={{ mb: 3 }}
          >
            <Typography variant="body2">
              {hasPin ? (
                'PIN ini digunakan untuk mengunci dan melindungi halaman dompet Anda. Anda perlu memasukkan PIN ini setiap kali membuka halaman dompet atau ketika waktu PIN habis.'
              ) : (
                'Buat PIN untuk melindungi halaman dompet Anda. PIN akan diminta saat Anda membuka halaman dompet atau setelah periode tidak aktif.'
              )}
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            {!hasPin && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAction(PinAction.CREATE)}
                startIcon={<Key />}
              >
                Buat PIN
              </Button>
            )}
            
            {hasPin && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setAction(PinAction.CHANGE)}
                  startIcon={<Key />}
                >
                  Ubah PIN
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setAction(PinAction.DELETE)}
                  startIcon={<Delete />}
                >
                  Hapus PIN
                </Button>
              </>
            )}
          </Box>
          
          {pinAttempts > 0 && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 2,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'warning.light',
                color: 'warning.dark'
              }}
            >
              {isPinLocked ? (
                <>
                  <LockClock sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    PIN terkunci. Coba lagi dalam {getRemainingLockTime()}
                  </Typography>
                </>
              ) : (
                <>
                  <Warning sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Percobaan gagal: {pinAttempts} dari {MAX_PIN_ATTEMPTS}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {(action === PinAction.CHANGE || action === PinAction.DELETE || action === PinAction.VERIFY) && (
            <TextField
              fullWidth
              type={showCurrentPin ? "text" : "password"}
              label={action === PinAction.VERIFY ? "PIN" : "PIN Saat Ini"}
              value={currentPin}
              onChange={(e) => handlePinChange(e, setCurrentPin)}
              margin="normal"
              variant="outlined"
              autoFocus
              inputProps={{ 
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: 6
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      edge="end"
                    >
                      {showCurrentPin ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
          
          {(action === PinAction.CREATE || action === PinAction.CHANGE) && (
            <>
              <TextField
                fullWidth
                type={showNewPin ? "text" : "password"}
                label="PIN Baru"
                value={newPin}
                onChange={(e) => handlePinChange(e, setNewPin)}
                margin="normal"
                variant="outlined"
                inputProps={{ 
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 6
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPin(!showNewPin)}
                        edge="end"
                      >
                        {showNewPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormHelperText sx={{ ml: 1, mb: 2 }}>
                PIN harus terdiri dari 4-6 digit angka
              </FormHelperText>
              
              <TextField
                fullWidth
                type={showConfirmPin ? "text" : "password"}
                label="Konfirmasi PIN"
                value={confirmPin}
                onChange={(e) => handlePinChange(e, setConfirmPin)}
                margin="normal"
                variant="outlined"
                inputProps={{ 
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 6
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        edge="end"
                      >
                        {showConfirmPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
          
          {action === PinAction.DELETE && (
            <Alert severity="warning" sx={{ mt: 2 }} variant="outlined">
              <Typography variant="body2">
                Perhatian: Menghapus PIN akan menghilangkan pengaman pada halaman dompet Anda.
              </Typography>
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={resetForm}
              disabled={loading}
            >
              Batal
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color={action === PinAction.DELETE ? "error" : "primary"}
              disabled={loading || isPinLocked}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Memproses..." : (
                action === PinAction.CREATE ? "Buat PIN" :
                action === PinAction.CHANGE ? "Ubah PIN" :
                action === PinAction.DELETE ? "Hapus PIN" :
                "Verifikasi"
              )}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PinManagement;