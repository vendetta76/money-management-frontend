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
  useTheme
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
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Process data
  const { chartData, isEmpty } = useMemo(() => {
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
      return { chartData: [], isEmpty: true };
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
        date: format(parseISO(dateKey), 'dd/MM'),
        dateKey,
        income: dayData.income,
        outcome: dayData.outcome,
        net,
        cumulative: cumulativeBalance
      };
    });

    return { chartData: data, isEmpty: false };
  }, [transactions, selectedCurrency, filterDate]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <Paper elevation={3} sx={{ p: 2, maxWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="success.main">
            Masuk: {formatCurrency(data.income)}
          </Typography>
          <Typography variant="body2" color="error.main">
            Keluar: {formatCurrency(data.outcome)}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            Saldo: {formatCurrency(data.cumulative)}
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
      {/* Simple Controls */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Chart */}
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis tickFormatter={formatCurrency} stroke="#666" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis tickFormatter={formatCurrency} stroke="#666" />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>

      {/* Simple Stats */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.income, 0))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Masuk
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" color="error.main">
              {formatCurrency(chartData.reduce((sum, d) => sum + d.outcome, 0))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Keluar
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {formatCurrency(chartData[chartData.length - 1]?.cumulative || 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Saldo Akhir
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BalanceTrendChart;