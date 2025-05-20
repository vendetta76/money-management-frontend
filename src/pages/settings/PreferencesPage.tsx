import React, { useState, useEffect } from 'react';
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
  Alert
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
const timeoutOptions = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
];

const PreferencesPage: React.FC = () => {
  // Logout timeout from existing context
  const { logoutTimeout, setLogoutTimeout, isLoading: logoutLoading } = useLogoutTimeout();
  const [pendingLogoutTimeout, setPendingLogoutTimeout] = useState<number>(0);
  
  // PIN timeout from new context
  const { pinTimeout, setPinTimeout, isLoading: pinLoading } = usePinTimeout();
  const [pendingPinTimeout, setPendingPinTimeout] = useState<number>(0);
  
  // Overall state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Update pending logout timeout when context value changes
  useEffect(() => {
    if (logoutTimeout !== undefined) {
      setPendingLogoutTimeout(logoutTimeout);
    }
  }, [logoutTimeout]);

  // Update pending PIN timeout when context value changes
  useEffect(() => {
    if (pinTimeout !== undefined) {
      setPendingPinTimeout(pinTimeout);
    }
  }, [pinTimeout]);

  // Handle timeout changes
  const handleLogoutTimeoutChange = (event: SelectChangeEvent<number>) => {
    setPendingLogoutTimeout(Number(event.target.value));
  };
  
  const handlePinTimeoutChange = (event: SelectChangeEvent<number>) => {
    setPendingPinTimeout(Number(event.target.value));
  };

  // Save all settings
  const handleSave = async () => {
    // Check if any values have changed
    const logoutChanged = pendingLogoutTimeout !== logoutTimeout;
    const pinChanged = pendingPinTimeout !== pinTimeout;
    
    if (!logoutChanged && !pinChanged) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Save logout timeout via context
      if (logoutChanged) {
        await setLogoutTimeout(pendingLogoutTimeout);
      }
      
      // Save PIN timeout via context
      if (pinChanged) {
        await setPinTimeout(pendingPinTimeout);
      }
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveError('Gagal menyimpan preferensi');
    } finally {
      setIsSaving(false);
    }
  };

  // Check if all values are saved
  const allSaved = pendingLogoutTimeout === logoutTimeout && pendingPinTimeout === pinTimeout;
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
                >
                  {timeoutOptions.map(option => (
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
                >
                  {timeoutOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Box>
        
        {saveError && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {saveError}
          </Alert>
        )}
        
        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={allSaved || isSaving}
            startIcon={isSaving ? 
              <CircularProgress size={20} color="inherit" /> : 
              (allSaved ? <CheckCircleIcon /> : <LockIcon />)
            }
          >
            {isSaving ? 'Menyimpan...' : allSaved ? 'TERSIMPAN' : 'SIMPAN'}
          </Button>
        </Box>
      </Container>
    </LayoutShell>
  );
};

export default PreferencesPage;