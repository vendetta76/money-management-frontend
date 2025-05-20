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
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast } from 'react-hot-toast';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayoutShell from '../../layouts/LayoutShell';

// Firebase imports with correct path
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseClient';
import { useAuth } from '../../context/AuthContext';

// Styled components for the setting row
const SettingRow = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  border: '1px solid #e0e0e0',
  boxShadow: 'none',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5)
  }
}));

const SettingLabel = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1)
  }
}));

const SettingControl = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    '& .MuiFormControl-root': {
      width: '100%'
    }
  }
}));

// Logout options
const logoutOptions = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
];

const PreferencesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [logoutTimeout, setLogoutTimeout] = useState<number>(0);
  const [initialTimeout, setInitialTimeout] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user preferences once on component mount
  useEffect(() => {
    async function fetchUserPreferences() {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get user document
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Check if preferences object exists and has logoutTimeout
          if (userData.preferences && typeof userData.preferences.logoutTimeout === 'number') {
            setLogoutTimeout(userData.preferences.logoutTimeout);
            setInitialTimeout(userData.preferences.logoutTimeout);
          } else {
            // No preferences found, using default
            setLogoutTimeout(0);
            setInitialTimeout(0);
          }
        } else {
          // Document doesn't exist, using default
          setLogoutTimeout(0);
          setInitialTimeout(0);
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Tidak dapat memuat preferensi. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserPreferences();
  }, [currentUser]);

  // Handle timeout selection change
  const handleTimeoutChange = (event: SelectChangeEvent<number>) => {
    setLogoutTimeout(Number(event.target.value));
  };

  // Save preferences
  const handleSave = async () => {
    if (!currentUser) return;
    
    // Skip if no changes
    if (logoutTimeout === initialTimeout) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Check if document exists first
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        // Document exists, update it
        await updateDoc(userRef, {
          'preferences.logoutTimeout': logoutTimeout
        });
      } else {
        // Document doesn't exist, create it
        await setDoc(userRef, {
          preferences: {
            logoutTimeout: logoutTimeout
          }
        });
      }
      
      // Update initial value to reflect saved state
      setInitialTimeout(logoutTimeout);
      toast.success('Preferensi berhasil disimpan');
      
      // Set up auto logout
      setupAutoLogout(logoutTimeout);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Gagal menyimpan preferensi. Silakan coba lagi nanti.');
      toast.error('Gagal menyimpan preferensi');
    } finally {
      setIsSaving(false);
    }
  };

  // Setup auto logout functionality
  const setupAutoLogout = (timeout: number) => {
    // Clear any existing timer
    if (window.logoutTimer) {
      clearTimeout(window.logoutTimer);
      window.logoutTimer = null;
    }
    
    // Remove existing event listeners
    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
      document.removeEventListener(event, window.resetLogoutTimer, true);
    });
    
    // Only set up timer if timeout is greater than 0
    if (timeout > 0) {
      window.resetLogoutTimer = function() {
        if (window.logoutTimer) {
          clearTimeout(window.logoutTimer);
        }
        window.logoutTimer = setTimeout(() => {
          // Here you would call your logout function
          console.log("Auto logout triggered");
        }, timeout);
      };
      
      // Start the timer
      window.resetLogoutTimer();
      
      // Add event listeners to reset timer on user activity
      ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
        document.addEventListener(event, window.resetLogoutTimer, true);
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <LayoutShell>
        <Container maxWidth="md" sx={{ py: 5, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </LayoutShell>
    );
  }

  // Show message if not logged in
  if (!currentUser) {
    return (
      <LayoutShell>
        <Container maxWidth="md" sx={{ py: 5 }}>
          <Alert severity="warning">
            Anda perlu login untuk mengakses halaman ini.
          </Alert>
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
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box>
          <SettingRow>
            <SettingLabel>
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
            </SettingLabel>
            
            <SettingControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={logoutTimeout}
                  onChange={handleTimeoutChange}
                  displayEmpty
                >
                  {logoutOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </SettingControl>
          </SettingRow>
          
          {/* You can add more settings here following the same pattern */}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={logoutTimeout === initialTimeout || isSaving}
            startIcon={isSaving ? 
              <CircularProgress size={20} color="inherit" /> : 
              (logoutTimeout === initialTimeout && initialTimeout !== 0 ? <CheckCircleIcon /> : null)
            }
          >
            {isSaving ? 'Menyimpan...' : logoutTimeout === initialTimeout && initialTimeout !== 0 ? 'TERSIMPAN' : 'SIMPAN'}
          </Button>
        </Box>
      </Container>
    </LayoutShell>
  );
};

// Type declarations for window object
declare global {
  interface Window {
    logoutTimer: ReturnType<typeof setTimeout> | null;
    resetLogoutTimer: () => void;
  }
}

export default PreferencesPage;