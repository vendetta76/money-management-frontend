import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
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
  Fade
} from '@mui/material';
import {
  Calculate as CalculatorIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Settings as SettingsIcon
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

  // Simple filter states
  const [filterDate, setFilterDate] = useState('30days');
  
  // Manual currency setting - stored in localStorage
  const [displayCurrency, setDisplayCurrency] = useState(() => {
    return localStorage.getItem('dashboard-currency') || 'IDR';
  });

  // Available currencies for manual selection
  const availableCurrencies = [
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' }
  ];

  // Save currency preference to localStorage
  const handleCurrencyChange = (newCurrency: string) => {
    setDisplayCurrency(newCurrency);
    localStorage.setItem('dashboard-currency', newCurrency);
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

  // Simple Filters Component - dynamically filter currency options based on wallets
  const SimpleFilters = () => {
    // Get unique currencies from wallets
    const walletCurrencies = [...new Set(wallets.map(wallet => wallet.currency).filter(Boolean))];
    
    // Filter availableCurrencies to only include those present in wallets
    const filteredCurrencies = availableCurrencies.filter(currency => 
      walletCurrencies.includes(currency.code)
    );

    // If displayCurrency is not in filteredCurrencies, reset it to the first available option or 'IDR'
    useEffect(() => {
      if (filteredCurrencies.length > 0 && !filteredCurrencies.some(c => c.code === displayCurrency)) {
        setDisplayCurrency(filteredCurrencies[0]?.code || 'IDR');
      }
    }, [filteredCurrencies, displayCurrency]);

    return (
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
              <FormControl fullWidth size="small" disabled={filteredCurrencies.length === 0}>
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
                >
                  {filteredCurrencies.length === 0 ? (
                    <MenuItem disabled value="">
                      No currencies available
                    </MenuItem>
                  ) : (
                    filteredCurrencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {currency.symbol}
                          </Typography>
                          <Typography variant="body2">
                            {currency.code} - {currency.name}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Currency Info Display
  const CurrencyInfo = () => {
    const currentCurrency = availableCurrencies.find(c => c.code === displayCurrency);
    return (
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Dashboard Overview
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            All amounts displayed in:
          </Typography>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {currentCurrency?.symbol} {currentCurrency?.name}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Loading Screen
  if (isLoading) {
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

        {/* Currency Info */}
        <CurrencyInfo />

        {/* Simple Filters */}
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