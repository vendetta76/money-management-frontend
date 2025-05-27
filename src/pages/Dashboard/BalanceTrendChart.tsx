import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ButtonGroup,
  Button,
  Paper,
  Stack,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  ShowChart as TrendIcon,
  BarChart as BarChartIcon,
  AreaChart as AreaChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  DateRange as DateRangeIcon,
  AccountBalanceWallet as WalletIcon,
  Circle as CircleIcon,
  Info as InfoIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Legend
} from 'recharts';
import { format, subDays, subMonths, subYears, parseISO, isValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import WalletLegend from './WalletLegend';

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

type ChartType = 'line' | 'area' | 'bar' | 'composed';
type DataView = 'cumulative' | 'daily' | 'comparison';
type TrendPeriod = '7days' | '30days' | '90days' | '1year' | 'custom';

interface ChartDataPoint {
  date: string;
  dateKey: string;
  income: number;
  outcome: number;
  net: number;
  cumulative: number;
  transactions: number;
}

interface TrendAnalysis {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  totalIncome: number;
  totalOutcome: number;
  netFlow: number;
  averageDaily: number;
  highestDay: { date: string; amount: number };
  lowestDay: { date: string; amount: number };
}

const BalanceTrendChart: React.FC<Props> = ({
  transactions,
  selectedCurrency,
  filterDate,
  customStartDate,
  customEndDate,
  wallets
}) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('line');
  const [dataView, setDataView] = useState<DataView>('cumulative');
  const [showGrid, setShowGrid] = useState(true);
  const [showDataPoints, setShowDataPoints] = useState(true);
  const [smoothCurve, setSmoothCurve] = useState(true);
  const [expandedView, setExpandedView] = useState(false);

  // Enhanced data processing
  const { chartData, trendAnalysis, isEmpty } = useMemo(() => {
    const now = new Date();
    
    // Filter transactions by date range
    const filteredTx = transactions
      .filter(tx => tx.createdAt)
      .filter(tx => {
        const txDate = new Date(tx.createdAt.toDate());

        if (filterDate === 'custom' && customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          return txDate >= start && txDate <= end;
        } else if (filterDate === '7days') {
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
      return { chartData: [], trendAnalysis: null, isEmpty: true };
    }

    // Group transactions by date
    const groupedByDate: Record<string, { income: number; outcome: number; transactions: Transaction[] }> = {};
    
    filteredTx.forEach(tx => {
      const dateKey = format(tx.createdAt.toDate(), 'yyyy-MM-dd');
      const displayDate = format(tx.createdAt.toDate(), 'dd MMM');
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { income: 0, outcome: 0, transactions: [] };
      }
      
      if (tx.type === 'income') {
        groupedByDate[dateKey].income += tx.amount || 0;
      } else if (tx.type === 'outcome') {
        groupedByDate[dateKey].outcome += tx.amount || 0;
      }
      
      groupedByDate[dateKey].transactions.push(tx);
    });

    // Create chart data points
    const sortedDates = Object.keys(groupedByDate).sort();
    let cumulativeBalance = 0;
    
    const data: ChartDataPoint[] = sortedDates.map(dateKey => {
      const dayData = groupedByDate[dateKey];
      const net = dayData.income - dayData.outcome;
      cumulativeBalance += net;
      
      return {
        date: format(parseISO(dateKey), 'dd MMM'),
        dateKey,
        income: dayData.income,
        outcome: dayData.outcome,
        net,
        cumulative: cumulativeBalance,
        transactions: dayData.transactions.length
      };
    });

    // Calculate trend analysis
    const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
    const totalOutcome = data.reduce((sum, d) => sum + d.outcome, 0);
    const netFlow = totalIncome - totalOutcome;
    const averageDaily = data.length > 0 ? netFlow / data.length : 0;
    
    const netValues = data.map(d => d.net);
    const maxNet = Math.max(...netValues);
    const minNet = Math.min(...netValues);
    
    const highestDay = data.find(d => d.net === maxNet) || data[0];
    const lowestDay = data.find(d => d.net === minNet) || data[0];
    
    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;
    
    if (data.length >= 2) {
      const firstValue = data[0].cumulative;
      const lastValue = data[data.length - 1].cumulative;
      const change = lastValue - firstValue;
      trendPercentage = firstValue !== 0 ? (change / Math.abs(firstValue)) * 100 : 0;
      
      if (Math.abs(trendPercentage) > 5) {
        trend = trendPercentage > 0 ? 'up' : 'down';
      }
    }

    const analysis: TrendAnalysis = {
      trend,
      percentage: Math.abs(trendPercentage),
      totalIncome,
      totalOutcome,
      netFlow,
      averageDaily,
      highestDay: { date: highestDay.date, amount: highestDay.net },
      lowestDay: { date: lowestDay.date, amount: lowestDay.net }
    };

    return { chartData: data, trendAnalysis: analysis, isEmpty: false };
  }, [transactions, selectedCurrency, filterDate, customStartDate, customEndDate]);

  const formatCurrency = useCallback((value: number) => {
    return value.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    });
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      default: return <TrendingFlatIcon color="info" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'info';
    }
  };

  const exportData = () => {
    const exportData = {
      period: filterDate,
      currency: selectedCurrency,
      analysis: trendAnalysis,
      data: chartData,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `balance-trend-${selectedCurrency}-${filterDate}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <Paper elevation={3} sx={{ p: 2, maxWidth: 250 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="success.main">Pemasukan:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(data.income)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="error.main">Pengeluaran:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(data.outcome)}
              </Typography>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Net Flow:</Typography>
              <Typography 
                variant="body2" 
                fontWeight="bold"
                color={data.net >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(data.net)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Kumulatif:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(data.cumulative)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {data.transactions} transaksi
            </Typography>
          </Stack>
        </Paper>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const chartColor = theme.palette.primary.main;
    const areaGradient = `url(#colorGradient)`;

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis dataKey="date" stroke="#666" />
            <YAxis tickFormatter={formatCurrency} stroke="#666" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type={smoothCurve ? "monotone" : "linear"}
              dataKey={dataView === 'cumulative' ? 'cumulative' : 'net'}
              stroke={chartColor}
              fillOpacity={1}
              fill={areaGradient}
              dot={showDataPoints}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis dataKey="date" stroke="#666" />
            <YAxis tickFormatter={formatCurrency} stroke="#666" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataView === 'cumulative' ? 'cumulative' : 'net'} 
              fill={chartColor}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis dataKey="date" stroke="#666" />
            <YAxis tickFormatter={formatCurrency} stroke="#666" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulative"
              fill={alpha(theme.palette.primary.main, 0.2)}
              stroke={theme.palette.primary.main}
            />
            <Bar dataKey="income" fill={theme.palette.success.main} />
            <Bar dataKey="outcome" fill={theme.palette.error.main} />
          </ComposedChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
            <XAxis dataKey="date" stroke="#666" />
            <YAxis tickFormatter={formatCurrency} stroke="#666" />
            <RechartsTooltip content={<CustomTooltip />} />
            <Line
              type={smoothCurve ? "monotone" : "linear"}
              dataKey={dataView === 'cumulative' ? 'cumulative' : 'net'}
              stroke={chartColor}
              strokeWidth={3}
              dot={showDataPoints}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );
    }
  };

  const filteredWallets = (selectedCurrency === 'all'
    ? wallets
    : wallets.filter(w => w.currency === selectedCurrency)
  ).filter(w => typeof w.balance === 'number' && w.balance > 0);

  return (
    <Card 
      elevation={2}
      sx={{ 
        mb: 3,
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <AnalyticsIcon />
          </Avatar>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              Trend Analisis Saldo
            </Typography>
            <Chip 
              label={selectedCurrency === 'all' ? 'Semua Mata Uang' : selectedCurrency}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        }
        subheader={
          !isEmpty && trendAnalysis && (
            <Box display="flex" alignItems="center" gap={1}>
              {getTrendIcon(trendAnalysis.trend)}
              <Typography variant="body2" color="text.secondary">
                Trend {trendAnalysis.trend === 'up' ? 'naik' : trendAnalysis.trend === 'down' ? 'turun' : 'stabil'}
                {trendAnalysis.percentage > 0 && ` ${trendAnalysis.percentage.toFixed(1)}%`}
              </Typography>
            </Box>
          )
        }
        action={
          <Box display="flex" gap={0.5}>
            <Tooltip title="Layar Penuh">
              <IconButton 
                size="small" 
                onClick={() => setExpandedView(!expandedView)}
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton size="small" onClick={exportData} disabled={isEmpty}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />

      <CardContent>
        {isEmpty ? (
          <Alert severity="info" sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2">
              Tidak ada data transaksi untuk periode dan mata uang yang dipilih.
            </Typography>
          </Alert>
        ) : (
          <>
            {/* Controls */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Jenis Chart</InputLabel>
                    <Select
                      value={chartType}
                      label="Jenis Chart"
                      onChange={(e) => setChartType(e.target.value as ChartType)}
                    >
                      <MenuItem value="line">
                        <Box display="flex" alignItems="center" gap={1}>
                          <TrendIcon fontSize="small" />
                          Line Chart
                        </Box>
                      </MenuItem>
                      <MenuItem value="area">
                        <Box display="flex" alignItems="center" gap={1}>
                          <AreaChartIcon fontSize="small" />
                          Area Chart
                        </Box>
                      </MenuItem>
                      <MenuItem value="bar">
                        <Box display="flex" alignItems="center" gap={1}>
                          <BarChartIcon fontSize="small" />
                          Bar Chart
                        </Box>
                      </MenuItem>
                      <MenuItem value="composed">
                        <Box display="flex" alignItems="center" gap={1}>
                          <TimelineIcon fontSize="small" />
                          Combined
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Data View</InputLabel>
                    <Select
                      value={dataView}
                      label="Data View"
                      onChange={(e) => setDataView(e.target.value as DataView)}
                    >
                      <MenuItem value="cumulative">Kumulatif</MenuItem>
                      <MenuItem value="daily">Harian</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Grid"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showDataPoints}
                          onChange={(e) => setShowDataPoints(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Titik Data"
                    />
                    {(chartType === 'line' || chartType === 'area') && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={smoothCurve}
                            onChange={(e) => setSmoothCurve(e.target.checked)}
                            size="small"
                          />
                        }
                        label="Kurva Halus"
                      />
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Trend Analysis Summary */}
            {trendAnalysis && (
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  📊 Ringkasan Analisis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight="bold" color="success.main">
                        {formatCurrency(trendAnalysis.totalIncome)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Pemasukan
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight="bold" color="error.main">
                        {formatCurrency(trendAnalysis.totalOutcome)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Pengeluaran
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography 
                        variant="h6" 
                        fontWeight="bold"
                        color={trendAnalysis.netFlow >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(trendAnalysis.netFlow)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Net Flow
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {formatCurrency(trendAnalysis.averageDaily)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rata-rata Harian
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* Chart */}
            <Box sx={{ width: '100%', height: expandedView ? 500 : 300, mb: 3 }}>
              <ResponsiveContainer>
                {renderChart()}
              </ResponsiveContainer>
            </Box>

            {/* Wallet Legend */}
            <WalletLegend wallets={filteredWallets} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceTrendChart;