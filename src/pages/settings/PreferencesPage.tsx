import React from 'react';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Tooltip,
  IconButton,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { SelectChangeEvent } from '@mui/material/Select';
import { useLogoutTimeout } from '../../context/LogoutTimeoutContext';
import LayoutShell from '../../layouts/LayoutShell';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const logoutOptions = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
];

const PreferencesPage: React.FC = () => {
  const { logoutTimeout, setLogoutTimeout, isLoading } = useLogoutTimeout();
  const [pendingLogoutTimeout, setPendingLogoutTimeout] = React.useState<number>(logoutTimeout);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<boolean>(false);
  const [firebaseStatus, setFirebaseStatus] = React.useState<string>('');

  // Update pendingLogoutTimeout when logoutTimeout changes
  React.useEffect(() => {
    console.log("Timeout value from Firestore:", logoutTimeout);
    setPendingLogoutTimeout(logoutTimeout);
  }, [logoutTimeout]);

  // Effect to hide success message after 3 seconds
  React.useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const applied = pendingLogoutTimeout === logoutTimeout;

  const handleApply = async () => {
    if (isNaN(pendingLogoutTimeout)) {
      toast.error('Waktu logout tidak valid');
      return;
    }
    
    try {
      setFirebaseStatus('saving');
      console.log("Menyimpan pengaturan ke Firebase:", pendingLogoutTimeout);
      
      await setLogoutTimeout(pendingLogoutTimeout);
      
      console.log("Berhasil menyimpan pengaturan ke Firebase");
      toast.success('Preferensi berhasil disimpan');
      setSaveSuccess(true);
      setFirebaseStatus('success');
      
      // For debugging - log to console
      console.log("Current auto logout settings:");
      console.log("- Value in state:", pendingLogoutTimeout);
      console.log("- Value in context:", logoutTimeout);
      console.log("- localStorage value:", localStorage.getItem('logoutTimeout'));
    } catch (error) {
      console.error("Error menyimpan ke Firebase:", error);
      toast.error('Gagal menyimpan preferensi');
      setSaveError(true);
      setFirebaseStatus('error');
    }
  };

  const handleChange = (e: SelectChangeEvent<number>) => {
    setPendingLogoutTimeout(Number(e.target.value));
    setSaveSuccess(false);
    setSaveError(false);
  };

  const renderContent = () => {
    if (isLoading && logoutTimeout === undefined) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh' 
        }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" mt={3} color="text.secondary" className="dark:text-gray-300">
            Memuat preferensi...
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box mb={4}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="primary" 
            sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
            className="dark:text-purple-300"
          >
            <AccessTimeIcon fontSize="large" sx={{ mr: 1.5 }} />
            Preferensi
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            className="dark:text-gray-300"
          >
            Kelola pengaturan aplikasi Anda untuk pengalaman yang lebih personal
          </Typography>
          <Divider sx={{ mt: 2, mb: 4 }} className="dark:border-gray-700" />
        </Box>

        <Card 
          elevation={3} 
          sx={{ 
            borderRadius: 2,
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)'
            },
            mb: 4
          }}
          className="dark:bg-gray-800 dark:border dark:border-gray-700"
        >
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -20, 
              left: 20, 
              bgcolor: 'secondary.main',
              color: 'white',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 3
            }}
            className="bg-purple-600 dark:bg-purple-500"
          >
            <SecurityIcon />
          </Box>

          <CardContent sx={{ pt: 4, pb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography 
                variant="h5" 
                fontWeight="bold"
                sx={{ mr: 1 }}
                className="dark:text-white"
              >
                Logout Otomatis
              </Typography>
              <Tooltip title="Fitur ini akan secara otomatis logout pengguna setelah tidak aktif selama waktu yang ditentukan, membantu meningkatkan keamanan akun Anda.">
                <IconButton size="small" className="dark:text-gray-300">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {saveSuccess && (
              <Alert 
                icon={<CheckCircleIcon fontSize="inherit" />}
                severity="success" 
                sx={{ 
                  mb: 3, 
                  animation: 'fadeIn 0.5s', 
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(-10px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    },
                  }
                }}
                className="dark:bg-green-800 dark:text-white"
              >
                <Typography variant="body2">
                  Pengaturan logout otomatis berhasil disimpan ke database!
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  Durasi: {logoutOptions.find(opt => opt.value === pendingLogoutTimeout)?.label || 'Custom'}
                </Typography>
              </Alert>
            )}

            {saveError && (
              <Alert 
                icon={<ErrorIcon fontSize="inherit" />}
                severity="error" 
                sx={{ mb: 3 }}
                className="dark:bg-red-800 dark:text-white"
              >
                <Typography variant="body2">
                  Gagal menyimpan pengaturan ke database. Silakan coba lagi.
                </Typography>
              </Alert>
            )}

            <Box 
              sx={{ 
                bgcolor: 'info.lighter', 
                p: 2, 
                borderRadius: 1, 
                mb: 3 
              }}
              className="bg-blue-50 dark:bg-gray-700 dark:text-gray-300"
            >
              <Typography variant="body2" color="text.secondary" className="dark:text-gray-300">
                Fitur ini akan melakukan logout otomatis ketika tidak ada aktivitas (mouse, keyboard, touch) selama periode waktu tertentu. Fitur ini akan tetap berfungsi bahkan saat Anda beralih ke tab lain.
              </Typography>
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ display: 'block', mt: 1.5 }}
                className="dark:text-gray-400"
              >
                Status saat ini: {
                  logoutTimeout === 0 
                    ? 'Off (tidak aktif)' 
                    : `Aktif - ${logoutOptions.find(opt => opt.value === logoutTimeout)?.label || 'Custom'}`
                }
              </Typography>
            </Box>
            
            <FormControl 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 3 }}
            >
              <InputLabel 
                id="logout-select-label"
                className="dark:text-gray-300"
              >
                Durasi Logout Otomatis
              </InputLabel>
              <Select
                labelId="logout-select-label"
                value={pendingLogoutTimeout}
                label="Durasi Logout Otomatis"
                onChange={handleChange}
                disabled={isLoading}
                className="dark:text-white dark:border-gray-600"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.23)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(0, 0, 0, 0.87)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }}
              >
                {logoutOptions.map(({ label, value }) => (
                  <MenuItem key={value} value={value} className="dark:text-white dark:hover:bg-gray-700">
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color={applied ? "success" : "primary"}
                onClick={handleApply}
                disabled={applied || isLoading}
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : (applied ? <CheckCircleIcon /> : <SaveIcon />)}
                sx={{
                  py: 1,
                  px: 3,
                  borderRadius: 1.5,
                  fontWeight: 'medium',
                  transition: 'all 0.3s',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)'
                  }
                }}
                className="dark:bg-purple-600 dark:hover:bg-purple-700"
              >
                {isLoading ? (
                  'Menyimpan...'
                ) : applied ? (
                  'TERSIMPAN'
                ) : (
                  'SIMPAN'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {/* Debug Info (only visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 dark:bg-gray-800 dark:text-white" sx={{ p: 2 }}>
            <Typography variant="h6">Debug Info</Typography>
            <Typography variant="body2">logoutTimeout (context): {logoutTimeout}</Typography>
            <Typography variant="body2">pendingLogoutTimeout (state): {pendingLogoutTimeout}</Typography>
            <Typography variant="body2">localStorage value: {localStorage.getItem('logoutTimeout')}</Typography>
            <Typography variant="body2">Firebase status: {firebaseStatus}</Typography>
          </Card>
        )}
      </>
    );
  };

  return (
    <LayoutShell>
      <Container maxWidth="md" sx={{ py: 5 }}>
        {renderContent()}
      </Container>
    </LayoutShell>
  );
};

export default PreferencesPage;