import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Container,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LayoutShell from '../../layouts/LayoutShell';

// Import contexts
import { useLogoutTimeout } from '../../context/LogoutTimeoutContext';
import { usePinTimeout } from '../../context/PinTimeoutContext';

// Timeout options - shared for both settings
const TIMEOUT_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
] as const;

interface SaveResult {
  logoutSuccess?: boolean;
  pinSuccess?: boolean;
  logoutError?: string;
  pinError?: string;
}

const PreferencesPage: React.FC = () => {
  // Logout timeout from existing context
  const { logoutTimeout, setLogoutTimeout, isLoading: logoutLoading } = useLogoutTimeout();
  const [pendingLogoutTimeout, setPendingLogoutTimeout] = useState<number>(0);
  
  // PIN timeout from new context
  const { pinTimeout, setPinTimeout, isLoading: pinLoading } = usePinTimeout();
  const [pendingPinTimeout, setPendingPinTimeout] = useState<number>(0);
  
  // Overall state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
  
  // FIXED: Better refs for preventing race conditions and memory leaks
  const saveInProgressRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const lastSavePromiseRef = useRef<Promise<void> | null>(null);

  // FIXED: Better state synchronization with context
  useEffect(() => {
    // Only update pending values if:
    // 1. Not currently saving
    // 2. Component is mounted
    // 3. No user changes pending (not in the middle of editing)
    if (logoutTimeout !== undefined && 
        !saveInProgressRef.current && 
        isMountedRef.current) {
      setPendingLogoutTimeout(logoutTimeout);
    }
  }, [logoutTimeout]);

  useEffect(() => {
    if (pinTimeout !== undefined && 
        !saveInProgressRef.current && 
        isMountedRef.current) {
      setPendingPinTimeout(pinTimeout);
    }
  }, [pinTimeout]);

  // FIXED: Component mounted tracking for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Clean up any pending timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle timeout changes with validation
  const handleLogoutTimeoutChange = useCallback((event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    if (TIMEOUT_OPTIONS.some(option => option.value === value)) {
      setPendingLogoutTimeout(value);
      setSaveResult(null); // Clear previous save results
    }
  }, []);
  
  const handlePinTimeoutChange = useCallback((event: SelectChangeEvent<number>) => {
    const value = Number(event.target.value);
    if (TIMEOUT_OPTIONS.some(option => option.value === value)) {
      setPendingPinTimeout(value);
      setSaveResult(null); // Clear previous save results
    }
  }, []);

  // FIXED: Improved save function with proper error handling and cleanup
  const handleSave = useCallback(async () => {
    // Prevent concurrent saves
    if (saveInProgressRef.current || isSaving || !isMountedRef.current) return;
    
    // Check if any values have changed
    const logoutChanged = pendingLogoutTimeout !== logoutTimeout;
    const pinChanged = pendingPinTimeout !== pinTimeout;
    
    if (!logoutChanged && !pinChanged) return;
    
    // Set saving state
    saveInProgressRef.current = true;
    setIsSaving(true);
    setSaveResult(null);
    
    const result: SaveResult = {};
    
    try {
      // Create a promise for this save operation
      const savePromise = (async () => {
        // Save logout timeout if changed
        if (logoutChanged && isMountedRef.current) {
          try {
            await setLogoutTimeout(pendingLogoutTimeout);
            if (isMountedRef.current) {
              result.logoutSuccess = true;
            }
          } catch (error: any) {
            console.error('Error saving logout timeout:', error);
            if (isMountedRef.current) {
              result.logoutSuccess = false;
              result.logoutError = error?.message || 'Gagal menyimpan pengaturan logout otomatis';
            }
          }
        }
        
        // Save PIN timeout if changed (independent of logout timeout result)
        if (pinChanged && isMountedRef.current) {
          try {
            await setPinTimeout(pendingPinTimeout);
            if (isMountedRef.current) {
              result.pinSuccess = true;
            }
          } catch (error: any) {
            console.error('Error saving PIN timeout:', error);
            if (isMountedRef.current) {
              result.pinSuccess = false;
              result.pinError = error?.message || 'Gagal menyimpan pengaturan PIN dompet';
            }
          }
        }
      })();
      
      // Store the current save promise
      lastSavePromiseRef.current = savePromise;
      
      // Wait for save operations to complete
      await savePromise;
      
      // Only update UI if this is still the latest save and component is mounted
      if (lastSavePromiseRef.current === savePromise && isMountedRef.current) {
        // Set results and show success message if any operation succeeded
        setSaveResult(result);
        
        const hasSuccess = (logoutChanged && result.logoutSuccess) || 
                          (pinChanged && result.pinSuccess);
        
        if (hasSuccess) {
          setShowSuccessMessage(true);
        }
      }
      
    } catch (error) {
      console.error('Unexpected error during save:', error);
      if (isMountedRef.current) {
        setSaveResult({
          logoutSuccess: false,
          pinSuccess: false,
          logoutError: 'Terjadi kesalahan yang tidak terduga',
          pinError: 'Terjadi kesalahan yang tidak terduga'
        });
      }
    } finally {
      // FIXED: Always reset save state, even on errors
      if (isMountedRef.current) {
        setIsSaving(false);
      }
      saveInProgressRef.current = false;
      
      // Clear save result after 5 seconds
      if (isMountedRef.current) {
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveResult(null);
          }
        }, 5000);
      }
    }
  }, [
    pendingLogoutTimeout, 
    logoutTimeout, 
    pendingPinTimeout, 
    pinTimeout, 
    setLogoutTimeout, 
    setPinTimeout, 
    isSaving
  ]);

  // FIXED: Improved debounced save with proper cleanup
  const debouncedSave = useCallback(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    
    // Only schedule if component is mounted
    if (isMountedRef.current) {
      saveTimeoutRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          handleSave();
          saveTimeoutRef.current = null;
        }
      }, 300);
    }
  }, [handleSave]);

  // Check if all values are saved (with more robust comparison)
  const getUnsavedChanges = useCallback(() => {
    const changes = [];
    if (pendingLogoutTimeout !== logoutTimeout) {
      changes.push('Logout otomatis');
    }
    if (pendingPinTimeout !== pinTimeout) {
      changes.push('PIN dompet');
    }
    return changes;
  }, [pendingLogoutTimeout, logoutTimeout, pendingPinTimeout, pinTimeout]);

  const unsavedChanges = getUnsavedChanges();
  const allSaved = unsavedChanges.length === 0;
  const isLoading = logoutLoading || pinLoading;

  if (isLoading) {
    return (
      <LayoutShell>
        <Container maxWidth="md" sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Preferensi
        </Typography>
        
        <Box>
          {/* Logout Timer Setting */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 4,
              border: '2px solid #e0e0e0',
              mb: 2,
              '@media (max-width: 600px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 500, textTransform: 'uppercase' }}>
                Logout Otomatis
              </Typography>
              <Tooltip 
                title="Fitur ini akan melakukan logout otomatis ketika tidak ada aktivitas (mouse, keyboard, touch) selama periode waktu tertentu. Fitur ini akan tetap berfungsi bahkan saat Anda beralih ke tab lain."
              >
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {saveResult?.logoutSuccess === true && (
                <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} fontSize="small" />
              )}
            </Box>
            
            <Box sx={{ 
              '@media (max-width: 600px)': { 
                width: '100%' 
              } 
            }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 180,
                  '@media (max-width: 600px)': { 
                    width: '100%' 
                  }
                }}
              >
                <Select
                  value={pendingLogoutTimeout}
                  onChange={handleLogoutTimeoutChange}
                  displayEmpty
                  disabled={isSaving}
                >
                  {TIMEOUT_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
          
          {/* PIN Lock Timer Setting */}
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 4,
              border: '2px solid #e0e0e0',
              mb: 2,
              '@media (max-width: 600px)': {
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 500, textTransform: 'uppercase' }}>
                PIN Dompet
              </Typography>
              <Tooltip 
                title="Fitur ini akan mengunci akses ke halaman dompet Anda setelah periode waktu tertentu. Anda akan diminta untuk memasukkan PIN kembali. Anda juga dapat mengunci dompet secara manual."
              >
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {saveResult?.pinSuccess === true && (
                <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} fontSize="small" />
              )}
            </Box>
            
            <Box sx={{ 
              '@media (max-width: 600px)': { 
                width: '100%' 
              } 
            }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 180,
                  '@media (max-width: 600px)': { 
                    width: '100%' 
                  }
                }}
              >
                <Select
                  value={pendingPinTimeout}
                  onChange={handlePinTimeoutChange}
                  displayEmpty
                  disabled={isSaving}
                >
                  {TIMEOUT_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Box>
        
        {/* Error Messages */}
        {saveResult?.logoutError && (
          <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
            <strong>Logout Otomatis:</strong> {saveResult.logoutError}
          </Alert>
        )}
        
        {saveResult?.pinError && (
          <Alert severity="error" sx={{ mt: 1, mb: 1 }}>
            <strong>PIN Dompet:</strong> {saveResult.pinError}
          </Alert>
        )}
        
        {/* Unsaved changes warning */}
        {unsavedChanges.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Perubahan belum disimpan: {unsavedChanges.join(', ')}
          </Alert>
        )}
        
        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            onClick={debouncedSave}
            disabled={allSaved || isSaving}
            startIcon={isSaving ? 
              <CircularProgress size={20} color="inherit" /> : 
              (allSaved ? <CheckCircleIcon /> : <LockIcon />)
            }
          >
            {isSaving ? 'Menyimpan...' : allSaved ? 'TERSIMPAN' : `SIMPAN (${unsavedChanges.length})`}
          </Button>
        </Box>
        
        {/* Success Snackbar */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={3000}
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowSuccessMessage(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Preferensi berhasil disimpan!
          </Alert>
        </Snackbar>
      </Container>
    </LayoutShell>
  );
};

export default PreferencesPage;