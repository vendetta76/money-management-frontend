import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Box
} from '@mui/material';
import { Search } from 'lucide-react';
import { FilterState, WalletEntry, DATE_RANGE_OPTIONS, TRANSACTION_TYPE_OPTIONS } from './historyTypes';

interface FilterControlsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  wallets: WalletEntry[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFiltersChange,
  wallets
}) => {
  const handleFilterChange = (field: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        {/* Date Range Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Tanggal</InputLabel>
            <Select
              value={filters.selectedDateRange}
              label="Tanggal"
              onChange={(e) => handleFilterChange('selectedDateRange', e.target.value)}
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Custom Date Input */}
        {filters.selectedDateRange === 'custom' && (
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Pilih Tanggal"
              value={filters.customDate}
              onChange={(e) => handleFilterChange('customDate', e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        )}

        {/* Transaction Type Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Jenis Transaksi</InputLabel>
            <Select
              value={filters.selectedType}
              label="Jenis Transaksi"
              onChange={(e) => handleFilterChange('selectedType', e.target.value)}
            >
              {TRANSACTION_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Wallet Filter */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Dompet</InputLabel>
            <Select
              value={filters.selectedWallet}
              label="Dompet"
              onChange={(e) => handleFilterChange('selectedWallet', e.target.value)}
            >
              <MenuItem value="all">Semua Dompet</MenuItem>
              {wallets.map((wallet) => (
                <MenuItem key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Search Input */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Cari deskripsi..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default FilterControls;