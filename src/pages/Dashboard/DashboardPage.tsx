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
import CollapsibleCurrencyView from './CollapsibleCurrencyView';

// Enhanced currency formatting utility with FIXED symbols
const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }

  const normalizedCurrency = (currency || 'IDR').toUpperCase();

  // Traditional currencies with proper locale support
  const traditionalCurrencies = {
    'USD': { locale: 'en-US', options: { style: 'currency' as const, currency: 'USD', maximumFractionDigits: 2 } },
    'EUR': { locale: 'de-DE', options: { style: 'currency' as const, currency: 'EUR', maximumFractionDigits: 2 } },
    'JPY': { locale: 'ja-JP', options: { style: 'currency' as const, currency: 'JPY', maximumFractionDigits: 0 } },
    'SGD': { locale: 'en-SG', options: { style: 'currency' as const, currency: 'SGD', maximumFractionDigits: 2 } },
    'GBP': { locale: 'en-GB', options: { style: 'currency' as const, currency: 'GBP', maximumFractionDigits: 2 } },
    'THB': { locale: 'th-TH', options: { style: 'currency' as const, currency: 'THB', maximumFractionDigits: 2 } },
    'AUD': { locale: 'en-AU', options: { style: 'currency' as const, currency: 'AUD', maximumFractionDigits: 2 } },
    'CAD': { locale: 'en-CA', options: { style: 'currency' as const, currency: 'CAD', maximumFractionDigits: 2 } },
    'CHF': { locale: 'de-CH', options: { style: 'currency' as const, currency: 'CHF', maximumFractionDigits: 2 } },
    'CNY': { locale: 'zh-CN', options: { style: 'currency' as const, currency: 'CNY', maximumFractionDigits: 2 } },
    'KRW': { locale: 'ko-KR', options: { style: 'currency' as const, currency: 'KRW', maximumFractionDigits: 0 } },
    'IDR': { locale: 'id-ID', options: { style: 'currency' as const, currency: 'IDR', maximumFractionDigits: 0 } },
    'INR': { locale: 'en-IN', options: { style: 'currency' as const, currency: 'INR', maximumFractionDigits: 2 } },
    'TWD': { locale: 'zh-TW', options: { style: 'currency' as const, currency: 'TWD', maximumFractionDigits: 2 } }
  };

  // Check if it's a traditional currency
  if (traditionalCurrencies[normalizedCurrency]) {
    const { locale, options } = traditionalCurrencies[normalizedCurrency];
    try {
      return amount.toLocaleString(locale, options);
    } catch (error) {
      // Fallback to manual formatting with correct symbols
      const symbols = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥', 
        'INR': '₹', 'TWD': 'NT$', 'THB': '฿', 'KRW': '₩', 'IDR': 'Rp'
      };
      const symbol = symbols[normalizedCurrency] || normalizedCurrency;
      return `${symbol} ${amount.toLocaleString()}`;
    }
  }

  // Cryptocurrency formatting
  const cryptoFormats = {
    'USDT': { symbol: 'USDT', decimals: 2 },
    'USDC': { symbol: 'USDC', decimals: 2 },
    'BTC': { symbol: '₿', decimals: 8 },
    'ETH': { symbol: 'Ξ', decimals: 6 },
    'BNB': { symbol: 'BNB', decimals: 4 },
    'ADA': { symbol: 'ADA', decimals: 6 },
    'DOT': { symbol: 'DOT', decimals: 4 },
    'MATIC': { symbol: 'MATIC', decimals: 4 },
    'SOL': { symbol: 'SOL', decimals: 4 },
    'AVAX': { symbol: 'AVAX', decimals: 4 },
    'LINK': { symbol: 'LINK', decimals: 4 },
    'UNI': { symbol: 'UNI', decimals: 4 }
  };

  if (cryptoFormats[normalizedCurrency]) {
    const { symbol, decimals } = cryptoFormats[normalizedCurrency];
    return `${symbol} ${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals 
    })}`;
  }

  // Special case for MYR and other custom formats
  if (normalizedCurrency === 'MYR') {
    return `RM ${amount.toLocaleString('en-MY', { maximumFractionDigits: 2 })}`;
  }

  // Fallback for unknown currencies
  return `${normalizedCurrency} ${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 6 
  })}`;
};

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

  // Enhanced currency metadata with FIXED symbols
  const currencyMetadata = {
    // Traditional currencies - FIXED SYMBOLS
    'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp', type: 'fiat' },
    'USD': { name: 'US Dollar', symbol: '$', type: 'fiat' },
    'EUR': { name: 'Euro', symbol: '€', type: 'fiat' },
    'JPY': { name: 'Japanese Yen', symbol: '¥', type: 'fiat' },
    'SGD': { name: 'Singapore Dollar', symbol: 'S$', type: 'fiat' },
    'GBP': { name: 'British Pound', symbol: '£', type: 'fiat' },
    'THB': { name: 'Thai Baht', symbol: '฿', type: 'fiat' },
    'MYR': { name: 'Malaysian Ringgit', symbol: 'RM', type: 'fiat' },
    'AUD': { name: 'Australian Dollar', symbol: 'A$', type: 'fiat' },
    'CAD': { name: 'Canadian Dollar', symbol: 'C$', type: 'fiat' },
    'CHF': { name: 'Swiss Franc', symbol: 'CHF', type: 'fiat' },
    'CNY': { name: 'Chinese Yuan', symbol: '¥', type: 'fiat' },        // FIXED: was 'Rp'
    'INR': { name: 'Indian Rupee', symbol: '₹', type: 'fiat' },        // FIXED: was 'Rp'
    'TWD': { name: 'Taiwan Dollar', symbol: 'NT$', type: 'fiat' },     // FIXED: was 'Rp'
    'KRW': { name: 'South Korean Won', symbol: '₩', type: 'fiat' },
    // Cryptocurrencies
    'USDT': { name: 'Tether USD', symbol: 'USDT', type: 'crypto' },
    'BTC': { name: 'Bitcoin', symbol: '₿', type: 'crypto' },
    'ETH': { name: 'Ethereum', symbol: 'Ξ', type: 'crypto' },
    'BNB': { name: 'Binance Coin', symbol: 'BNB', type: 'crypto' },
    'USDC': { name: 'USD Coin', symbol: 'USDC', type: 'crypto' },
    'ADA': { name: 'Cardano', symbol: 'ADA', type: 'crypto' },
    'DOT': { name: 'Polkadot', symbol: 'DOT', type: 'crypto' },
    'MATIC': { name: 'Polygon', symbol: 'MATIC', type: 'crypto' },
    'SOL': { name: 'Solana', symbol: 'SOL', type: 'crypto' },
    'AVAX': { name: 'Avalanche', symbol: 'AVAX', type: 'crypto' }
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

  // Enhanced dynamic currencies and smart currency selection
  const { availableCurrencies, smartDefaultCurrency, totalBalanceInSelectedCurrency } = useMemo(() => {
    // Get unique currencies from wallets with balances > 0
    const walletCurrencies = [...new Set(
      wallets
        .filter(wallet => wallet.currency && (wallet.balance || 0) > 0)
        .map(wallet => wallet.currency)
    )];
    
    // If no wallets yet, return default
    if (walletCurrencies.length === 0) {
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

    // Calculate total balance per currency and wallet count
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

    // Map to display format with enhanced metadata
    const currencies = walletCurrencies.map(currency => {
      const metadata = currencyMetadata[currency] || { name: currency, symbol: currency, type: 'unknown' };
      const stats = currencyStats[currency] || { balance: 0, count: 0 };
      
      return {
        code: currency,
        name: metadata.name,
        symbol: metadata.symbol,
        type: metadata.type,
        balance: stats.balance,
        walletCount: stats.count
      };
    });

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

  // Enhanced Filters Component
  const EnhancedFilters = () => (
    <Box sx={{ mb: 3 }}>
      {/* Basic Controls Row */}
      <Card elevation={1} sx={{ mb: 2 }}>
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

            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Display Mode:
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
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* NEW: Collapsible Currency View */}
      <CollapsibleCurrencyView
        availableCurrencies={availableCurrencies}
        displayCurrency={displayCurrency}
        onCurrencyChange={handleCurrencyChange}
        smartDefaultCurrency={smartDefaultCurrency}
        preferenceSource={preferenceSource}
        totalBalance={totalBalanceInSelectedCurrency}
        onAutoSelect={handleAutoSelectCurrency}
        showSaveIndicator={preferenceSource === 'user'}
      />
    </Box>
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
          <Typography variant="body2" color="text.secondary">
            Loading currency preferences and wallet data...
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

        {/* Enhanced Filters with Collapsible Currency View */}
        <EnhancedFilters />

        {/* Money Split Simulator */}
        <Collapse in={showSplit}>
          <Box sx={{ mb: 3 }}>
            <MoneySplitSimulator />
          </Box>
        </Collapse>

        {/* Simplified Trend Chart */}
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Grafik Saldo - {displayCurrency}
              </Typography>
              <Chip 
                label={`${formatCurrency(totalBalanceInSelectedCurrency, displayCurrency)}`}
                color="primary"
                variant="outlined"
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