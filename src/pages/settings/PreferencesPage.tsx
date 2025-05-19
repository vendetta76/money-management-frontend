import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { SelectChangeEvent } from '@mui/material/Select';
import { useLogoutTimeout } from '../context/LogoutTimeoutContext';

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

  // Update pendingLogoutTimeout when logoutTimeout changes
  React.useEffect(() => {
    setPendingLogoutTimeout(logoutTimeout);
  }, [logoutTimeout]);

  const applied = pendingLogoutTimeout === logoutTimeout;

  const handleApply = async () => {
    if (isNaN(pendingLogoutTimeout)) {
      toast.error('Waktu logout tidak valid');
      return;
    }
    
    try {
      await setLogoutTimeout(pendingLogoutTimeout);
      toast.success('Preferensi berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan preferensi');
      console.error('Error saving preferences:', error);
    }
  };

  const handleChange = (e: SelectChangeEvent<number>) => {
    setPendingLogoutTimeout(Number(e.target.value));
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography mt={2}>Memuat preferensi...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h4" mb={4} fontWeight="bold">
          ⚙️ Preferensi Logout Otomatis
        </Typography>
        <Stack spacing={4}>
          <FormControl fullWidth>
            <InputLabel id="logout-select-label">Durasi Logout Otomatis</InputLabel>
            <Select
              labelId="logout-select-label"
              value={pendingLogoutTimeout}
              label="Durasi Logout Otomatis"
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
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleApply}
              disabled={applied || isLoading}
              size="large"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Menyimpan...
                </>
              ) : applied ? (
                'Tersimpan'
              ) : (
                'Simpan'
              )}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PreferencesPage;