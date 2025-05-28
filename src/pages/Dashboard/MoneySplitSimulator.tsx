import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Paper,
  InputAdornment,
  useTheme,
  alpha,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  Home as HomeIcon,
  Restaurant as FoodIcon,
  DirectionsCar as TransportIcon,
  SportsEsports as FunIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as MagicIcon,
  Calculate as CalculateIcon
} from "@mui/icons-material";
import { formatCurrency } from "../helpers/formatCurrency";

interface Category {
  id: string;
  name: string;
  percent: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
  isCustom?: boolean;
}

// 🎨 Predefined beautiful categories
const PRESET_CATEGORIES: Category[] = [
  {
    id: 'needs',
    name: 'Kebutuhan Pokok',
    percent: 50,
    icon: <HomeIcon />,
    color: '#2196F3',
    description: 'Sewa, makanan, listrik, air, transportasi'
  },
  {
    id: 'wants',
    name: 'Keinginan',
    percent: 30,
    icon: <FunIcon />,
    color: '#FF9800',
    description: 'Hiburan, hobi, shopping, makan di luar'
  },
  {
    id: 'savings',
    name: 'Tabungan',
    percent: 20,
    icon: <SavingsIcon />,
    color: '#4CAF50',
    description: 'Dana darurat, investasi, tabungan masa depan'
  }
];

const QUICK_TEMPLATES = [
  {
    name: '50/30/20 Rule',
    description: 'Klasik dan seimbang',
    categories: PRESET_CATEGORIES
  },
  {
    name: 'Aggressive Saver',
    description: 'Fokus menabung',
    categories: [
      { ...PRESET_CATEGORIES[0], percent: 40 },
      { ...PRESET_CATEGORIES[1], percent: 20 },
      { ...PRESET_CATEGORIES[2], percent: 40 }
    ]
  },
  {
    name: 'Balanced Life',
    description: 'Seimbang hidup',
    categories: [
      { ...PRESET_CATEGORIES[0], percent: 45 },
      { ...PRESET_CATEGORIES[1], percent: 35 },
      { ...PRESET_CATEGORIES[2], percent: 20 }
    ]
  }
];

const AVAILABLE_CURRENCIES = [
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' }
];

export default function MoneySplitSimulator() {
  const theme = useTheme();
  
  // Core state
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');
  const [categories, setCategories] = useState<Category[]>(PRESET_CATEGORIES);
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('moneySplitSimulator');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTotalAmount(data.totalAmount || 0);
        setSelectedCurrency(data.selectedCurrency || 'IDR');
        setCategories(data.categories || PRESET_CATEGORIES);
      } catch (error) {
        console.log('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    const data = {
      totalAmount,
      selectedCurrency,
      categories
    };
    localStorage.setItem('moneySplitSimulator', JSON.stringify(data));
  }, [totalAmount, selectedCurrency, categories]);

  // Calculations
  const totalPercent = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.percent, 0);
  }, [categories]);

  const isBalanced = totalPercent === 100;
  const remaining = 100 - totalPercent;

  const results = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      amount: (totalAmount * cat.percent) / 100
    }));
  }, [categories, totalAmount]);

  // Handlers
  const updateCategoryPercent = (id: string, percent: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, percent } : cat
    ));
  };

  const addCustomCategory = () => {
    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      name: 'Kategori Baru',
      percent: Math.max(0, remaining),
      icon: <CalculateIcon />,
      color: theme.palette.primary.main,
      isCustom: true
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setCategories(template.categories.map(cat => ({ ...cat })));
  };

  const resetToDefault = () => {
    setCategories(PRESET_CATEGORIES.map(cat => ({ ...cat })));
    setTotalAmount(0);
  };

  const balanceCategories = () => {
    if (categories.length === 0) return;
    
    const evenPercent = Math.floor(100 / categories.length);
    const remainder = 100 - (evenPercent * categories.length);
    
    setCategories(prev => prev.map((cat, index) => ({
      ...cat,
      percent: index === 0 ? evenPercent + remainder : evenPercent
    })));
  };

  const getCurrencySymbol = () => {
    return AVAILABLE_CURRENCIES.find(c => c.code === selectedCurrency)?.symbol || selectedCurrency;
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      {/* Header Setup */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          💰 Setup Your Budget
        </Typography>
        
        {/* Amount Input */}
        <TextField
          fullWidth
          label="Total Amount"
          value={totalAmount || ''}
          onChange={(e) => setTotalAmount(Number(e.target.value.replace(/\D/g, '')) || 0)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography variant="body2" fontWeight="bold">
                  {getCurrencySymbol()}
                </Typography>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
          placeholder="0"
        />

        {/* Currency Selection */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {AVAILABLE_CURRENCIES.map(currency => (
            <Chip
              key={currency.code}
              label={`${currency.symbol} ${currency.code}`}
              onClick={() => setSelectedCurrency(currency.code)}
              color={selectedCurrency === currency.code ? 'primary' : 'default'}
              variant={selectedCurrency === currency.code ? 'filled' : 'outlined'}
              size="small"
            />
          ))}
        </Stack>
      </Paper>

      {/* Quick Templates */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            🚀 Quick Templates
          </Typography>
          <Tooltip title="Balance All Categories Equally">
            <IconButton size="small" onClick={balanceCategories}>
              <MagicIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Stack spacing={1}>
          {QUICK_TEMPLATES.map((template, index) => (
            <Box
              key={index}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
              onClick={() => applyTemplate(template)}
            >
              <Typography variant="body2" fontWeight="bold">
                {template.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {template.description}
              </Typography>
              <Box display="flex" gap={0.5} mt={0.5}>
                {template.categories.map((cat, i) => (
                  <Chip
                    key={i}
                    label={`${cat.percent}%`}
                    size="small"
                    sx={{ 
                      bgcolor: alpha(cat.color, 0.1),
                      color: cat.color,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Status Indicator */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            📊 Budget Status
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {isBalanced ? (
              <CheckIcon color="success" />
            ) : (
              <ErrorIcon color="error" />
            )}
            <Typography
              variant="h6"
              fontWeight="bold"
              color={isBalanced ? 'success.main' : 'error.main'}
            >
              {totalPercent}%
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(totalPercent, 100)}
          color={isBalanced ? 'success' : totalPercent > 100 ? 'error' : 'primary'}
          sx={{ height: 8, borderRadius: 4, mb: 1 }}
        />

        {!isBalanced && (
          <Alert 
            severity={totalPercent > 100 ? 'error' : 'warning'}
            sx={{ mt: 1 }}
          >
            {totalPercent > 100 
              ? `Over budget by ${totalPercent - 100}%`
              : `${remaining}% remaining to allocate`
            }
          </Alert>
        )}
      </Paper>

      {/* Categories */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            🎯 Categories
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addCustomCategory}
            variant="outlined"
          >
            Add
          </Button>
        </Box>

        <Stack spacing={2}>
          {categories.map((category) => (
            <Card key={category.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
              <CardContent sx={{ p: 2 }}>
                {/* Category Header */}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: alpha(category.color, 0.1),
                      color: category.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {category.icon}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    {editingCategory === category.id ? (
                      <TextField
                        size="small"
                        value={category.name}
                        onChange={(e) => {
                          setCategories(prev => prev.map(cat =>
                            cat.id === category.id ? { ...cat, name: e.target.value } : cat
                          ));
                        }}
                        onBlur={() => setEditingCategory(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingCategory(null);
                        }}
                        autoFocus
                      />
                    ) : (
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        onClick={() => setEditingCategory(category.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {category.name}
                      </Typography>
                    )}
                    
                    {category.description && (
                      <Typography variant="caption" color="text.secondary">
                        {category.description}
                      </Typography>
                    )}
                  </Box>

                  {category.isCustom && (
                    <IconButton
                      size="small"
                      onClick={() => removeCategory(category.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Percentage Slider */}
                <Box sx={{ px: 1, mb: 2 }}>
                  <Slider
                    value={category.percent}
                    onChange={(_, value) => updateCategoryPercent(category.id, value as number)}
                    min={0}
                    max={100}
                    step={1}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' }
                    ]}
                    sx={{
                      color: category.color,
                      '& .MuiSlider-thumb': {
                        backgroundColor: category.color
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: category.color
                      }
                    }}
                  />
                </Box>

                {/* Results */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: category.color }}>
                      {category.percent}%
                    </Typography>
                  </Box>
                  
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency((totalAmount * category.percent) / 100, selectedCurrency)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      per month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Paper>

      {/* Results Summary */}
      {isBalanced && totalAmount > 0 && (
        <Paper elevation={2} sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <CheckIcon color="success" />
            <Typography variant="h6" fontWeight="bold" color="success.main">
              Perfect Balance! 🎉
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Your budget is perfectly balanced. Here's your monthly allocation:
          </Typography>

          <Stack spacing={1}>
            {results.map(result => (
              <Box
                key={result.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  p: 1.5,
                  bgcolor: alpha(result.color, 0.1),
                  borderRadius: 1,
                  border: `1px solid ${alpha(result.color, 0.2)}`
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ color: result.color }}>{result.icon}</Box>
                  <Typography variant="body2" fontWeight="medium">
                    {result.name}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {formatCurrency(result.amount, selectedCurrency)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={resetToDefault}
            size="small"
          >
            Reset
          </Button>
          <Button
            variant="outlined"
            startIcon={<MagicIcon />}
            onClick={balanceCategories}
            size="small"
          >
            Auto Balance
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}