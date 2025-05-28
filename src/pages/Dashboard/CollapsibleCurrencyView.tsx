import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  IconButton,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Divider,
  Paper,
  Stack,
  Alert,
  Avatar,
  ListItemIcon,
  Badge,
  useTheme,
  alpha,
  Fade,
  ButtonGroup
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoAwesome as AutoIcon,
  Settings as SettingsIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  Calculate as CalculatorIcon,
  AttachMoney as CurrencyIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  ViewComfy as CompactViewIcon,
  Star as StarIcon,
  Check as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  balance: number;
  walletCount: number;
  type: 'fiat' | 'crypto' | 'custom' | 'unknown';
}

interface CollapsibleCurrencyViewProps {
  availableCurrencies: Currency[];
  displayCurrency: string;
  onCurrencyChange: (currency: string) => void;
  smartDefaultCurrency?: string;
  preferenceSource?: 'user' | 'auto' | 'default';
  totalBalance: number;
  onAutoSelect?: () => void;
  showSaveIndicator?: boolean;
}

type ViewMode = 'compact' | 'detailed' | 'grid';

// Currency formatting function with proper TypeScript types
const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  const currencyFormats: Record<string, (val: number) => string> = {
    'USD': (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'EUR': (val: number) => `€${val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'JPY': (val: number) => `¥${val.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`,
    'GBP': (val: number) => `£${val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'THB': (val: number) => `฿${val.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'CNY': (val: number) => `¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'INR': (val: number) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'TWD': (val: number) => `NT$${val.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'IDR': (val: number) => `Rp${val.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`,
    'USDT': (val: number) => `USDT ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
  };
  
  return currencyFormats[currency] ? currencyFormats[currency](amount) : `${currency} ${amount.toLocaleString()}`;
};

const CollapsibleCurrencyView: React.FC<CollapsibleCurrencyViewProps> = ({
  availableCurrencies,
  displayCurrency,
  onCurrencyChange,
  smartDefaultCurrency,
  preferenceSource = 'default',
  totalBalance,
  onAutoSelect,
  showSaveIndicator = false
}) => {
  const theme = useTheme();
  const [showAllCurrencies, setShowAllCurrencies] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState<boolean>(false);

  // Filter currencies based on preferences
  const filteredCurrencies = useMemo(() => {
    return showOnlyWithBalance 
      ? availableCurrencies.filter(c => c.balance > 0)
      : availableCurrencies;
  }, [availableCurrencies, showOnlyWithBalance]);

  // Sort currencies: current first, then by balance, then by type
  const sortedCurrencies = useMemo(() => {
    return [...filteredCurrencies].sort((a, b) => {
      if (a.code === displayCurrency) return -1;
      if (b.code === displayCurrency) return 1;
      if (b.balance !== a.balance) return b.balance - a.balance;
      if (a.type === 'fiat' && b.type === 'crypto') return -1;
      if (a.type === 'crypto' && b.type === 'fiat') return 1;
      return a.code.localeCompare(b.code);
    });
  }, [filteredCurrencies, displayCurrency]);

  const activeCurrencies = availableCurrencies.filter(c => c.balance > 0);
  const currentCurrency = availableCurrencies.find(c => c.code === displayCurrency);

  const getStatusColor = (): 'primary' | 'success' | 'default' => {
    switch (preferenceSource) {
      case 'user': return 'primary';
      case 'auto': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (): string => {
    switch (preferenceSource) {
      case 'user': return '👤';
      case 'auto': return '🤖';
      default: return '⚙️';
    }
  };

  const getStatusLabel = (): string => {
    switch (preferenceSource) {
      case 'user': return 'User Preference';
      case 'auto': return 'Auto Selected';
      default: return 'Default';
    }
  };

  // Quick currency selector (top currencies)
  const quickCurrencies = sortedCurrencies.slice(0, 4);
  const remainingCount = Math.max(0, sortedCurrencies.length - 4);

  return (
    <Box>
      {/* Current Currency Display - Always Visible */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          mb: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          }}
        />
        
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} sm={8}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 48,
                  height: 48
                }}
              >
                <CurrencyIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {currentCurrency?.symbol} {displayCurrency}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                  {currentCurrency?.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip 
                    label={getStatusLabel()}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      '& .MuiChip-label': { fontWeight: 'bold' }
                    }}
                    icon={<span style={{ fontSize: '14px' }}>{getStatusIcon()}</span>}
                  />
                  {showSaveIndicator && (
                    <SaveIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  )}
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                {formatCurrency(totalBalance, displayCurrency)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Current Balance
              </Typography>
              <Box display="flex" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} gap={1} mt={1}>
                <Chip 
                  label={`${activeCurrencies.length} Active`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                />
                <Chip 
                  label={`${availableCurrencies.length} Total`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Currency Selector */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Quick Currency Switch
            </Typography>
            <Box display="flex" gap={1}>
              {onAutoSelect && smartDefaultCurrency && smartDefaultCurrency !== displayCurrency && (
                <Tooltip title={`Auto-select ${smartDefaultCurrency} (highest balance)`}>
                  <IconButton 
                    size="small"
                    onClick={onAutoSelect}
                    sx={{ 
                      border: 1, 
                      borderColor: 'success.main',
                      '&:hover': { bgcolor: 'success.light', color: 'white' }
                    }}
                  >
                    <AutoIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={showAllCurrencies ? "Show less" : "Show all currencies"}>
                <IconButton 
                  size="small"
                  onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                  sx={{ 
                    border: 1, 
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.light', color: 'white' }
                  }}
                >
                  {showAllCurrencies ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Quick Currency Buttons */}
          <Grid container spacing={1}>
            {quickCurrencies.map((currency) => (
              <Grid item xs={6} sm={3} key={currency.code}>
                <Button
                  variant={currency.code === displayCurrency ? 'contained' : 'outlined'}
                  onClick={() => onCurrencyChange(currency.code)}
                  fullWidth
                  size="small"
                  sx={{ 
                    p: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    height: 'auto',
                    textAlign: 'left'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} width="100%">
                    <Typography variant="body2" fontWeight="bold">
                      {currency.symbol}
                    </Typography>
                    <Typography variant="body2">
                      {currency.code}
                    </Typography>
                    {currency.code === displayCurrency && (
                      <CheckIcon sx={{ fontSize: 16, ml: 'auto' }} />
                    )}
                  </Box>
                  <Typography 
                    variant="caption" 
                    color={currency.code === displayCurrency ? 'inherit' : 'text.secondary'}
                    sx={{ mt: 0.5 }}
                  >
                    {currency.balance > 0 ? formatCurrency(currency.balance, currency.code) : 'Empty'}
                  </Typography>
                </Button>
              </Grid>
            ))}
            
            {remainingCount > 0 && (
              <Grid item xs={12}>
                <Button
                  variant="text"
                  onClick={() => setShowAllCurrencies(true)}
                  size="small"
                  startIcon={<ExpandMoreIcon />}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  +{remainingCount} More Currencies
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Expanded Currency View */}
      <Collapse in={showAllCurrencies}>
        <Card elevation={1}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                All Currencies ({filteredCurrencies.length})
              </Typography>
              
              <Box display="flex" gap={1} alignItems="center">
                {/* Filter Toggle */}
                <Button
                  size="small"
                  variant={showOnlyWithBalance ? 'contained' : 'outlined'}
                  onClick={() => setShowOnlyWithBalance(!showOnlyWithBalance)}
                  startIcon={<StarIcon />}
                >
                  With Balance Only
                </Button>
                
                {/* View Mode Selector */}
                <ButtonGroup size="small">
                  <Button
                    variant={viewMode === 'compact' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('compact')}
                    startIcon={<CompactViewIcon />}
                  >
                    Compact
                  </Button>
                  <Button
                    variant={viewMode === 'detailed' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('detailed')}
                    startIcon={<ListViewIcon />}
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('grid')}
                    startIcon={<GridViewIcon />}
                  >
                    Cards
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>

            {/* Compact View */}
            {viewMode === 'compact' && (
              <Grid container spacing={1}>
                {sortedCurrencies.map((currency) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={currency.code}>
                    <Button
                      variant={currency.code === displayCurrency ? 'contained' : 'outlined'}
                      onClick={() => onCurrencyChange(currency.code)}
                      fullWidth
                      size="small"
                      sx={{ 
                        p: 1,
                        flexDirection: 'column',
                        height: 64,
                        position: 'relative'
                      }}
                    >
                      {currency.balance > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main'
                          }}
                        />
                      )}
                      <Typography variant="body2" fontWeight="bold">
                        {currency.code}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {currency.balance > 0 ? formatCurrency(currency.balance, currency.code) : 'Empty'}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Detailed List View */}
            {viewMode === 'detailed' && (
              <List>
                {sortedCurrencies.map((currency, index) => (
                  <React.Fragment key={currency.code}>
                    <ListItem
                      button
                      selected={currency.code === displayCurrency}
                      onClick={() => onCurrencyChange(currency.code)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          borderLeft: 4,
                          borderLeftColor: 'primary.main'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: currency.type === 'crypto' ? 'warning.main' : 'primary.main'
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            {currency.symbol}
                          </Typography>
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {currency.code}
                            </Typography>
                            <Chip 
                              label={currency.type}
                              size="small"
                              color={currency.type === 'crypto' ? 'warning' : 'primary'}
                              variant="outlined"
                            />
                            {currency.balance > 0 && (
                              <Badge 
                                badgeContent="●" 
                                color="success"
                                sx={{ '& .MuiBadge-badge': { fontSize: 8 } }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {currency.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {currency.walletCount} wallet{currency.walletCount !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Box textAlign="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {formatCurrency(currency.balance, currency.code)}
                          </Typography>
                          {currency.balance === 0 && (
                            <Typography variant="caption" color="error.main">
                              Empty
                            </Typography>
                          )}
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < sortedCurrencies.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {/* Grid Card View */}
            {viewMode === 'grid' && (
              <Grid container spacing={2}>
                {sortedCurrencies.map((currency) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={currency.code}>
                    <Card 
                      elevation={currency.code === displayCurrency ? 4 : 1}
                      sx={{ 
                        cursor: 'pointer',
                        border: currency.code === displayCurrency ? 2 : 1,
                        borderColor: currency.code === displayCurrency ? 'primary.main' : 'divider',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          elevation: 3,
                          transform: 'translateY(-2px)'
                        },
                        position: 'relative'
                      }}
                      onClick={() => onCurrencyChange(currency.code)}
                    >
                      {currency.balance > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            zIndex: 1
                          }}
                        />
                      )}
                      
                      <CardContent sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="h5" fontWeight="bold">
                            {currency.symbol}
                          </Typography>
                          <Chip 
                            label={currency.type}
                            size="small"
                            color={currency.type === 'crypto' ? 'warning' : 'primary'}
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          {currency.name}
                        </Typography>
                        
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          color={currency.code === displayCurrency ? 'primary.main' : 'text.primary'}
                          sx={{ mb: 1 }}
                        >
                          {formatCurrency(currency.balance, currency.code)}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary">
                          {currency.walletCount} wallet{currency.walletCount !== 1 ? 's' : ''}
                        </Typography>
                        
                        {currency.code === displayCurrency && (
                          <Box display="flex" justifyContent="center" mt={1}>
                            <CheckIcon color="primary" />
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Summary Stats */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {availableCurrencies.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Currencies
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {activeCurrencies.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      With Balance
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="info.main">
                      {availableCurrencies.filter(c => c.type === 'fiat').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fiat Currencies
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight="bold" color="warning.main">
                      {availableCurrencies.filter(c => c.type === 'crypto').length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cryptocurrencies
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      {/* Smart Selection Hint */}
      {!showAllCurrencies && preferenceSource === 'auto' && smartDefaultCurrency && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon />
            <Typography variant="body2">
              💡 Auto-selected <strong>{displayCurrency}</strong> as it has the highest balance. 
              Your preference will be saved when you manually change it.
            </Typography>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default CollapsibleCurrencyView;