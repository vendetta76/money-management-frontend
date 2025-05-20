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
  Divider,
  Tooltip,
  IconButton,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import { toast } from 'react-hot-toast';
import { SelectChangeEvent } from '@mui/material/Select';
import { useLogoutTimeout } from '../../context/LogoutTimeoutContext';
import LayoutShell from '../../layouts/LayoutShell';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const logoutOptions = [
  { label: 'Off', value: 0 },
  { label: '5 menit', value: 300000 },
  { label: '10 menit', value: 600000 },
  { label: '15 menit', value: 900000 },
  { label: '30 menit', value: 1800000 },
];

const PreferencesPage: React.FC = () => {
  const theme = useTheme();
  const { logoutTimeout, setLogoutTimeout, isLoading } = useLogoutTimeout();
  const [pendingLogoutTimeout, setPendingLogoutTimeout] = React.useState<number>(logoutTimeout);
  const [saveSuccess, setSaveSuccess] = React.useState<boolean>(false);
  const [saveError, setSaveError] = React.useState<boolean>(false);

  // Update pendingLogoutTimeout when logoutTimeout changes
  React.useEffect(() => {
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
      await setLogoutTimeout(pendingLogoutTimeout);
      toast.success('Preferensi berhasil disimpan');
      setSaveSuccess(true);
    } catch (error) {
      console.error("Error menyimpan ke Firebase:", error);
      toast.error('Gagal menyimpan preferensi');
      setSaveError(true);
    }
  };

  const handleChange = (e: SelectChangeEvent<number>) => {
    setPendingLogoutTimeout(Number(e.target.value));
    setSaveSuccess(false);
    setSaveError(false);
  };

  if (isLoading && logoutTimeout === undefined) {
    return (
      <LayoutShell>
        <Container maxWidth="md" sx={{ py: 5 }}>
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
      <Container 
        maxWidth="md" 
        sx={{ 
          py: 5,
          "& .MuiTypography-root": {
            fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif"
          }
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon 
              sx={{ 
                mr: 2, 
                fontSize: 32, 
                color: theme.palette.primary.main
              }} 
            />
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 500, 
                color: theme.palette.primary.main,
                fontSize: '1.75rem'
              }}
            >
              Preferensi
            </Typography>
          </Box>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: 'text.secondary',
              ml: 0.5,
              mb: 2,
              fontSize: '0.95rem'
            }}
          >
            Kelola pengaturan aplikasi Anda untuk pengalaman yang lebih personal
          </Typography>
          
          <Divider />
        </Box>

        {/* Settings Fields Container */}
        <Paper 
          elevation={0} 
          sx={{ 
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          {/* Security Settings Section */}
          <Box sx={{ 
            bgcolor: theme.palette.background.default,
            p: 2,
            borderBottom: '1px solid',
            borderColor: theme.palette.divider
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              Pengaturan Keamanan
            </Typography>
          </Box>

          {/* Fields */}
          <Box sx={{ px: 2 }}>
            {/* Auto Logout Field */}
            <Box 
              sx={{ 
                py: 3, 
                borderBottom: '1px solid',
                borderColor: theme.palette.divider,
              }}
            >
              <Grid container spacing={2} alignItems="flex-start">
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      sx={{ 
                        fontWeight: 500,
                        color: 'text.primary',
                        fontSize: '0.95rem'
                      }}
                    >
                      Logout Otomatis
                    </Typography>
                    <Tooltip 
                      title="Fitur ini akan melakukan logout otomatis ketika tidak ada aktivitas (mouse, keyboard, touch) selama periode waktu tertentu."
                      placement="top"
                    >
                      <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mt: 0.5, fontSize: '0.85rem' }}
                  >
                    Fitur ini akan tetap berfungsi bahkan saat Anda beralih ke tab lain.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ bgcolor: 'info.lighter', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      Status saat ini: {
                        logoutTimeout === 0 
                          ? 'Off (tidak aktif)' 
                          : `Aktif - ${logoutOptions.find(opt => opt.value === logoutTimeout)?.label || 'Custom'}`
                      }
                    </Typography>
                  </Box>
                  <FormControl 
                    variant="outlined" 
                    size="small"
                    sx={{ 
                      width: { xs: '100%', md: '60%' },
                      mr: 2
                    }}
                  >
                    <InputLabel id="logout-select-label">
                      Durasi Logout Otomatis
                    </InputLabel>
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
                </Grid>
              </Grid>
            </Box>

            {/* You can add more settings fields here */}
            {/* Each field would follow the same pattern as above */}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.action.hover,
            borderTop: '1px solid',
            borderColor: theme.palette.divider,
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <Button
              variant="contained"
              color={applied ? "success" : "primary"}
              onClick={handleApply}
              disabled={applied || isLoading}
              startIcon={isLoading ? 
                <CircularProgress size={16} color="inherit" /> : 
                (applied ? <CheckCircleIcon /> : null)
              }
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                px: 3,
                fontWeight: 500
              }}
            >
              {isLoading ? 'Menyimpan...' : applied ? 'TERSIMPAN' : 'SIMPAN'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </LayoutShell>
  );
};

export default PreferencesPage;