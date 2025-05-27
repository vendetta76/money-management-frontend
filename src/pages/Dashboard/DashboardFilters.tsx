import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Button,
  IconButton,
  Chip,
  Stack,
  Grid,
  Paper,
  Collapse,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  Alert,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as OutcomeIcon,
  SwapHoriz as TransferIcon,
  AttachMoney as CurrencyIcon,
  Refresh as ResetIcon,
  Save as SaveIcon,
  BookmarkBorder as PresetIcon,
  ExpandMore as ExpandMoreIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';

interface Wallet {
  id: string;
  name: string;
  balance?: number;
  currency?: string;
}

interface Props {
  filterDate: string;
  setFilterDate: (value: string) => void;
  filterWallet: string;
  setFilterWallet: (value: string) => void;
  filterType: string;
  setFilterType: (value: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (value: string) => void;
  customStartDate: string;
  setCustomStartDate: (value: string) => void;
  customEndDate: string;
  setCustomEndDate: (value: string) => void;
  wallets: Wallet[];
  allCurrencies: string[];
}

interface FilterPreset {
  id: string;
  name: string;
  filters: {
    filterDate: string;
    filterWallet: string;
    filterType: string;
    selectedCurrency: string;
    customStartDate: string;
    customEndDate: string;
  };
  createdAt: string;
}

const DashboardFilters: React.FC<Props> = ({
  filterDate,
  setFilterDate,
  filterWallet,
  setFilterWallet,
  filterType,
  setFilterType,
  selectedCurrency,
  setSelectedCurrency,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  wallets,
  allCurrencies,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('dashboardFilterPresets');
    return saved ? JSON.parse(saved) : [];
  });

  // Quick filter options
  const dateOptions = [
    { value: 'today', label: 'Hari Ini', icon: <TodayIcon /> },
    { value: '7days', label: '7 Hari', icon: <ScheduleIcon /> },
    { value: '30days', label: '30 Hari', icon: <CalendarIcon /> },
    { value: '1year', label: '1 Tahun', icon: <TimelineIcon /> },
    { value: 'custom', label: 'Custom', icon: <DateRangeIcon /> },
  ];

  const typeOptions = [
    { value: 'all', label: 'Semua', icon: <FilterIcon />, color: 'default' as const },
    { value: 'income', label: 'Pemasukan', icon: <IncomeIcon />, color: 'success' as const },
    { value: 'outcome', label: 'Pengeluaran', icon: <OutcomeIcon />, color: 'error' as const },
    { value: 'transfer', label: 'Transfer', icon: <TransferIcon />, color: 'info' as const },
  ];

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterDate !== 'today') count++;
    if (filterWallet !== 'all') count++;
    if (filterType !== 'all') count++;
    if (selectedCurrency !== 'all') count++;
    return count;
  }, [filterDate, filterWallet, filterType, selectedCurrency]);

  const handleResetFilters = () => {
    setFilterDate("today");
    setFilterWallet("all");
    setFilterType("all");
    setSelectedCurrency("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const saveCurrentPreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: {
        filterDate,
        filterWallet,
        filterType,
        selectedCurrency,
        customStartDate,
        customEndDate,
      },
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('dashboardFilterPresets', JSON.stringify(updatedPresets));
    setPresetName('');
    setShowPresets(false);
  };

  const loadPreset = (preset: FilterPreset) => {
    setFilterDate(preset.filters.filterDate);
    setFilterWallet(preset.filters.filterWallet);
    setFilterType(preset.filters.filterType);
    setSelectedCurrency(preset.filters.selectedCurrency);
    setCustomStartDate(preset.filters.customStartDate);
    setCustomEndDate(preset.filters.customEndDate);
  };

  const deletePreset = (presetId: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updatedPresets);
    localStorage.setItem('dashboardFilterPresets', JSON.stringify(updatedPresets));
  };

  const getFilterSummary = () => {
    const summary = [];
    
    if (filterDate !== 'today') {
      const dateOption = dateOptions.find(opt => opt.value === filterDate);
      summary.push(dateOption?.label || filterDate);
    }
    
    if (filterWallet !== 'all') {
      const wallet = wallets.find(w => w.id === filterWallet);
      summary.push(wallet?.name || 'Unknown Wallet');
    }
    
    if (filterType !== 'all') {
      const typeOption = typeOptions.find(opt => opt.value === filterType);
      summary.push(typeOption?.label || filterType);
    }
    
    if (selectedCurrency !== 'all') {
      summary.push(selectedCurrency);
    }
    
    return summary;
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardHeader
        avatar={
          <Badge badgeContent={activeFiltersCount} color="primary">
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <FilterIcon />
            </Avatar>
          </Badge>
        }
        title={
          <Typography variant="h6" fontWeight="bold">
            Filter & Pencarian
          </Typography>
        }
        subheader={
          activeFiltersCount > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
              {getFilterSummary().map((filter, index) => (
                <Chip 
                  key={index}
                  label={filter}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Atur filter untuk menyaring data transaksi
            </Typography>
          )
        }
        action={
          <Box display="flex" gap={1}>
            <Tooltip title="Reset Semua Filter">
              <IconButton 
                onClick={handleResetFilters}
                disabled={activeFiltersCount === 0}
                color="error"
                size="small"
              >
                <ResetIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Simpan Preset">
              <IconButton 
                onClick={() => setShowPresets(!showPresets)}
                color="success"
                size="small"
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={expanded ? "Tutup Filter" : "Buka Filter"}>
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      <Collapse in={expanded}>
        <CardContent>
          {/* Quick Date Filters */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              📅 Periode Waktu
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {dateOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filterDate === option.value ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={option.icon}
                  onClick={() => setFilterDate(option.value)}
                  sx={{
                    mb: 1,
                    '&.MuiButton-contained': {
                      boxShadow: theme.shadows[2]
                    }
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </Stack>

            {/* Custom Date Range */}
            <Collapse in={filterDate === 'custom'}>
              <Paper elevation={1} sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" gutterBottom color="text.secondary">
                  Pilih rentang tanggal custom:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tanggal Mulai"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tanggal Selesai"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Collapse>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Main Filters */}
          <Grid container spacing={3}>
            {/* Transaction Type Filter */}
            <Grid item xs={12} md={6} lg={3}>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                💰 Jenis Transaksi
              </Typography>
              <Stack spacing={1}>
                {typeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filterType === option.value ? 'contained' : 'outlined'}
                    color={filterType === option.value ? option.color : 'inherit'}
                    size="small"
                    startIcon={option.icon}
                    onClick={() => setFilterType(option.value)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {option.label}
                  </Button>
                ))}
              </Stack>
            </Grid>

            {/* Wallet Filter */}
            <Grid item xs={12} md={6} lg={3}>
              <FormControl fullWidth size="small">
                <InputLabel>🏦 Dompet</InputLabel>
                <Select
                  value={filterWallet}
                  label="🏦 Dompet"
                  onChange={(e) => setFilterWallet(e.target.value)}
                >
                  <MenuItem value="all">
                    <Box display="flex" alignItems="center" gap={1}>
                      <WalletIcon fontSize="small" />
                      Semua Wallet
                    </Box>
                  </MenuItem>
                  {wallets.map((wallet) => (
                    <MenuItem key={wallet.id} value={wallet.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <WalletIcon fontSize="small" />
                        {wallet.name}
                        {wallet.currency && (
                          <Chip 
                            label={wallet.currency} 
                            size="small" 
                            variant="outlined"
                            sx={{ ml: 'auto', fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Currency Filter */}
            <Grid item xs={12} md={6} lg={3}>
              <FormControl fullWidth size="small">
                <InputLabel>💱 Mata Uang</InputLabel>
                <Select
                  value={selectedCurrency}
                  label="💱 Mata Uang"
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <MenuItem value="all">
                    <Box display="flex" alignItems="center" gap={1}>
                      <CurrencyIcon fontSize="small" />
                      Semua Mata Uang
                    </Box>
                  </MenuItem>
                  {allCurrencies.map((currency) => (
                    <MenuItem key={currency} value={currency}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CurrencyIcon fontSize="small" />
                        {currency}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Filter Summary */}
            <Grid item xs={12} md={6} lg={3}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  height: '100%',
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📊 Status Filter
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Filter aktif:
                  </Typography>
                  <Chip 
                    label={activeFiltersCount}
                    size="small"
                    color={activeFiltersCount > 0 ? 'primary' : 'default'}
                  />
                </Box>
                {activeFiltersCount === 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="caption">
                      Tidak ada filter aktif
                    </Typography>
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>

      {/* Preset Management */}
      <Collapse in={showPresets}>
        <CardContent sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            🔖 Kelola Preset Filter
          </Typography>
          
          {/* Save New Preset */}
          <Box sx={{ mb: 3 }}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" gutterBottom color="text.secondary">
                Simpan filter saat ini sebagai preset:
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Nama preset..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SaveIcon />}
                  onClick={saveCurrentPreset}
                  disabled={!presetName.trim() || activeFiltersCount === 0}
                  sx={{ minWidth: 100 }}
                >
                  Simpan
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <Box>
              <Typography variant="body2" gutterBottom color="text.secondary">
                Preset tersimpan:
              </Typography>
              <Stack spacing={1}>
                {savedPresets.map((preset) => (
                  <Paper 
                    key={preset.id} 
                    elevation={1} 
                    sx={{ 
                      p: 2,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {preset.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Dibuat: {new Date(preset.createdAt).toLocaleDateString('id-ID')}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckIcon />}
                          onClick={() => loadPreset(preset)}
                        >
                          Terapkan
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deletePreset(preset.id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default DashboardFilters;