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
  Alert
} from '@mui/material';
import {
  Calculate as CalculatorIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Save as SaveIcon,
  AutoAwesome as AutoIcon
} from '@mui/icons-material';

import LayoutShell from '../../layouts/LayoutShell';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebaseClient';

import DashboardHeader from './DashboardHeader';
import MoneySplitSimulator from './MoneySplitSimulator';
import BalanceTrendChart from './BalanceTrendChart';
import WalletPieChart from './WalletPieChart';
import RecentTransactions from './RecentTransactions';

function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  // Simple filter states
  const [filterDate, setFilterDate] = useState('30days');

  // Currency metadata for display
  const currencyMetadata = {
    'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp' },
    'USD': { name: 'US Dollar', symbol: '$' },
    'EUR': { name: 'Euro', symbol: '€' },
    'JPY': { name: 'Japanese Yen', symbol: '¥' },
    'SGD': { name: 'Singapore Dollar', symbol: 'S$' },
    'GBP': { name: 'British Pound', symbol: '£' },
    'THB': { name: 'Thai Baht', symbol: '฿' },
    'MYR': { name: 'Malaysian Ringgit', symbol: 'RM' },
    'USDT': { name: 'Tether USD', symbol: 'USDT' },
    'BTC': { name: 'Bitcoin', symbol: '₿' },
    'ETH': { name: 'Ethereum', symbol: 'Ξ' },
    'BNB': { name: 'Binance Coin', symbol: 'BNB' },
    'USDC': { name: 'USD Coin', symbol: 'USDC' }
  };

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

  // Dynamic currencies and smart currency selection
  const { availableCurrencies, smartDefaultCurrency } = useMemo(() => {
    // Get unique currencies from wallets
    const walletCurrencies = [...new Set(wallets.map(wallet => wallet.currency).filter(Boolean))];
    
    // If no wallets yet, return default
    if (walletCurrencies.length === 0) {
      return {
        availableCurrencies: [{ code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', balance: 0 }],
        smartDefaultCurrency: 'IDR'
      };
    }

    // Calculate total balance per currency
    const currencyBalances = {};
    wallets.forEach(wallet => {
      if (wallet.currency && wallet.balance) {
        currencyBalances[wallet.currency] = (currencyBalances[wallet.currency] || 0) + wallet.balance;
      }
    });

    // Map to display format with balances
    const currencies = walletCurrencies.map(currency => ({
      code: currency,
      name: currencyMetadata[currency]?.name || currency,
      symbol: currencyMetadata[currency]?.symbol || currency,
      balance: currencyBalances[currency] || 0
    }));

    // Sort by balance (highest first)
    currencies.sort((a, b) => b.balance - a.balance);

    // Smart default: highest balance currency
    const smartDefault = currencies[0]?.code || 'IDR';

    return {
      availableCurrencies: currencies,
      smartDefaultCurrency: smartDefault
    };
  }, [wallets]);

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
    // Priority 2: Smart default (highest balance)
    else if (smartDefaultCurrency && availableCurrencies.some(c => c.code === smartDefaultCurrency)) {
      selectedCurrency = smartDefaultCurrency;
      source = 'auto';
    }
    // Priority 3: First available currency
    else if (availableCurrencies.length > 0) {
      selectedCurrency = availableCurrencies[0].code;
      source = 'default';
    }

    setDisplayCurrency(selectedCurrency);
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
      
      // Show success feedback
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
    if (smartDefaultCurrency) {
      handleCurrencyChange(smartDefaultCurrency);
    }
  };

  // Simple currency formatting - no conversion, just formatting
  const formatCurrency = (amount: number, currency: string = displayCurrency) => {
    switch (currency.toUpperCase()) {
      case 'USD':
        return amount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 2
        });
      case 'EUR':
        return amount.toLocaleString('de-DE', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 2
        });
      case 'JPY':
        return amount.toLocaleString('ja-JP', {
          style: 'currency',
          currency: 'JPY',
          maximumFractionDigits: 0
        });
      case 'SGD':
        return amount.toLocaleString('en-SG', {
          style: 'currency',
          currency: 'SGD',
          maximumFractionDigits: 2
        });
      case 'GBP':
        return amount.toLocaleString('en-GB', {
          style: 'currency',
          currency: 'GBP',
          maximumFractionDigits: 2
        });
      case 'THB':
        return amount.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB',
          maximumFractionDigits: 2
        });
      case 'MYR':
        return `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`;
      case 'USDT':
      case 'USDC':
        return `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
      case 'BTC':
        return `₿ ${amount.toLocaleString('en-US', { maximumFractionDigits: 8 })}`;
      case 'ETH':
        return `Ξ ${amount.toLocaleString('en-US', { maximumFractionDigits: 6 })}`;
      case 'BNB':
        return `BNB ${amount.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
      case 'IDR':
      default:
        return amount.toLocaleString('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0
        });
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

  // Enhanced Filters Component with smart currency selection
  const SimpleFilters = () => (
    <Card elevation={1} sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Periode</InputLabel>
              <Select
                value={filterDate}
                label="Periode"
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <MenuItem value="7days">7 Hari</MenuItem>
                <MenuItem value="30days">30 Hari</MenuItem>
                <MenuItem value="1year">1 Tahun</MenuItem>
                <MenuItem value="all">Semua</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant={showSplit ? 'contained' : 'outlined'}
              startIcon={<CalculatorIcon />}
              onClick={() => setShowSplit(!showSplit)}
              fullWidth
              sx={{ height: 40 }}
            >
              Money Split
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" gap={1}>
              <FormControl fullWidth size="small">
                <InputLabel>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SettingsIcon fontSize="small" />
                    Display Currency
                  </Box>
                </InputLabel>
                <Select
                  value={displayCurrency}
                  label="Display Currency"
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  disabled={availableCurrencies.length <= 1}
                >
                  {availableCurrencies.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {currency.symbol}
                          </Typography>
                          <Typography variant="body2">
                            {currency.code}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(currency.balance, currency.code)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {/* Auto-select button */}
              {availableCurrencies.length > 1 && preferenceSource !== 'auto' && (
                <Tooltip title="Auto-select highest balance currency">
                  <IconButton 
                    size="small" 
                    onClick={handleAutoSelectCurrency}
                    sx={{ border: 1, borderColor: 'primary.main' }}
                  >
                    <AutoIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Enhanced Currency Info */}
        {availableCurrencies.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Available Currencies:</strong> {availableCurrencies.map(c => `${c.code} (${formatCurrency(c.balance, c.code)})`).join(', ')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1} justifyContent="flex-end">
                  <Chip
                    label={
                      preferenceSource === 'user' ? '👤 User Preference' :
                      preferenceSource === 'auto' ? '🤖 Auto Selected' : 
                      '⚙️ Default'
                    }
                    size="small"
                    color={preferenceSource === 'user' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                  {preferenceSource === 'user' && (
                    <Tooltip title="Saved to your profile">
                      <SaveIcon fontSize="small" color="success" />
                    </Tooltip>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Smart selection hint for new users */}
        {availableCurrencies.length > 1 && preferenceSource === 'auto' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              💡 Auto-selected <strong>{displayCurrency}</strong> as it has the highest balance. 
              Your preference will be saved automatically when you change it.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  // Loading Screen
  if (isLoading || isLoadingPreference) {
    return (
      <LayoutShell>
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
        </Box>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Header */}
        <DashboardHeader displayName={displayName} />

        {/* Enhanced Filters */}
        <SimpleFilters />

        {/* Money Split Simulator */}
        <Collapse in={showSplit}>
          <Box sx={{ mb: 3 }}>
            <MoneySplitSimulator />
          </Box>
        </Collapse>

        {/* Simplified Trend Chart */}
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Grafik Saldo
            </Typography>
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

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <WalletPieChart 
              wallets={wallets} 
              selectedCurrency={displayCurrency}
              displayCurrency={displayCurrency}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
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