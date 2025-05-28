import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Grid,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Button
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area
} from 'recharts';
import {
  ShowChart as LineIcon,
  AreaChart as AreaIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { format, subDays, subMonths, subYears, parseISO } from 'date-fns';

interface Transaction {
  id: string;
  type: 'income' | 'outcome' | 'transfer';
  amount: number;
  currency: string;
  createdAt: {
    toDate: () => Date;
    seconds: number;
  };
  wallet?: string;
  category?: string;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Props {
  transactions: Transaction[];
  selectedCurrency: string;
  filterDate: string;
  customStartDate: any;
  customEndDate: any;
  wallets: Wallet[];
}

interface ChartDataPoint {
  date: string;
  dateKey: string;
  income: number;
  outcome: number;
  net: number;
  cumulative: number;
}

const BalanceTrendChart: React.FC<Props> = ({
  transactions,
  selectedCurrency,
  filterDate,
  wallets
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Process data
  const { chartData, isEmpty, totalIncome, totalOutcome, netChange } = useMemo(() => {
    const now = new Date();
    
    // Filter transactions by date range
    const filteredTx = transactions
      .filter(tx => tx.createdAt)
      .filter(tx => {
        const txDate = new Date(tx.createdAt.toDate());

        if (filterDate === '7days') {
          return txDate >= subDays(now, 7);
        } else if (filterDate === '30days') {
          return txDate >= subMonths(now, 1);
        } else if (filterDate === '1year') {
          return txDate >= subYears(now, 1);
        }
        return true;
      })
      .filter(tx => selectedCurrency === 'all' || tx.currency === selectedCurrency);

    if (filteredTx.length === 0) {
      return { chartData: [], isEmpty: true, totalIncome: 0, totalOutcome: 0, netChange: 0 };
    }

    // Group transactions by date
    const groupedByDate: Record<string, { income: number; outcome: number }> = {};
    
    filteredTx.forEach(tx => {
      const dateKey = format(tx.createdAt.toDate(), 'yyyy-MM-dd');
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { income: 0, outcome: 0 };
      }
      
      if (tx.type === 'income') {
        groupedByDate[dateKey].income += tx.amount || 0;
      } else if (tx.type === 'outcome') {
        groupedByDate[dateKey].outcome += tx.amount || 0;
      }
    });

    // Create chart data points
    const sortedDates = Object.keys(groupedByDate).sort();
    let cumulativeBalance = 0;
    
    const data: ChartDataPoint[] = sortedDates.map(dateKey => {
      const dayData = groupedByDate[dateKey];
      const net = dayData.income - dayData.outcome;
      cumulativeBalance += net;
      
      return {
        date: format(parseISO(dateKey), isSmallMobile ? 'dd/MM' : 'dd/MM'),
        dateKey,
        income: dayData.income,
        outcome: dayData.outcome,
        net,
        cumulative: cumulativeBalance
      };
    });

    // Calculate totals
    const totIncome = filteredTx
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const totOutcome = filteredTx
      .filter(tx => tx.type === 'outcome')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return { 
      chartData: data, 
      isEmpty: false, 
      totalIncome: totIncome,
      totalOutcome: totOutcome,
      netChange: totIncome - totOutcome
    };
  }, [transactions, selectedCurrency, filterDate, isSmallMobile]);

  const formatCurrency = (value: number, currency: string = 'IDR') => {
    // Handle different currency formats
    switch (currency.toUpperCase()) {
      case 'USD':
        return value.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 2
        });
      case 'EUR':
        return value.toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 2
        });
      case 'JPY':
        return value.toLocaleString('ja-JP', {
          style: 'currency',
          currency: 'JPY',
          maximumFractionDigits: 0
        });
      case 'SGD':
        return value.toLocaleString('en-SG', {
          style: 'currency',
          currency: 'SGD',
          maximumFractionDigits: 2
        });
      case 'GBP':
        return value.toLocaleString('en-GB', {
          style: 'currency',
          currency: 'GBP',
          maximumFractionDigits: 2
        });
      case 'THB':
        return value.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB',
          maximumFractionDigits: 2
        });
      case 'USDT':
        return `USDT ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
      case 'BTC':
        return `₿ ${value.toLocaleString('en-US', { maximumFractionDigits: 8 })}`;
      case 'ETH':
        return `Ξ ${value.toLocaleString('en-US', { maximumFractionDigits: 6 })}`;
      case 'IDR':
      default:
        return value.toLocaleString('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        });
    }
  };

  // Get display currency
  const getDisplayCurrency = () => {
    return selectedCurrency === 'all' ? 'IDR' : selectedCurrency;
  };

  const displayCurrency = getDisplayCurrency();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, maxWidth: { xs: 180, sm: 200 } }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          <Typography 
            variant="body2" 
            color="success.main"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Masuk: {formatCurrency(data.income, displayCurrency)}
          </Typography>
          <Typography 
            variant="body2" 
            color="error.main"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Keluar: {formatCurrency(data.outcome, displayCurrency)}
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Saldo: {formatCurrency(data.cumulative, displayCurrency)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (isEmpty) {
    return (
      <Alert severity="info">
        Tidak ada data transaksi untuk periode yang dipilih.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Mobile-friendly Controls */}
      <Box sx={{ mb: 2 }}>
        {isMobile ? (
          <Stack spacing={2}>
            {/* Top row - Chart info and settings toggle */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {chartData.length} hari data
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SettingsIcon />}
                endIcon={<ExpandMoreIcon sx={{ 
                  transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s' 
                }} />}
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                Options
              </Button>
            </Box>

            {/* Collapsible advanced controls */}
            <Collapse in={showAdvanced}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartType}
                    label="Chart Type"
                    onChange={(e) => setChartType(e.target.value as 'line' | 'area')}
                  >
                    <MenuItem value="area">
                      <Box display="flex" alignItems="center" gap={1}>
                        <AreaIcon fontSize="small" />
                        Area Chart
                      </Box>
                    </MenuItem>
                    <MenuItem value="line">
                      <Box display="flex" alignItems="center" gap={1}>
                        <LineIcon fontSize="small" />
                        Line Chart
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Collapse>
          </Stack>
        ) : (
          /* Desktop controls */
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {chartData.length} hari data
            </Typography>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Tampilan</InputLabel>
              <Select
                value={chartType}
                label="Tampilan"
                onChange={(e) => setChartType(e.target.value as 'line' | 'area')}
              >
                <MenuItem value="area">Area</MenuItem>
                <MenuItem value="line">Line</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Chart - Responsive Height */}
      <Box sx={{ height: { xs: 250, sm: 300, md: 350 }, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ 
              top: 5, 
              right: isMobile ? 5 : 30, 
              left: isMobile ? 5 : 20, 
              bottom: 5 
            }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={isSmallMobile ? 10 : 12}
                tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                interval={isSmallMobile ? 'preserveStartEnd' : 0}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (isMobile) {
                    // Simplified format for mobile
                    if (Math.abs(value) >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (Math.abs(value) >= 1000) {
                      return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value.toFixed(0);
                  }
                  return formatCurrency(value, displayCurrency);
                }} 
                stroke="#666"
                fontSize={isSmallMobile ? 10 : 12}
                width={isMobile ? 50 : 80}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ 
              top: 5, 
              right: isMobile ? 5 : 30, 
              left: isMobile ? 5 : 20, 
              bottom: 5 
            }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#666" 
                fontSize={isSmallMobile ? 10 : 12}
                tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                interval={isSmallMobile ? 'preserveStartEnd' : 0}
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (isMobile) {
                    // Simplified format for mobile
                    if (Math.abs(value) >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (Math.abs(value) >= 1000) {
                      return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value.toFixed(0);
                  }
                  return formatCurrency(value, displayCurrency);
                }} 
                stroke="#666"
                fontSize={isSmallMobile ? 10 : 12}
                width={isMobile ? 50 : 80}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: isMobile ? 3 : 4 }}
                activeDot={{ r: isMobile ? 5 : 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>

      {/* Stats - Mobile Optimized Layout */}
      {isMobile ? (
        <Stack spacing={2}>
          {/* Primary stat - Net Change */}
          <Card elevation={1}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Net Change
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color={netChange >= 0 ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}
              >
                {netChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                {formatCurrency(Math.abs(netChange), displayCurrency)}
              </Typography>
            </CardContent>
          </Card>

          {/* Secondary stats */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Total Masuk
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(totalIncome, displayCurrency)}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Total Keluar
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {formatCurrency(totalOutcome, displayCurrency)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      ) : (
        /* Desktop Stats Grid */
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {formatCurrency(totalIncome, displayCurrency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Masuk {displayCurrency !== 'IDR' && `(${displayCurrency})`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {formatCurrency(totalOutcome, displayCurrency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Keluar {displayCurrency !== 'IDR' && `(${displayCurrency})`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                color={netChange >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(netChange, displayCurrency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Net Change {displayCurrency !== 'IDR' && `(${displayCurrency})`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BalanceTrendChart;