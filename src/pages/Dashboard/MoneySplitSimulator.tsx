import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  useTheme,
  alpha,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Calculate as CalculateIcon,
  Palette as PaletteIcon
} from "@mui/icons-material";
import { formatCurrency } from "../helpers/formatCurrency";

interface Category {
  id: string;
  name: string;
  percent: number;
}

const QUICK_PRESETS = [
  { name: "50/30/20", data: [50, 30, 20], labels: ["Needs", "Wants", "Savings"] },
  { name: "60/20/20", data: [60, 20, 20], labels: ["Needs", "Savings", "Investments"] },
  { name: "40/30/30", data: [40, 30, 30], labels: ["Needs", "Wants", "Future"] },
  { name: "70/20/10", data: [70, 20, 10], labels: ["Living", "Saving", "Fun"] }
];

const CURRENCIES = [
  { code: 'IDR', symbol: 'Rp' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'SGD', symbol: 'S$' },
  { code: 'MYR', symbol: 'RM' }
];

export default function MoneySplitSimulator() {
  const theme = useTheme();
  
  // Core state
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('IDR');
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Needs', percent: 50 },
    { id: '2', name: 'Wants', percent: 30 },
    { id: '3', name: 'Savings', percent: 20 }
  ]);
  
  // UI state
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Load/save data
  useEffect(() => {
    const saved = localStorage.getItem('money-split-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setAmount(data.amount || '');
        setCurrency(data.currency || 'IDR');
        setCategories(data.categories || categories);
      } catch (e) {
        console.log('Error loading saved data');
      }
    }
  }, []);

  useEffect(() => {
    const data = { amount, currency, categories };
    localStorage.setItem('money-split-data', JSON.stringify(data));
  }, [amount, currency, categories]);

  // Calculations
  const numericAmount = useMemo(() => {
    return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
  }, [amount]);

  const totalPercent = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.percent, 0);
  }, [categories]);

  const isBalanced = totalPercent === 100;
  const remaining = 100 - totalPercent;

  const results = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      amount: (numericAmount * cat.percent) / 100
    }));
  }, [categories, numericAmount]);

  // Handlers
  const updateCategory = (id: string, field: keyof Category, value: string | number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const addCategory = () => {
    const newId = Date.now().toString();
    setCategories(prev => [...prev, {
      id: newId,
      name: 'New Category',
      percent: Math.max(0, remaining)
    }]);
  };

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    }
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    const newCategories = preset.data.map((percent, index) => ({
      id: (index + 1).toString(),
      name: preset.labels[index],
      percent
    }));
    setCategories(newCategories);
  };

  const resetAll = () => {
    setAmount('');
    setCategories([
      { id: '1', name: 'Needs', percent: 50 },
      { id: '2', name: 'Wants', percent: 30 },
      { id: '3', name: 'Savings', percent: 20 }
    ]);
  };

  const autoBalance = () => {
    if (categories.length === 0) return;
    const evenPercent = Math.floor(100 / categories.length);
    const extra = 100 - (evenPercent * categories.length);
    
    setCategories(prev => prev.map((cat, i) => ({
      ...cat,
      percent: i === 0 ? evenPercent + extra : evenPercent
    })));
  };

  const getCurrencySymbol = () => {
    return CURRENCIES.find(c => c.code === currency)?.symbol || currency;
  };

  const formatAmount = (value: string) => {
    const numeric = value.replace(/[^\d]/g, '');
    return new Intl.NumberFormat('id-ID').format(Number(numeric));
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header - Amount Input */}
      <Paper elevation={0} sx={{ p: 3, border: `2px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="600">
            💰 Total Amount
          </Typography>
          
          <TextField
            fullWidth
            size="large"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter your amount"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {getCurrencySymbol()}
                  </Typography>
                </InputAdornment>
              ),
              sx: { fontSize: '1.2rem', fontWeight: '600' }
            }}
          />

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {CURRENCIES.map(curr => (
              <Chip
                key={curr.code}
                label={curr.code}
                onClick={() => setCurrency(curr.code)}
                color={currency === curr.code ? 'primary' : 'default'}
                variant={currency === curr.code ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* Results - Always Visible */}
      {numericAmount > 0 && (
        <Paper elevation={0} sx={{ p: 3, border: `2px solid ${theme.palette.primary.main}`, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6" fontWeight="600">
              💡 Your Split Results
            </Typography>
            {isBalanced ? (
              <CheckIcon color="success" />
            ) : (
              <Chip 
                label={`${totalPercent}%`}
                color={totalPercent > 100 ? 'error' : 'warning'}
                size="small"
              />
            )}
          </Box>

          <Stack spacing={1.5}>
            {results.map(result => (
              <Box 
                key={result.id}
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ 
                  py: 1,
                  px: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="body1" fontWeight="500">
                  {result.name}
                </Typography>
                <Box textAlign="right">
                  <Typography variant="h6" fontWeight="600" color="primary">
                    {formatCurrency(result.amount, currency)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {result.percent}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>

          {!isBalanced && (
            <Alert severity={totalPercent > 100 ? 'error' : 'warning'} sx={{ mt: 2 }}>
              {totalPercent > 100 
                ? `Over by ${totalPercent - 100}% - reduce some percentages`
                : `${remaining}% remaining - add to categories or adjust percentages`
              }
            </Alert>
          )}

          {isBalanced && (
            <Alert severity="success" sx={{ mt: 2 }}>
              🎉 Perfect! Your budget is perfectly balanced.
            </Alert>  
          )}
        </Paper>
      )}

      {/* Status Bar */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} mb={1}>
          <Typography variant="body2" fontWeight="600" color="text.secondary">
            Total: {totalPercent}%
          </Typography>
          
          {!isBalanced && (
            <Typography variant="body2" color={totalPercent > 100 ? 'error.main' : 'warning.main'}>
              {remaining > 0 ? `${remaining}% left` : `${Math.abs(remaining)}% over`}
            </Typography>
          )}
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(totalPercent, 100)}
          color={isBalanced ? 'success' : totalPercent > 100 ? 'error' : 'primary'}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Paper>

      {/* Quick Presets */}
      <Box>
        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
          🚀 Quick Presets
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {QUICK_PRESETS.map(preset => (
            <Button
              key={preset.name}
              variant="outlined"
              size="small"
              onClick={() => applyPreset(preset)}
              sx={{ minWidth: 'auto', borderRadius: 2 }}
            >
              {preset.name}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Categories */}
      <Box sx={{ flex: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2" fontWeight="600">
            📊 Categories
          </Typography>
          
          <Box display="flex" gap={0.5}>
            <Tooltip title="Auto Balance">
              <IconButton size="small" onClick={autoBalance}>
                <CalculateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="More Options">
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Stack spacing={1.5}>
          {categories.map((category) => (
            <Paper 
              key={category.id} 
              elevation={0} 
              sx={{ 
                p: 2, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                '&:hover': { borderColor: theme.palette.primary.main }
              }}
            >
              <Stack spacing={2}>
                {/* Name and Delete */}
                <Box display="flex" alignItems="center" gap={1}>
                  <TextField
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                    variant="standard"
                    sx={{ flex: 1 }}
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontWeight: '600' }
                    }}
                  />
                  
                  {categories.length > 1 && (
                    <IconButton 
                      size="small" 
                      onClick={() => removeCategory(category.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Percentage and Amount */}
                <Box display="flex" alignItems="center" gap={2}>
                  <TextField
                    type="number"
                    value={category.percent}
                    onChange={(e) => updateCategory(category.id, 'percent', Number(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    sx={{ width: 100 }}
                    size="small"
                  />
                  
                  <Box sx={{ flex: 1, textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="600" color="primary">
                      {formatCurrency((numericAmount * category.percent) / 100, currency)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>

        {/* Add Category Button */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addCategory}
          sx={{ mt: 2, py: 1.5, borderStyle: 'dashed' }}
        >
          Add Category
        </Button>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { autoBalance(); setMenuAnchor(null); }}>
          <ListItemIcon><CalculateIcon /></ListItemIcon>
          <ListItemText>Auto Balance</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { resetAll(); setMenuAnchor(null); }}>
          <ListItemIcon><RefreshIcon /></ListItemIcon>
          <ListItemText>Reset All</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}