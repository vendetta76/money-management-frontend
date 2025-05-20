import React from 'react';
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
import { SelectChangeEvent } from '@mui/material/Select';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LayoutShell from '../../layouts/LayoutShell';

// Import your existing context
import { useLogoutTimeout } from '../../context/LogoutTimeoutContext';

// Logout options
const logoutOptions = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
];

const PreferencesPage: React.FC = () => {
  // Use your existing context
  const { logoutTimeout, setLogoutTimeout, isLoading } = useLogoutTimeout();
  const [pendingTimeout, setPendingTimeout] = React.useState<number>(0);

  // Update pending timeout when context value changes
  React.useEffect(() => {
    if (logoutTimeout !== undefined) {
      setPendingTimeout(logoutTimeout);
    }
  }, [logoutTimeout]);

  // Handle timeout change
  const handleTimeoutChange = (event: SelectChangeEvent<number>) => {
    setPendingTimeout(Number(event.target.value));
  };

  // Save timeout
  const handleSave = async () => {
    if (pendingTimeout === logoutTimeout) return;
    
    try {
      await setLogoutTimeout(pendingTimeout);
    } catch (error) {
      console.error('Error saving logout timeout:', error);
    }
  };

  // Check if value is applied/saved
  const isSaved = pendingTimeout === logoutTimeout;

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
                  value={pendingTimeout}
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
            </Box>
          </Paper>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaved || isLoading}
            startIcon={isLoading ? 
              <CircularProgress size={20} color="inherit" /> : 
              (isSaved ? <CheckCircleIcon /> : null)
            }
          >
            {isLoading ? 'Menyimpan...' : isSaved ? 'TERSIMPAN' : 'SIMPAN'}
          </Button>
        </Box>
      </Container>
    </LayoutShell>
  );
};

export default PreferencesPage;