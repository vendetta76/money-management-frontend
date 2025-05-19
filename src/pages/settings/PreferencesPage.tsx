import React from 'react';
import {
  Container,
  Typography,
  Stack,
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
  Snackbar
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
            className="dark:text-purple-300 flex items-center"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <AccessTimeIcon fontSize="large" sx={{ mr: 1.5 }} />
            Preferensi
          </Typography>
          <Typography 
            variant="subtitle1" 
            className="dark:text-gray-300 mt-1"
            mt={1}
          >
            Kelola pengaturan aplikasi Anda untuk pengalaman yang lebih personal
          </Typography>
          <Divider sx={{ mt: 2 }} className="dark:border-gray-700" />
        </Box>

        <Card 
          elevation={3} 
          className="rounded-xl overflow-visible relative transition-all duration-300 hover:shadow-lg dark:bg-gray-800 dark:border dark:border-gray-700"
          sx={{ 
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          <Box 
            className="absolute -top-5 left-5 bg-purple-600 dark:bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
            sx={{ 
              position: 'absolute', 
              top: -20, 
              left: 20, 
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 3
            }}
          >
            <SecurityIcon />
          </Box>

          <CardContent sx={{ pt: 4, pb: 3 }} className="dark:text-white">
            <Box mb={3}>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                className="flex items-center dark:text-white"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                Logout Otomatis
                <Tooltip title="Fitur ini akan secara otomatis logout pengguna setelah tidak aktif selama waktu yang ditentukan, membantu meningkatkan keamanan akun Anda.">
                  <IconButton size="small" sx={{ ml: 1 }} className="dark:text-gray-300">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
            </Box>

            {saveSuccess && (
              <Alert 
                icon={<CheckCircleIcon fontSize="inherit" />}
                severity="success" 
                className="mb-3 animate-fadeIn dark:bg-green-800 dark:text-white"
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
              >
                <Typography variant="body2">
                  Pengaturan logout otomatis berhasil disimpan ke database!
                </Typography>
                <Typography variant="caption" className="block mt-1">
                  Durasi: {logoutOptions.find(opt => opt.value === pendingLogoutTimeout)?.label || 'Custom'}
                </Typography>
              </Alert>
            )}

            {saveError && (
              <Alert 
                icon={<ErrorIcon fontSize="inherit" />}
                severity="error" 
                className="mb-3 animate-fadeIn dark:bg-red-800 dark:text-white"
                sx={{ mb: 3 }}
              >
                <Typography variant="body2">
                  Gagal menyimpan pengaturan ke database. Silakan coba lagi.
                </Typography>
              </Alert>
            )}

            <Box 
              className="bg-blue-50 dark:bg-gray-700 p-4 rounded mb-3"
              sx={{ p: 2, borderRadius: 1, mb: 3 }}
            >
              <Typography variant="body2" className="text-gray-600 dark:text-gray-300">
                Fitur ini akan melakukan logout otomatis ketika tidak ada aktivitas (mouse, keyboard, touch) selama periode waktu tertentu. Fitur ini akan tetap berfungsi bahkan saat Anda beralih ke tab lain.
              </Typography>
              
              <Typography variant="caption" className="block mt-2 text-gray-500 dark:text-gray-400">
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
              className="dark:bg-gray-800"
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
                    borderColor: 'rgba(255, 255, 255, 0.23)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9575cd'
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
                color="primary"
                onClick={handleApply}
                disabled={applied || isLoading}
                size="large"
                startIcon={isLoading ? <CircularProgress size={20} /> : (applied ? <CheckCircleIcon /> : <SaveIcon />)}
                className="px-5 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 dark:bg-purple-600 dark:hover:bg-purple-700"
              >
                {isLoading ? (
                  'Menyimpan...'
                ) : applied ? (
                  'Tersimpan'
                ) : (
                  'Simpan'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
        
        {/* Debug Info (only visible in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 dark:bg-gray-800 dark:text-white p-4">
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