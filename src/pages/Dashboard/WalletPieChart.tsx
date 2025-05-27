import React, { useState, useMemo } from "react";
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
  Switch,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  Stack,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Fade,
  useTheme,
  alpha
} from "@mui/material";
import {
  PieChart as PieChartIcon,
  DonutLarge as DonutIcon,
  AccountBalanceWallet as WalletIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Palette as PaletteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Circle as CircleIcon
} from "@mui/icons-material";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isSaving?: boolean;
}

interface Props {
  wallets: Wallet[];
  selectedCurrency: string;
}

type ViewMode = 'pie' | 'donut';
type ColorScheme = 'default' | 'pastel' | 'vibrant';

const COLOR_SCHEMES = {
  default: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'],
  pastel: ['#ffcdd2', '#f8bbd9', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2'],
  vibrant: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']
};

const WalletPieChart: React.FC<Props> = ({ wallets, selectedCurrency }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('pie');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [showPercentages, setShowPercentages] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  // Filter and prepare data
  const { filteredWallets, pieData, totalBalance, isEmpty } = useMemo(() => {
    const cleanedWallets = wallets.filter(w => typeof w.balance === 'number' && w.balance > 0);
    const filtered = selectedCurrency === 'all'
      ? cleanedWallets
      : cleanedWallets.filter(w => w.currency === selectedCurrency);

    const data = filtered.map(wallet => ({
      id: wallet.id,
      name: wallet.name,
      value: wallet.balance,
      currency: wallet.currency,
      isSaving: wallet.isSaving || false
    }));

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return {
      filteredWallets: filtered,
      pieData: data,
      totalBalance: total,
      isEmpty: data.length === 0
    };
  }, [wallets, selectedCurrency]);

  const colors = COLOR_SCHEMES[colorScheme];

  // ✅ FIXED: Updated formatCurrency to handle crypto currencies
  const formatCurrency = (value: number, currency?: string) => {
    // List of valid ISO currency codes
    const validIsoCurrencies = ['USD', 'EUR', 'IDR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD'];
    
    // Check if it's a valid ISO currency
    if (validIsoCurrencies.includes(currency?.toUpperCase())) {
      return value.toLocaleString('id-ID', {
        style: 'currency',
        currency: currency || 'IDR',
        maximumFractionDigits: currency === 'IDR' ? 0 : 2
      });
    }
    
    // Handle cryptocurrencies and other non-ISO currencies
    const cryptoSymbols = {
      'USDT': '$',
      'BTC': '₿',
      'ETH': 'Ξ',
      'BNB': 'BNB',
      'USDC': '$',
    };
    
    const symbol = cryptoSymbols[currency?.toUpperCase()] || currency || '';
    
    return `${symbol} ${value.toLocaleString('id-ID', {
      maximumFractionDigits: 2
    })}`;
  };

  const getPercentage = (value: number) => {
    return totalBalance > 0 ? ((value / totalBalance) * 100).toFixed(1) : '0';
  };

  const handleSliceClick = (data: any, index: number) => {
    setSelectedSlice(selectedSlice === data.id ? null : data.id);
  };

  const exportData = () => {
    const exportData = {
      currency: selectedCurrency,
      totalBalance,
      wallets: pieData.map(item => ({
        name: item.name,
        balance: item.value,
        percentage: getPercentage(item.value),
        currency: item.currency,
        isSaving: item.isSaving
      })),
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `wallet-distribution-${selectedCurrency}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper elevation={3} sx={{ p: 2, maxWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Saldo: {formatCurrency(data.value, data.currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Persentase: {getPercentage(data.value)}%
          </Typography>
          {data.isSaving && (
            <Chip label="Tabungan" size="small" color="success" sx={{ mt: 1 }} />
          )}
        </Paper>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (!showPercentages) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
            <PieChartIcon />
          </Avatar>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              Distribusi Wallet
            </Typography>
            {!isEmpty && (
              <Chip 
                label={`${filteredWallets.length} wallet`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        }
        subheader={
          !isEmpty && (
            <Typography variant="body2" color="text.secondary">
              Total: {formatCurrency(totalBalance, selectedCurrency === 'all' ? 'IDR' : selectedCurrency)}
            </Typography>
          )
        }
        action={
          <Box display="flex" gap={0.5}>
            <Tooltip title="Pengaturan Tampilan">
              <IconButton size="small">
                <PaletteIcon />
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

      <CardContent sx={{ flex: 1, pt: 0 }}>
        {isEmpty ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            sx={{ height: 250, textAlign: 'center' }}
          >
            <WalletIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Alert severity="info" sx={{ maxWidth: 300 }}>
              <Typography variant="body2">
                {selectedCurrency === 'all' 
                  ? 'Tidak ada wallet dengan saldo positif.'
                  : `Tidak ada wallet dengan mata uang ${selectedCurrency}.`
                }
              </Typography>
            </Alert>
          </Box>
        ) : (
          <>
            {/* View Controls */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Mode</InputLabel>
                  <Select
                    value={viewMode}
                    label="Mode"
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                  >
                    <MenuItem value="pie">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PieChartIcon fontSize="small" />
                        Pie
                      </Box>
                    </MenuItem>
                    <MenuItem value="donut">
                      <Box display="flex" alignItems="center" gap={1}>
                        <DonutIcon fontSize="small" />
                        Donut
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Warna</InputLabel>
                  <Select
                    value={colorScheme}
                    label="Warna"
                    onChange={(e) => setColorScheme(e.target.value as ColorScheme)}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="pastel">Pastel</MenuItem>
                    <MenuItem value="vibrant">Vibrant</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showPercentages}
                      onChange={(e) => setShowPercentages(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Persentase"
                />
              </Stack>
            </Box>

            {/* Pie Chart */}
            <Box sx={{ height: 300, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={showPercentages ? renderCustomLabel : false}
                    outerRadius={100}
                    innerRadius={viewMode === 'donut' ? 40 : 0}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={animationEnabled ? 800 : 0}
                    onClick={handleSliceClick}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[index % colors.length]} 
                        stroke={selectedSlice === entry.id ? theme.palette.common.white : 'none'}
                        strokeWidth={selectedSlice === entry.id ? 3 : 0}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Wallet Legend/List */}
            <Paper elevation={1} sx={{ bgcolor: 'grey.50' }}>
              <List dense>
                {filteredWallets.map((wallet, index) => {
                  const percentage = getPercentage(wallet.balance);
                  const isSelected = selectedSlice === wallet.id;
                  
                  return (
                    <Fade key={wallet.id} in={true} timeout={300 + index * 100}>
                      <ListItem
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor: isSelected ? alpha(colors[index % colors.length], 0.1) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha(colors[index % colors.length], 0.05)
                          }
                        }}
                        onClick={() => setSelectedSlice(isSelected ? null : wallet.id)}
                      >
                        <ListItemIcon>
                          <CircleIcon 
                            sx={{ 
                              color: colors[index % colors.length],
                              fontSize: 16
                            }} 
                          />
                        </ListItemIcon>
                        
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {wallet.name}
                              </Typography>
                              {wallet.isSaving && (
                                <Chip 
                                  label="Tabungan" 
                                  size="small" 
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {wallet.currency} • {percentage}% dari total
                            </Typography>
                          }
                        />

                        <ListItemSecondaryAction>
                          <Box textAlign="right">
                            <Typography variant="subtitle2" fontWeight="bold">
                              {formatCurrency(wallet.balance, wallet.currency)}
                            </Typography>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Fade>
                  );
                })}
              </List>
            </Paper>

            {/* Summary Stats */}
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {filteredWallets.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Wallet
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {filteredWallets.filter(w => w.isSaving).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Wallet Tabungan
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletPieChart;