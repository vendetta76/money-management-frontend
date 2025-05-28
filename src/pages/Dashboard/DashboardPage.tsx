import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Alert,
  Stack,
  Paper,
  Badge,
  Skeleton
} from '@mui/material';
import {
  Calculate as CalculatorIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as CurrencyIcon,
  AccountBalanceWallet as WalletIcon,
  Star as StarIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';

import LayoutShell from '../../layouts/LayoutShell';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebaseClient';

// Components
import DashboardHeader from './DashboardHeader';
import MoneySplitSimulator from './MoneySplitSimulator';
import BalanceTrendChart from './BalanceTrendChart';
import WalletPieChart from './WalletPieChart';
import RecentTransactions from './RecentTransactions';
import RightSidebar from '../common/RightSidebar';

// Currency utilities
import { formatCurrency, getCurrencySymbol, isCryptoCurrency } from '../helpers/formatCurrency';

// 🚀 PERFORMANCE: Loading states interface
interface LoadingStates {
  user: boolean;
  wallets: boolean;
  incomes: boolean;
  outcomes: boolean;
  transfers: boolean;
  preferences: boolean;
}

// 🚀 PERFORMANCE: Memoized components
const LoadingSkeleton = React.memo(() => (
  <Box>
    <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 3, borderRadius: 2 }} />
    <Grid container spacing={3}>
      <Grid item xs={12} lg={6}>
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Box>
));

const QuickStats = React.memo(({ 
  totalBalance, 
  currency, 
  walletCount 
}: { 
  totalBalance: number; 
  currency: string; 
  walletCount: number; 
}) => (
  <Card elevation={1} sx={{ mb: 3 }}>
    <CardContent>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight="bold" color="primary">
              {formatCurrency(totalBalance, currency)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Balance
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {walletCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active Wallets
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Chip 
              label={currency} 
              color="primary" 
              size="medium"
              icon={<CurrencyIcon />}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Display Currency
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
));

function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const navigate = useNavigate();

  // 🚀 PERFORMANCE: Granular loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    user: true,
    wallets: true,
    incomes: true,
    outcomes: true,
    transfers: true,
    preferences: true
  });

  // Core state management
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [income, setIncome] = useState(0);
  const [outcome, setOutcome] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // Currency preference states  
  const [displayCurrency, setDisplayCurrency] = useState('IDR');
  const [userPreferredCurrency, setUserPreferredCurrency] = useState<string | null>(null);
  const [preferenceSource, setPreferenceSource] = useState<'user' | 'auto' | 'default'>('default');

  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('30days');

  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<'money-split' | 'analytics' | 'settings' | null>(null);

  // 🚀 PERFORMANCE: Helper to update loading states
  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // 🚀 PERFORMANCE: Check if core data is loaded
  const isCoreDataLoaded = useMemo(() => {
    return !loadingStates.user && !loadingStates.wallets;
  }, [loadingStates.user, loadingStates.wallets]);

  // 🚀 PERFORMANCE: Check if all data is loaded
  const isFullyLoaded = useMemo(() => {
    return Object.values(loadingStates).every(state => !state);
  }, [loadingStates]);

  // 🚀 PERFORMANCE: Load user preferences first (non-blocking)
  useEffect(() => {
    if (!user) return;

    const loadUserPreference = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.name || user.email);
          if (data.preferredDisplayCurrency) {
            setUserPreferredCurrency(data.preferredDisplayCurrency);
            setDisplayCurrency(data.preferredDisplayCurrency);
          }
        } else {
          setDisplayName(user.email);
        }
      } catch (error) {
        console.log('Error loading user data:', error);
        setDisplayName(user.email); // Fallback
      } finally {
        updateLoadingState('user', false);
        updateLoadingState('preferences', false);
      }
    };

    loadUserPreference();
  }, [user, updateLoadingState]);

  // 🚀 PERFORMANCE: Optimized currency logic (lighter computation)
  const currencyData = useMemo(() => {
    // Early return if wallets not loaded
    if (loadingStates.wallets) {
      return {
        availableCurrencies: [],
        smartDefaultCurrency: 'IDR',
        totalBalance: 0
      };
    }

    const currencyStats = new Map();
    
    // Single pass through wallets
    for (const wallet of wallets) {
      if (wallet.currency && typeof wallet.balance === 'number' && wallet.balance > 0) {
        const existing = currencyStats.get(wallet.currency) || { balance: 0, count: 0 };
        currencyStats.set(wallet.currency, {
          balance: existing.balance + wallet.balance,
          count: existing.count + 1
        });
      }
    }

    if (currencyStats.size === 0) {
      return {
        availableCurrencies: [{ 
          code: 'IDR', 
          symbol: 'Rp', 
          balance: 0,
          type: 'fiat',
          count: 0
        }],
        smartDefaultCurrency: 'IDR',
        totalBalance: 0
      };
    }

    // Convert to array and sort
    const currencies = Array.from(currencyStats.entries()).map(([currency, stats]) => ({
      code: currency,
      symbol: getCurrencySymbol(currency),
      type: isCryptoCurrency(currency) ? 'crypto' : 'fiat',
      balance: stats.balance,
      count: stats.count
    })).sort((a, b) => b.balance - a.balance);

    // Smart default logic
    let smartDefault = currencies[0]?.code || 'IDR';
    if (currencies.length > 1 && currencies[0].type === 'crypto') {
      const topFiat = currencies.find(c => c.type === 'fiat');
      if (topFiat && topFiat.balance >= currencies[0].balance * 0.5) {
        smartDefault = topFiat.code;
      }
    }

    const totalBalance = currencyStats.get(displayCurrency)?.balance || 0;

    return {
      availableCurrencies: currencies,
      smartDefaultCurrency: smartDefault,
      totalBalance
    };
  }, [wallets, displayCurrency, loadingStates.wallets]);

  // 🚀 PERFORMANCE: Auto-select currency (debounced)
  useEffect(() => {
    if (loadingStates.wallets || loadingStates.preferences) return;

    let selectedCurrency = displayCurrency;
    let source: 'user' | 'auto' | 'default' = 'default';

    // Only change if no user preference is set
    if (!userPreferredCurrency) {
      if (currencyData.smartDefaultCurrency !== displayCurrency) {
        selectedCurrency = currencyData.smartDefaultCurrency;
        source = 'auto';
      }
    } else {
      source = 'user';
    }

    if (selectedCurrency !== displayCurrency) {
      setDisplayCurrency(selectedCurrency);
    }
    setPreferenceSource(source);
  }, [currencyData.smartDefaultCurrency, userPreferredCurrency, loadingStates.wallets, loadingStates.preferences]);

  // Save currency preference to Firebase
  const saveCurrencyPreference = useCallback(async (currency: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        preferredDisplayCurrency: currency,
        updatedAt: new Date()
      }, { merge: true });

      setUserPreferredCurrency(currency);
      setPreferenceSource('user');
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  }, [user]);

  // Handle currency change
  const handleCurrencyChange = useCallback((newCurrency: string) => {
    setDisplayCurrency(newCurrency);
    saveCurrencyPreference(newCurrency);
  }, [saveCurrencyPreference]);

  // 🚀 PERFORMANCE: Firebase data loading (parallel + optimized)
  useEffect(() => {
    if (!user) return;

    // Load wallets first (highest priority)
    const walletRef = collection(db, 'users', user.uid, 'wallets');
    const unsubWallets = onSnapshot(walletRef, (snap) => {
      const walletData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWallets(walletData);
      updateLoadingState('wallets', false);
    }, (error) => {
      console.error('Error loading wallets:', error);
      updateLoadingState('wallets', false);
    });

    // Load transactions (parallel)
    const incomeRef = collection(db, 'users', user.uid, 'incomes');
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
      updateLoadingState('incomes', false);
    }, (error) => {
      console.error('Error loading incomes:', error);
      updateLoadingState('incomes', false);
    });

    const outcomeRef = collection(db, 'users', user.uid, 'outcomes');
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
      updateLoadingState('outcomes', false);
    }, (error) => {
      console.error('Error loading outcomes:', error);
      updateLoadingState('outcomes', false);
    });

    const transferRef = collection(db, 'users', user.uid, 'transfers');
    const unsubTransfers = onSnapshot(transferRef, (snap) => {
      const newTransfers = snap.docs.map((doc) => ({
        ...doc.data(),
        type: 'transfer',
        id: doc.id,
      }));
      setTransactions((prev) => [...prev.filter((tx) => tx.type !== 'transfer'), ...newTransfers]);
      updateLoadingState('transfers', false);
    }, (error) => {
      console.error('Error loading transfers:', error);
      updateLoadingState('transfers', false);
    });

    return () => {
      unsubWallets();
      unsubIncomes();
      unsubOutcomes();
      unsubTransfers();
    };
  }, [user, updateLoadingState]);

  // Sidebar handlers
  const openSidebar = useCallback((content: 'money-split' | 'analytics' | 'settings') => {
    setSidebarContent(content);
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    setTimeout(() => setSidebarContent(null), 300);
  }, []);

  // 🚀 PERFORMANCE: Enhanced Toolbar Component (memoized)
  const DashboardToolbar = React.memo(() => (
    <Box sx={{ mb: 3 }}>
      <Card elevation={1}>
        <CardContent sx={{ pb: 2 }}>
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
                  disabled={loadingStates.wallets}
                >
                  {currencyData.availableCurrencies.map((currency) => (
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

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<CalculatorIcon />}
                onClick={() => openSidebar('money-split')}
                size={isSmallMobile ? 'small' : 'medium'}
                color="primary"
              >
                {isSmallMobile ? 'Split' : 'Money Split'}
              </Button>

              <Button
                variant="outlined"
                startIcon={<AnalyticsIcon />}
                onClick={() => openSidebar('analytics')}
                size={isSmallMobile ? 'small' : 'medium'}
              >
                {isSmallMobile ? 'Stats' : 'Analytics'}
              </Button>
            </Stack>

            <Box display="flex" alignItems="center" gap={1}>
              {currencyData.smartDefaultCurrency && currencyData.smartDefaultCurrency !== displayCurrency && (
                <Tooltip title={`Auto-select ${currencyData.smartDefaultCurrency}`}>
                  <IconButton
                    size="small"
                    onClick={() => handleCurrencyChange(currencyData.smartDefaultCurrency)}
                    color="primary"
                  >
                    <Badge badgeContent="!" color="error">
                      <StarIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              <IconButton
                size="small"
                onClick={() => openSidebar('settings')}
                color={showAdvancedFilters ? 'primary' : 'default'}
              >
                <SettingsIcon />
              </IconButton>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  ));

  // Sidebar Content Renderer
  const renderSidebarContent = () => {
    switch (sidebarContent) {
      case 'money-split':
        return <MoneySplitSimulator />;
      
      case 'analytics':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              📊 Advanced Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Coming soon! This will show detailed financial analytics, spending patterns, and insights.
            </Typography>
            <Alert severity="info">
              Feature under development. Stay tuned for advanced charts and AI-powered insights!
            </Alert>
          </Box>
        );
      
      case 'settings':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              ⚙️ Dashboard Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Customize your dashboard experience, notifications, and preferences.
            </Typography>
            <Alert severity="info">
              Settings panel coming soon! Configure your dashboard layout, themes, and more.
            </Alert>
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Get sidebar config based on content
  const getSidebarConfig = () => {
    switch (sidebarContent) {
      case 'money-split':
        return {
          title: 'Money Split Simulator',
          subtitle: 'Plan your budget allocation',
          icon: <CalculatorIcon />,
          width: 'large' as const,
          headerColor: 'primary' as const
        };
      case 'analytics':
        return {
          title: 'Advanced Analytics',
          subtitle: 'Detailed financial insights',
          icon: <AnalyticsIcon />,
          width: 'medium' as const,
          headerColor: 'secondary' as const
        };
      case 'settings':
        return {
          title: 'Dashboard Settings',
          subtitle: 'Customize your experience',
          icon: <SettingsIcon />,
          width: 'medium' as const,
          headerColor: 'default' as const
        };
      default:
        return {
          title: 'Sidebar',
          subtitle: '',
          icon: null,
          width: 'medium' as const,
          headerColor: 'primary' as const
        };
    }
  };

  // 🚀 PERFORMANCE: Show loading only for initial load
  if (loadingStates.user) {
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
              Initializing Dashboard...
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Loading your profile and preferences...
            </Typography>
          </Box>
        </Container>
      </LayoutShell>
    );
  }

  const sidebarConfig = getSidebarConfig();

  return (
    <LayoutShell>
      <Container maxWidth="xl" sx={{ py: { xs: 1, md: 2 }, px: { xs: 1, md: 3 } }}>
        {/* Header - Shows immediately */}
        <DashboardHeader displayName={displayName} />

        {/* 🚀 PERFORMANCE: Show quick stats as soon as wallets load */}
        {isCoreDataLoaded && currencyData.availableCurrencies.length > 0 && (
          <QuickStats 
            totalBalance={currencyData.totalBalance}
            currency={displayCurrency}
            walletCount={currencyData.availableCurrencies.reduce((sum, c) => sum + c.count, 0)}
          />
        )}

        {/* Enhanced Toolbar - Shows immediately */}
        <DashboardToolbar />

        {/* 🚀 PERFORMANCE: Progressive loading - show content as it becomes available */}
        {isCoreDataLoaded ? (
          <>
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
                    label={formatCurrency(currencyData.totalBalance, displayCurrency)}
                    color="primary"
                    variant="outlined"
                    icon={<TrendingUpIcon />}
                    size={isSmallMobile ? 'small' : 'medium'}
                  />
                </Box>
                {!isFullyLoaded ? (
                  <Skeleton variant="rectangular" width="100%" height={300} />
                ) : (
                  <BalanceTrendChart
                    transactions={transactions}
                    selectedCurrency={displayCurrency}
                    filterDate={filterDate}
                    customStartDate={null}
                    customEndDate={null}
                    wallets={wallets}
                    displayCurrency={displayCurrency}
                  />
                )}
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} lg={6}>
                {loadingStates.wallets ? (
                  <Skeleton variant="rectangular" width="100%" height={400} />
                ) : (
                  <WalletPieChart 
                    wallets={wallets} 
                    selectedCurrency={displayCurrency}
                    displayCurrency={displayCurrency}
                  />
                )}
              </Grid>
              
              <Grid item xs={12} lg={6}>
                {!isFullyLoaded ? (
                  <Skeleton variant="rectangular" width="100%" height={400} />
                ) : (
                  <RecentTransactions
                    transactions={transactions}
                    wallets={wallets}
                    isWalletsLoaded={!loadingStates.wallets}
                    displayCurrency={displayCurrency}
                  />
                )}
              </Grid>
            </Grid>
          </>
        ) : (
          <LoadingSkeleton />
        )}

        {/* Universal Right Sidebar */}
        <RightSidebar
          open={sidebarOpen}
          onClose={closeSidebar}
          title={sidebarConfig.title}
          subtitle={sidebarConfig.subtitle}
          icon={sidebarConfig.icon}
          width={sidebarConfig.width}
          headerColor={sidebarConfig.headerColor}
          keepMounted={true}
        >
          {renderSidebarContent()}
        </RightSidebar>
      </Container>
    </LayoutShell>
  );
}

export default DashboardPage;