import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Container
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast } from 'react-hot-toast';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayoutShell from '../../layouts/LayoutShell';

// Firebase imports
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const logoutOptions = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
];

// Preferences state interface
interface PreferencesState {
  logoutTimeout: number;
  // Add more preferences here as needed
}

// Context type definition
interface PreferencesContextType {
  preferences: PreferencesState;
  updatePreference: (key: keyof PreferencesState, value: any) => void;
  saveAllPreferences: () => Promise<void>;
  isSaving: boolean;
  isLoading: boolean;
  hasChanges: boolean;
  saveSuccess: boolean;
}

// Create context
const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Provider component
const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Default preferences
  const defaultPreferences: PreferencesState = {
    logoutTimeout: 0,
  };
  
  // State
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences);
  const [originalPreferences, setOriginalPreferences] = useState<PreferencesState>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Check for changes
  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);

  // Load preferences from Firestore
  useEffect(() => {
    const loadPreferences = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Get user document from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userPrefs = userData.preferences || defaultPreferences;
          
          setPreferences(userPrefs);
          setOriginalPreferences(userPrefs);
        } else {
          // Create default preferences if user doc doesn't exist
          console.log("User document not found, using defaults");
          setPreferences(defaultPreferences);
          setOriginalPreferences(defaultPreferences);
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
  
  // Clear success message after delay
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);
  
  // Update single preference
  const updatePreference = (key: keyof PreferencesState, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Save all preferences to Firestore
  const saveAllPreferences = async () => {
    if (!currentUser || !hasChanges) return;
    
    setIsSaving(true);
    
    try {
      // Reference to user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Update preferences in Firestore
      await updateDoc(userDocRef, {
        preferences: preferences
      });
      
      // Update local state
      setOriginalPreferences({...preferences});
      setSaveSuccess(true);
      toast.success("Preferensi berhasil disimpan");
      
      // Setup auto logout if enabled
      setupAutoLogout(preferences.logoutTimeout);
      
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Gagal menyimpan preferensi");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Helper to set up auto logout
  const setupAutoLogout = (timeout: number) => {
    if (window.logoutTimer) {
      clearTimeout(window.logoutTimer);
      window.logoutTimer = null;
    }
    
    // Remove existing listeners
    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
      document.removeEventListener(event, window.resetLogoutTimer, true);
    });
    
    // Only set up new timer if timeout is positive
    if (timeout > 0) {
      window.resetLogoutTimer = function() {
        if (window.logoutTimer) {
          clearTimeout(window.logoutTimer);
        }
        window.logoutTimer = setTimeout(() => {
          // Call your logout function here
          // For example: auth.signOut();
          console.log("Auto logout triggered after inactivity");
        }, timeout);
      };
      
      // Initial setup
      window.resetLogoutTimer();
      
      // Add event listeners
      ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(event => {
        document.addEventListener(event, window.resetLogoutTimer, true);
      });
    }
  };
  
  // Context value
  const contextValue: PreferencesContextType = {
    preferences,
    updatePreference,
    saveAllPreferences,
    isSaving,
    isLoading,
    hasChanges,
    saveSuccess
  };
  
  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Custom hook
const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

// Logout Setting Component
const LogoutSetting: React.FC = () => {
  const { preferences, updatePreference, isLoading } = usePreferences();
  
  const handleChange = (e: SelectChangeEvent<number>) => {
    updatePreference('logoutTimeout', Number(e.target.value));
  };
  
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '2px solid #e0e0e0',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        mb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 500,
            fontSize: '1.1rem',
            textTransform: 'uppercase',
          }}
        >
          Logout Otomatis
        </Typography>
        <Tooltip 
          title="Fitur ini akan melakukan logout otomatis ketika tidak ada aktivitas (mouse, keyboard, touch) selama periode waktu tertentu. Fitur ini akan tetap berfungsi bahkan saat Anda beralih ke tab lain."
          placement="top"
        >
          <IconButton size="small" sx={{ ml: 0.5 }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl 
          variant="outlined" 
          size="small"
          sx={{ width: 180 }}
        >
          <InputLabel id="logout-select-label" sx={{ fontSize: '0.9rem' }}>
            Durasi Logout
          </InputLabel>
          <Select
            labelId="logout-select-label"
            value={preferences.logoutTimeout}
            label="Durasi Logout"
            onChange={handleChange}
            disabled={isLoading}
          >
            {logoutOptions.map(({ label, value }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

// Global Save Button
const GlobalSaveButton: React.FC = () => {
  const { saveAllPreferences, isSaving, hasChanges, saveSuccess } = usePreferences();
  
  return (
    <Paper 
      elevation={3}
      sx={{
        position: 'sticky',
        bottom: 20,
        left: 0,
        right: 0,
        p: 2,
        display: 'flex',
        justifyContent: 'flex-end',
        borderRadius: 2,
        zIndex: 10,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Button
        variant="contained"
        onClick={saveAllPreferences}
        disabled={!hasChanges || isSaving}
        size="large"
        sx={{
          textTransform: 'uppercase',
          minWidth: 120,
          px: 3,
          py: 1
        }}
        startIcon={isSaving ? 
          <CircularProgress size={20} color="inherit" /> : 
          (saveSuccess ? <CheckCircleIcon /> : <SaveIcon />)
        }
      >
        {isSaving ? 'Menyimpan...' : saveSuccess ? 'TERSIMPAN' : 'SIMPAN'}
      </Button>
    </Paper>
  );
};

// Main Preferences Page
const PreferencesPage: React.FC = () => {
  return (
    <PreferencesProvider>
      <LayoutShell>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 500, 
              mb: 2 
            }}
          >
            Preferensi
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              mb: 4,
            }}
          >
            Kelola pengaturan aplikasi Anda untuk pengalaman yang lebih personal
          </Typography>
          
          <Divider sx={{ mb: 4 }} />
          
          <Box sx={{ mb: 4 }}>
            <LogoutSetting />
            {/* Add more settings here as needed */}
          </Box>
          
          <GlobalSaveButton />
        </Container>
      </LayoutShell>
    </PreferencesProvider>
  );
};

// TypeScript type declarations
declare global {
  interface Window {
    logoutTimer: ReturnType<typeof setTimeout> | null;
    resetLogoutTimer: () => void;
  }
}

export default PreferencesPage;