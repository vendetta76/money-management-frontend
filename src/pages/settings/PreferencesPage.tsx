import React, { useState, useEffect } from 'react';
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
  Grid,
  IconButton,
  Tooltip,
  Divider,
  Container
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { toast } from 'react-hot-toast';
import { useLogoutTimeout } from '../../context/LogoutTimeoutContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayoutShell from '../../layouts/LayoutShell';

const logoutOptions = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
];

// Interface for LogoutSetting props
interface LogoutSettingProps {
  value: number;
  onChange: (value: number) => void;
  isDisabled?: boolean;
}

// Simple component for the logout setting
const LogoutSetting: React.FC<LogoutSettingProps> = ({ value, onChange, isDisabled }) => {
  const handleChange = (e: SelectChangeEvent<number>) => {
    onChange(Number(e.target.value));
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
            value={value}
            label="Durasi Logout"
            onChange={handleChange}
            disabled={isDisabled}
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

// Add more setting components as needed
// Example:
/*
interface OtherSettingProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

const OtherSetting: React.FC<OtherSettingProps> = ({ value, onChange, isDisabled }) => {
  // Implementation
};
*/

// Main preferences page with global state management
const PreferencesPage: React.FC = () => {
  const { logoutTimeout, setLogoutTimeout, isLoading } = useLogoutTimeout();
  
  // Global state for all settings
  const [settings, setSettings] = useState({
    logoutTimeout: logoutTimeout || 0,
    // Add more settings here as you implement new features
    // example: theme: 'light',
    // example: notifications: true,
  });
  
  // Track if settings have changed from saved values
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update settings when initial values load
  useEffect(() => {
    if (logoutTimeout !== undefined) {
      setSettings(prev => ({
        ...prev,
        logoutTimeout
      }));
    }
  }, [logoutTimeout]);

  // Update hasChanges when settings change
  useEffect(() => {
    if (logoutTimeout !== undefined) {
      setHasChanges(settings.logoutTimeout !== logoutTimeout);
    }
  }, [settings, logoutTimeout]);

  // Reset success message after delay
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Handle setting changes
  const handleLogoutTimeoutChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      logoutTimeout: value
    }));
  };

  // Handle save all settings
  const handleSaveAll = async () => {
    setIsSaving(true);
    
    try {
      // Save logout timeout
      await setLogoutTimeout(settings.logoutTimeout);
      
      // Save other settings as you add them
      // await setOtherSetting(settings.otherSetting);
      
      toast.success('Semua preferensi berhasil disimpan');
      setSaveSuccess(true);
      setHasChanges(false);
    } catch (error) {
      console.error("Error menyimpan preferensi:", error);
      toast.error('Gagal menyimpan preferensi');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && logoutTimeout === undefined) {
    return (
      <LayoutShell>
        <Container maxWidth="md">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '50vh' 
          }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" mt={3} color="text.secondary">
              Memuat preferensi...
            </Typography>
          </Box>
        </Container>
      </LayoutShell>
    );
  }

  return (
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
          {/* Logout setting */}
          <LogoutSetting 
            value={settings.logoutTimeout} 
            onChange={handleLogoutTimeoutChange}
            isDisabled={isSaving}
          />
          
          {/* Add more settings here as you implement them */}
          {/* <OtherSetting value={settings.otherValue} onChange={handleOtherChange} isDisabled={isSaving} /> */}
        </Box>
        
        {/* Fixed action bar at the bottom */}
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
            onClick={handleSaveAll}
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
      </Container>
    </LayoutShell>
  );
};

export default PreferencesPage;