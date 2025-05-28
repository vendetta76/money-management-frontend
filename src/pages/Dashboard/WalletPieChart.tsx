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
  useMediaQuery,
  alpha,
  Collapse,
  Button
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
  Circle as CircleIcon,
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  BarChart as BarChartIcon
} from "@mui/icons-material";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

// 🚀 CLEANED UP: Use centralized currency formatting
import { formatCurrency, isCryptoCurrency } from '../helpers/formatCurrency';

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

type ViewMode = 'pie' | 'donut' | 'bar' | 'list';
type ColorScheme = 'default' | 'pastel' | 'vibrant';

const COLOR_SCHEMES = {
  default: ['#1976d2', '#dc004e', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'],
  pastel: ['#ffcdd2', '#f8bbd9', '#e1bee7', '#d1c4e9', '#c5cae9', '#bbdefb', '#b3e5fc', '#b2ebf2'],
  vibrant: ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4']
};

const WalletPieChart: React.FC<Props> = ({ wallets, selectedCurrency }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'list' : 'pie');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default');
  const [showPercentages, setShowPercentages] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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
        fontSize={isMobile ? "10" : "12"}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // Mobile List View
  const MobileListView = () => (
    <Stack spacing={1}>
      {filteredWallets.map((wallet, index) => {
        const percentage = getPercentage(wallet.balance);
        const isSelected = selectedSlice === wallet.id;
        
        return (
          <Paper 
            key={wallet.id}
            elevation={isSelected ? 3 : 1}
            sx={{
              p: 2,
              cursor: 'pointer',
              bgcolor: isSelected ? alpha(colors[index % colors.length], 0.1) : 'background.paper',
              border: isSelected ? `2px solid ${colors[index % colors.length]}` : 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                elevation: 2,
                bgcolor: alpha(colors[index % colors.length], 0.05)
              }
            }}
            onClick={() => setSelectedSlice(isSelected ? null : wallet.id)}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <CircleIcon 
                sx={{ 
                  color: colors[index % colors.length],
                  fontSize: 16
                }} 
              />
              
              <Box sx={{ flex: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {wallet.name}
                  </Typography>
                  <Chip
                    label={`${percentage}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="h6" color="primary.main" sx={{ mb: 0.5 }}>
                  {formatCurrency(wallet.balance, wallet.currency)}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    {wallet.currency}
                  </Typography>
                  {wallet.isSaving && (
                    <Chip 
                      label="Tabungan" 
                      size="small" 
                      color="success"
                      variant="outlined"
                      sx={{ fontSize: '0.6rem', height: 16 }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );

  // Chart Views
  const ChartView = () => (
    <Box>
      {/* Chart Container */}
      <Box sx={{ height: { xs: 250, sm: 300 }, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'bar' ? (
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis fontSize={12} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={theme.palette.primary.main} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={showPercentages ? renderCustomLabel : false}
                outerRadius={isMobile ? 80 : 100}
                innerRadius={viewMode === 'donut' ? (isMobile ? 30 : 40) : 0}
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
          )}
        </ResponsiveContainer>
      </Box>

      {/* Legend for Charts */}
      <Paper elevation={1} sx={{ bgcolor: 'grey.50', maxHeight: 200, overflow: 'auto' }}>
        <List dense>
          {filteredWallets.map((wallet, index) => {
            const percentage = getPercentage(wallet.balance);
            const isSelected = selectedSlice === wallet.id;
            
            return (
              <ListItem
                key={wallet.id}
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
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CircleIcon 
                    sx={{ 
                      color: colors[index % colors.length],
                      fontSize: 14
                    }} 
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {wallet.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {wallet.currency} • {percentage}%
                    </Typography>
                  }
                />

                <ListItemSecondaryAction>
                  <Typography 
                    variant="caption" 
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {formatCurrency(wallet.balance, wallet.currency)}
                  </Typography>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </Paper>
    </Box>
  );

  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <WalletIcon />
          </Avatar>
        }
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight="bold">
              {isMobile ? 'Wallet' : 'Distribusi Wallet'}
            </Typography>
            {!isEmpty && (
              <Chip 
                label={`${filteredWallets.length} wallet${filteredWallets.length !== 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        }
        subheader={
          !isEmpty && !isSmallMobile && (
            <Typography variant="body2" color="text.secondary">
              Total: {formatCurrency(totalBalance, selectedCurrency === 'all' ? 'IDR' : selectedCurrency)}
            </Typography>
          )
        }
        action={
          <Box display="flex" gap={0.5}>
            {!isSmallMobile && (
              <Tooltip title="Export Data">
                <IconButton size="small" onClick={exportData} disabled={isEmpty}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Settings">
              <IconButton 
                size="small"
                onClick={() => setShowSettings(!showSettings)}
                color={showSettings ? 'primary' : 'default'}
              >
                <SettingsIcon />
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
            sx={{ height: { xs: 200, sm: 250 }, textAlign: 'center' }}
          >
            <WalletIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
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
          <Box>
            {/* Mobile Total Display */}
            {isMobile && (
              <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Balance
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {formatCurrency(totalBalance, selectedCurrency === 'all' ? 'IDR' : selectedCurrency)}
                </Typography>
              </Paper>
            )}

            {/* View Controls - Collapsible on Mobile */}
            <Collapse in={showSettings}>
              <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                  Display Options
                </Typography>
                
                {isMobile ? (
                  <Stack spacing={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>View Mode</InputLabel>
                      <Select
                        value={viewMode}
                        label="View Mode"
                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                      >
                        <MenuItem value="list">
                          <Box display="flex" alignItems="center" gap={1}>
                            <ViewIcon fontSize="small" />
                            List View
                          </Box>
                        </MenuItem>
                        <MenuItem value="pie">
                          <Box display="flex" alignItems="center" gap={1}>
                            <PieChartIcon fontSize="small" />
                            Pie Chart
                          </Box>
                        </MenuItem>
                        <MenuItem value="donut">
                          <Box display="flex" alignItems="center" gap={1}>
                            <DonutIcon fontSize="small" />
                            Donut Chart
                          </Box>
                        </MenuItem>
                        <MenuItem value="bar">
                          <Box display="flex" alignItems="center" gap={1}>
                            <BarChartIcon fontSize="small" />
                            Bar Chart
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" fullWidth>
                      <InputLabel>Color Scheme</InputLabel>
                      <Select
                        value={colorScheme}
                        label="Color Scheme"
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
                      label="Show Percentages"
                    />
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
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
                        <MenuItem value="bar">
                          <Box display="flex" alignItems="center" gap={1}>
                            <BarChartIcon fontSize="small" />
                            Bar
                          </Box>
                        </MenuItem>
                        <MenuItem value="list">
                          <Box display="flex" alignItems="center" gap={1}>
                            <ViewIcon fontSize="small" />
                            List
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <InputLabel>Colors</InputLabel>
                      <Select
                        value={colorScheme}
                        label="Colors"
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
                      label="Percentages"
                    />
                  </Stack>
                )}
              </Paper>
            </Collapse>

            {/* Main Content */}
            {viewMode === 'list' ? <MobileListView /> : <ChartView />}

            {/* Summary Stats */}
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {filteredWallets.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Wallets
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {filteredWallets.filter(w => w.isSaving).length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Savings
                    </Typography>
                  </Box>
                </Grid>
                {!isSmallMobile && (
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {new Set(filteredWallets.map(w => w.currency)).size}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Currencies
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletPieChart;