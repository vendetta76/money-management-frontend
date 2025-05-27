import React, { useState } from "react";
import {
  Box,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Stack,
  Paper,
  Avatar,
  Badge,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade
} from "@mui/material";
import {
  Circle as CircleIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalanceWallet as WalletIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon
} from "@mui/icons-material";

interface Wallet {
  id: string;
  name: string;
  balance?: number;
  currency?: string;
  isSaving?: boolean;
}

interface Props {
  wallets: Wallet[];
  colors?: string[];
  showBalances?: boolean;
  showCurrency?: boolean;
  variant?: 'compact' | 'detailed' | 'card';
  title?: string;
}

const DEFAULT_COLORS = ['#10B981', '#EF4444', '#6366F1', '#F59E0B', '#06B6D4', '#8B5CF6', '#F97316', '#84CC16'];

const WalletLegend: React.FC<Props> = ({ 
  wallets, 
  colors = DEFAULT_COLORS,
  showBalances = false,
  showCurrency = true,
  variant = 'compact',
  title = 'Wallet Legend'
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(true);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [hideZeroBalance, setHideZeroBalance] = useState(false);

  // Filter wallets based on settings
  const filteredWallets = wallets.filter(wallet => {
    if (hideZeroBalance && (!wallet.balance || wallet.balance <= 0)) {
      return false;
    }
    return true;
  });

  // ✅ FIXED: Updated formatCurrency to handle crypto currencies
  const formatCurrency = (amount: number = 0, currency: string = 'IDR') => {
    // List of valid ISO currency codes
    const validIsoCurrencies = ['USD', 'EUR', 'IDR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD'];
    
    // Check if it's a valid ISO currency
    if (validIsoCurrencies.includes(currency?.toUpperCase())) {
      return amount.toLocaleString('id-ID', {
        style: 'currency',
        currency: currency,
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
    
    return `${symbol} ${amount.toLocaleString('id-ID', {
      maximumFractionDigits: 2
    })}`;
  };

  const getTotalBalance = () => {
    return filteredWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
  };

  const getSavingsCount = () => {
    return filteredWallets.filter(wallet => wallet.isSaving).length;
  };

  // Compact variant (original functionality enhanced)
  const CompactVariant = () => (
    <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
      {filteredWallets.map((wallet, index) => (
        <Fade key={wallet.id} in={true} timeout={300 + index * 100}>
          <Chip
            icon={
              <CircleIcon 
                sx={{ 
                  color: colors[index % colors.length],
                  fontSize: 16
                }} 
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="body2" fontWeight="medium">
                  {wallet.name}
                </Typography>
                {wallet.isSaving && (
                  <SavingsIcon fontSize="small" sx={{ opacity: 0.7 }} />
                )}
                {showCurrency && wallet.currency && (
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    ({wallet.currency})
                  </Typography>
                )}
              </Box>
            }
            variant="outlined"
            size="small"
            sx={{
              borderColor: colors[index % colors.length],
              '&:hover': {
                bgcolor: alpha(colors[index % colors.length], 0.1),
                borderColor: colors[index % colors.length],
              }
            }}
          />
        </Fade>
      ))}
    </Box>
  );

  // Detailed variant with more information
  const DetailedVariant = () => (
    <Stack spacing={1}>
      {filteredWallets.map((wallet, index) => (
        <Fade key={wallet.id} in={true} timeout={300 + index * 100}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: alpha(colors[index % colors.length], 0.05),
              border: `1px solid ${alpha(colors[index % colors.length], 0.2)}`,
              '&:hover': {
                bgcolor: alpha(colors[index % colors.length], 0.1),
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  bgcolor: colors[index % colors.length],
                  width: 32,
                  height: 32
                }}
              >
                <WalletIcon fontSize="small" />
              </Avatar>
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {wallet.name}
                  </Typography>
                  {wallet.isSaving && (
                    <Chip 
                      label="Saving" 
                      size="small" 
                      color="success"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                {showCurrency && wallet.currency && (
                  <Typography variant="caption" color="text.secondary">
                    Currency: {wallet.currency}
                  </Typography>
                )}
              </Box>
            </Box>
            
            {showBalances && wallet.balance !== undefined && (
              <Box textAlign="right">
                <Typography variant="subtitle2" fontWeight="bold">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Balance
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      ))}
    </Stack>
  );

  // Card variant with full statistics
  const CardVariant = () => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <WalletIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Badge badgeContent={filteredWallets.length} color="primary" />
          </Box>
          
          <Box display="flex" gap={1}>
            <Tooltip title="Toggle Details">
              <IconButton
                size="small"
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
        </Box>

        {/* Quick Stats */}
        <Box mb={2}>
          <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold" color="primary">
                {filteredWallets.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Wallets
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {getSavingsCount()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Savings Wallets
              </Typography>
            </Box>
            {showBalances && (
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  {formatCurrency(getTotalBalance())}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Balance
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Controls */}
        <Collapse in={expanded}>
          <Box mb={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <FormControlLabel
                control={
                  <Switch
                    checked={!hideZeroBalance}
                    onChange={(e) => setHideZeroBalance(!e.target.checked)}
                    size="small"
                  />
                }
                label="Show Zero Balance"
              />
              {showBalances && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={showOnlyActive}
                      onChange={(e) => setShowOnlyActive(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Active Only"
                />
              )}
            </Stack>
          </Box>
        </Collapse>

        {/* Wallet List */}
        <Collapse in={expanded}>
          <DetailedVariant />
        </Collapse>

        {/* Collapsed view */}
        <Collapse in={!expanded}>
          <CompactVariant />
        </Collapse>
      </CardContent>
    </Card>
  );

  // Handle empty wallets
  if (!wallets || wallets.length === 0) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
          <WalletIcon color="info" />
          <Typography variant="body2" color="info.main" fontWeight="medium">
            No wallets available
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Add some wallets to see the legend
        </Typography>
      </Paper>
    );
  }

  // Handle filtered empty results
  if (filteredWallets.length === 0) {
    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
          <VisibilityOffIcon color="warning" />
          <Typography variant="body2" color="warning.main" fontWeight="medium">
            No wallets match current filters
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Adjust your filter settings to see wallets
        </Typography>
      </Paper>
    );
  }

  // Render based on variant
  switch (variant) {
    case 'detailed':
      return <DetailedVariant />;
    case 'card':
      return <CardVariant />;
    default:
      return <CompactVariant />;
  }
};

export default WalletLegend;