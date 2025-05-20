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
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast } from 'react-hot-toast';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayoutShell from '../../layouts/LayoutShell';

// Firebase imports
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

// Styled components
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
    gap: theme.spacing(2)
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
  const [logoutTimeout, setLogoutTimeout] = useState(0);
  const [originalTimeout, setOriginalTimeout] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from Firestore
  useEffect(() => {
    const loadPreferences = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const timeout = userData.preferences?.logoutTimeout || 0;
          
          setLogoutTimeout(timeout);
          setOriginalTimeout(timeout);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast.error("Gagal memuat preferensi");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [currentUser]);

  // Handle timeout change
  const handleTimeoutChange = (e: SelectChangeEvent<number>) => {
    setLogoutTimeout(Number(e.target.value));
  };

  // Save all preferences
  const savePreferences = async () => {
    if (!currentUser || logoutTimeout === originalTimeout) return;
    
    setIsSaving(true);
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userDocRef, {
        'preferences.logoutTimeout': logoutTimeout
      });
      
      setOriginalTimeout(logoutTimeout);
      toast.success("Preferensi berhasil disimpan");
      
      // Set up auto logout
      setupAutoLogout(logoutTimeout);
      
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Gagal menyimpan preferensi");
    } finally {
      setIsSaving(false);
    }
  };

  // Set up auto logout
  const setupAutoLogout = (timeout: number) => {
    if (window.logoutTimer) {
      clearTimeout(window.logoutTimer);
      window.logoutTimer = null;
    }
    
    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
      document.removeEventListener(event, window.resetLogoutTimer, true);
    });
    
    if (timeout > 0) {
      window.resetLogoutTimer = function() {
        if (window.logoutTimer) {
          clearTimeout(window.logoutTimer);
        }
        window.logoutTimer = setTimeout(() => {
          // Implement logout
          console.log("Auto logout triggered");
        }, timeout);
      };
      
      window.resetLogoutTimer();
      
      ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
        document.addEventListener(event, window.resetLogoutTimer, true);
      });
    }
  };

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
              <FormControl size="small" sx={{ minWidth: 120 }}>
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
            onClick={savePreferences}
            disabled={logoutTimeout === originalTimeout || isSaving}
            startIcon={isSaving ? 
              <CircularProgress size={20} color="inherit" /> : 
              (logoutTimeout === originalTimeout ? <CheckCircleIcon /> : null)
            }
          >
            {isSaving ? 'Menyimpan...' : logoutTimeout === originalTimeout ? 'TERSIMPAN' : 'SIMPAN'}
          </Button>
        </Box>
      </Container>
    </LayoutShell>
  );
};

// Type declarations
declare global {
  interface Window {
    logoutTimer: ReturnType<typeof setTimeout> | null;
    resetLogoutTimer: () => void;
  }
}

export default PreferencesPage;