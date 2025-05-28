import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Collapse,
  LinearProgress,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Chip,
  Alert,
  Divider,
  Avatar,
  ListItemIcon,
  ListItemText,
  Stack,
  Paper
} from '@mui/material';
import {
  Calculate as CalculatorIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  AutoAwesome as AutoIcon,
  AttachMoney as CurrencyIcon,
  AccountBalanceWallet as WalletIcon,
  Star as StarIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

import LayoutShell from '../../layouts/LayoutShell';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebaseClient';

import DashboardHeader from './DashboardHeader';
import MoneySplitSimulator from './MoneySplitSimulator';
import BalanceTrendChart from './BalanceTrendChart';
import WalletPieChart from './WalletPieChart';
import RecentTransactions from './RecentTransactions';

// 🚀 CLEANED UP: Use centralized currency formatting
import { formatCurrency, getCurrencySymbol, isCryptoCurrency } from '../helpers/formatCurrency';

function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core state management
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [income, setIncome] = useState(0);
  const [outcome, setOutcome] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isWalletsLoaded, setIsWalletsLoaded] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Currency preference states
  const [displayCurrency, setDisplayCurrency] = useState('IDR');
  const [userPreferredCurrency, setUserPreferredCurrency] = useState<string | null>(null);
  const [isLoadingPreference, setIsLoadingPreference] = useState(true);
  const [preferenceSource, setPreferenceSource] = useState<'user' | 'auto' | 'default'>('default');

  // Mobile UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Simple filter states
  const [filterDate, setFilterDate] = useState('30days');

  // Load user's currency preference from Firebase
  useEffect(() => {
    if (!user) return;

    const loadUserPreference = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().preferredDisplayCurrency) {
          setUserPreferredCurrency(userDoc.data().preferredDisplayCurrency);
        }
      } catch (error) {
        console.log('Error loading currency preference:', error);
      } finally {
        setIsLoadingPreference(false);
      }
    };

    loadUserPreference();
  }, [user]);

  // 🚀 SIMPLIFIED: Enhanced dynamic currencies and smart currency selection
  const { availableCurrencies, smartDefaultCurrency, totalBalanceInSelectedCurrency } = useMemo(() => {
    // Get unique currencies from wallets with balances > 0
    const currencyStats = {};
    
    wallets.forEach(wallet => {
      if (wallet.currency && typeof wallet.balance === 'number' && wallet.balance > 0) {
        if (!currencyStats[wallet.currency]) {
          currencyStats[wallet.currency] = { balance: 0, count: 0 };
        }
        currencyStats[wallet.currency].balance += wallet.balance;
        currencyStats[wallet.currency].count += 1;
      }
    });
    
    // If no wallets yet, return default
    if (Object.keys(currencyStats).length === 0) {
      return {
        availableCurrencies: [{ 
          code: 'IDR', 
          name: 'Indonesian Rupiah', 
          symbol: 'Rp', 
          balance: 0,
          type: 'fiat',
          walletCount: 0
        }],
        smartDefaultCurrency: 'IDR',
        totalBalanceInSelectedCurrency: 0
      };
    }

    // 🚀 CLEANED UP: Map to display format using centralized functions
    const currencies = Object.entries(currencyStats).map(([currency, stats]) => ({
      code: currency,
      name: currency, // Let formatCurrency handle proper display
      symbol: getCurrencySymbol(currency),
      type: isCryptoCurrency(currency) ? 'crypto' : 'fiat',
      balance: stats.balance,
      walletCount: stats.count
    }));

    // Sort by balance (highest first), then by wallet count
    currencies.sort((a, b) => {
      if (b.balance !== a.balance) return b.balance - a.balance;
      return b.walletCount - a.walletCount;
    });

    // Smart default: highest balance currency, preferring fiat over crypto if balances are close
    let smartDefault = currencies[0]?.code || 'IDR';
    
    // If top currency is crypto and there's a fiat currency with significant balance, prefer fiat
    if (currencies.length > 1 && currencies[0].type === 'crypto') {
      const topFiat = currencies.find(c => c.type === 'fiat');
      if (topFiat && topFiat.balance >= currencies[0].balance * 0.5) {
        smartDefault = topFiat.code;
      }
    }

    // Calculate total balance in selected currency
    const selectedCurrencyBalance = currencyStats[displayCurrency]?.balance || 0;

    return {
      availableCurrencies: currencies,
      smartDefaultCurrency: smartDefault,
      totalBalanceInSelectedCurrency: selectedCurrencyBalance
    };
  }, [wallets, displayCurrency]);

  // Smart currency selection logic
  useEffect(() => {
    if (isLoadingPreference || availableCurrencies.length === 0) return;

    let selectedCurrency = 'IDR';
    let source: 'user' | 'auto' | 'default' = 'default';

    // Priority 1: User's saved preference (if still available)
    if (userPreferredCurrency && availableCurrencies.some(c => c.code === userPreferredCurrency)) {
      selectedCurrency = userPreferredCurrency;
      source = 'user';
    }
    // Priority 2: Smart default (highest balance with fiat preference)
    else if (smartDefaultCurrency && availableCurrencies.some(c => c.code === smartDefaultCurrency)) {
      selectedCurrency = smartDefaultCurrency;
      source = 'auto';
    }
    // Priority 3: First available currency
    else if (availableCurrencies.length > 0) {
      selectedCurrency = availableCurrencies[0].code;
      source = 'default';
    }

    if (displayCurrency !== selectedCurrency) {
      setDisplayCurrency(selectedCurrency);
    }
    setPreferenceSource(source);
  }, [availableCurrencies, userPreferredCurrency, smartDefaultCurrency, isLoadingPreference]);

  // Save currency preference to Firebase
  const saveCurrencyPreference = async (currency: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        preferredDisplayCurrency: currency,
        updatedAt: new Date()
      }, { merge: true });

      setUserPreferredCurrency(currency);
      setPreferenceSource('user');
      
      console.log('Currency preference saved successfully');
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  };

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    setDisplayCurrency(newCurrency);
    saveCurrencyPreference(newCurrency);
  };

  // Auto-select highest balance currency
  const handleAutoSelectCurrency = () => {
    if (smartDefaultCurrency && smartDefaultCurrency !== displayCurrency) {
      handleCurrencyChange(smartDefaultCurrency);
    }
  };

  // Firebase data loading (unchanged)
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    let loadedComponents = 0;
    const totalComponents = 4;

    const updateProgress = () => {
      loadedComponents++;
      if (loadedComponents === totalComponents) {
        setIsLoading(false);
      }
    };

    // User data
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        setDisplayName(snap.data().name || user.email);
      } else {
        setDisplayName(user.email);
      }
      updateProgress();
    });

    const incomeRef = collection(db, 'users', user.uid, 'incomes');
    const outcomeRef = collection(db, 'users', user.uid, 'outcomes');
    const transferRef = collection(db, 'users', user.uid, 'transfers');
    const walletRef = collection(db, 'users', user.uid, 'wallets');

    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      let total = 0;
      const newTrans = [];
      snap.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
        newTrans.push({ ...data, type: 'income', id: doc.id });
      });
      setIncome(total);
      setTransactions((prev) => [...prev.filter((tx) => tx.type !== 'income'), ...newTrans]);
      updateProgress();
    });

    const unsubOutcomes = onSnapshot(outcomeRef, (snap) => {
      let total = 0;
      const newTrans = [];
      snap.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
        newTrans.push({ ...data, type: 'outcome', id: doc.id });
      });
      setOutcome(total);
      setTransactions((prev) => [...prev.filter((tx) => tx.type !== 'outcome'), ...newTrans]);
      updateProgress();
    });

    const unsubTransfers = onSnapshot(transferRef, (snap) => {
      const newTransfers = snap.docs.map((doc) => ({
        ...doc.data(),
        type: 'transfer',
        id: doc.id,
      }));
      setTransactions((prev) => [...prev.filter((tx) => tx.type !== 'transfer'), ...newTransfers]);
      updateProgress();
    });

    const unsubWallets = onSnapshot(walletRef, (snap) => {
      const walletData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWallets(walletData);
      setIsWalletsLoaded(true);
      updateProgress();
    });

    return () => {
      unsubIncomes();
      unsubOutcomes();
      unsubWallets();
      unsubTransfers();
    };
  }, [user]);

  // Mobile-Friendly Filters Component
  const MobileFilters = () => (
    <Box sx={{ mb: 3 }}>
      {/* Main Controls - Always Visible */}
      <Card elevation={1}>
        <CardContent sx={{ pb: 2 }}>
          {/* Top Row - Essential Controls */}
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select
                  value={filterDate}
                  label="Period"
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  <MenuItem value="7days">7 Days</MenuItem>
                  <MenuItem value="30days">30 Days</MenuItem>
                  <MenuItem value="1year">1 Year</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Currency</InputLabel>
                <Select
                  value={displayCurrency}
                  label="Currency"
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                >
                  {availableCurrencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      <Box display="flex" alignItems="center" gap={1} width="100%">
                        <Typography variant="body2" fontWeight="bold">
                          {currency.symbol}
                        </Typography>
                        <Box>
                          <Typography variant="body2">
                            {currency.code}
                          </Typography>
                          {!isSmallMobile && (
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(currency.balance, currency.code)}
                            </Typography>
                          )}
                        </Box>
                        {displayCurrency === currency.code && (
                          <CheckIcon fontSize="small" color="primary" sx={{ ml: 'auto' }} />
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Action Buttons Row */}
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Button
              variant={showSplit ? 'contained' : 'outlined'}
              startIcon={<CalculatorIcon />}
              onClick={() => setShowSplit(!showSplit)}
              size={isSmallMobile ? 'small' : 'medium'}
            >
              {isSmallMobile ? 'Split' : 'Money Split'}
            </Button>

            <Box display="flex" alignItems="center" gap={1}>
              {smartDefaultCurrency && smartDefaultCurrency !== displayCurrency && (
                <Tooltip title={`Auto-select ${smartDefaultCurrency}`}>
                  <IconButton
                    size="small"
                    onClick={handleAutoSelectCurrency}
                    color="primary"
                  >
                    <StarIcon />
                  </IconButton>
                </Tooltip>
              )}

              <IconButton
                size="small"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                color={showAdvancedFilters ? 'primary' : 'default'}
              >
                {showAdvancedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Stack>
        </CardContent>

        {/* Advanced/Info Section - Collapsible */}
        <Collapse in={showAdvancedFilters}>
          <Divider />
          <CardContent sx={{ pt: 2 }}>
            {/* Currency Info */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Current Display: {displayCurrency}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Balance:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {formatCurrency(totalBalanceInSelectedCurrency, displayCurrency)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mode:
                  </Typography>
                  <Chip 
                    label={
                      preferenceSource === 'user' ? 'Manual' : 
                      preferenceSource === 'auto' ? 'Auto' : 
                      'Default'
                    }
                    size="small"
                    color={preferenceSource === 'user' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </Grid>
              </Grid>

              {availableCurrencies.length > 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {availableCurrencies.length} currencies available
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                    {availableCurrencies.map((currency) => (
                      <Chip
                        key={currency.code}
                        label={currency.code}
                        size="small"
                        variant={currency.code === displayCurrency ? 'filled' : 'outlined'}
                        color={currency.code === displayCurrency ? 'primary' : 'default'}
                        onClick={() => handleCurrencyChange(currency.code)}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  );

  // Loading Screen
  if (isLoading || isLoadingPreference) {
    return (
      <LayoutShell>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="50vh"
            gap={3}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" color="primary">
              Loading Dashboard...
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Loading currency preferences and wallet data...
            </Typography>
          </Box>
        </Container>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <Container maxWidth="xl" sx={{ py: { xs: 1, md: 2 }, px: { xs: 1, md: 3 } }}>
        {/* Header */}
        <DashboardHeader displayName={displayName} />

        {/* Mobile-Friendly Filters */}
        <MobileFilters />

        {/* Money Split Simulator */}
        <Collapse in={showSplit}>
          <Box sx={{ mb: 3 }}>
            <MoneySplitSimulator />
          </Box>
        </Collapse>

        {/* Balance Trend Chart */}
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              gap={1}
              mb={2}
            >
              <Typography variant="h6" fontWeight="bold">
                Balance Trend - {displayCurrency}
              </Typography>
              <Chip 
                label={formatCurrency(totalBalanceInSelectedCurrency, displayCurrency)}
                color="primary"
                variant="outlined"
                icon={<TrendingUpIcon />}
                size={isSmallMobile ? 'small' : 'medium'}
              />
            </Box>
            <BalanceTrendChart
              transactions={transactions}
              selectedCurrency={displayCurrency}
              filterDate={filterDate}
              customStartDate={null}
              customEndDate={null}
              wallets={wallets}
              displayCurrency={displayCurrency}
            />
          </CardContent>
        </Card>

        {/* Main Content Grid - Responsive */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} lg={6}>
            <WalletPieChart 
              wallets={wallets} 
              selectedCurrency={displayCurrency}
              displayCurrency={displayCurrency}
            />
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <RecentTransactions
              transactions={transactions}
              wallets={wallets}
              isWalletsLoaded={isWalletsLoaded}
              displayCurrency={displayCurrency}
            />
          </Grid>
        </Grid>
      </Container>
    </LayoutShell>
  );
}

export default DashboardPage;