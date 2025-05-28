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
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Chip,
  Alert,
  Stack,
  Paper,
  Badge
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
import RightSidebar from '@/components/RightSidebar';

// Currency utilities
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
  const [isLoading, setIsLoading] = useState(true);

  // Currency preference states
  const [displayCurrency, setDisplayCurrency] = useState('IDR');
  const [userPreferredCurrency, setUserPreferredCurrency] = useState<string | null>(null);
  const [isLoadingPreference, setIsLoadingPreference] = useState(true);
  const [preferenceSource, setPreferenceSource] = useState<'user' | 'auto' | 'default'>('default');

  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('30days');

  // 🚀 NEW: Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<'money-split' | 'analytics' | 'settings' | null>(null);

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

  // Simplified currency logic (as from previous version)
  const { availableCurrencies, smartDefaultCurrency, totalBalanceInSelectedCurrency } = useMemo(() => {
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

    const currencies = Object.entries(currencyStats).map(([currency, stats]) => ({
      code: currency,
      name: currency,
      symbol: getCurrencySymbol(currency),
      type: isCryptoCurrency(currency) ? 'crypto' : 'fiat',
      balance: stats.balance,
      walletCount: stats.count
    }));

    currencies.sort((a, b) => {
      if (b.balance !== a.balance) return b.balance - a.balance;
      return b.walletCount - a.walletCount;
    });

    let smartDefault = currencies[0]?.code || 'IDR';
    
    if (currencies.length > 1 && currencies[0].type === 'crypto') {
      const topFiat = currencies.find(c => c.type === 'fiat');
      if (topFiat && topFiat.balance >= currencies[0].balance * 0.5) {
        smartDefault = topFiat.code;
      }
    }

    const selectedCurrencyBalance = currencyStats[displayCurrency]?.balance || 0;

    return {
      availableCurrencies: currencies,
      smartDefaultCurrency: smartDefault,
      totalBalanceInSelectedCurrency: selectedCurrencyBalance
    };
  }, [wallets, displayCurrency]);

  // Smart currency selection logic (unchanged)
  useEffect(() => {
    if (isLoadingPreference || availableCurrencies.length === 0) return;

    let selectedCurrency = 'IDR';
    let source: 'user' | 'auto' | 'default' = 'default';

    if (userPreferredCurrency && availableCurrencies.some(c => c.code === userPreferredCurrency)) {
      selectedCurrency = userPreferredCurrency;
      source = 'user';
    }
    else if (smartDefaultCurrency && availableCurrencies.some(c => c.code === smartDefaultCurrency)) {
      selectedCurrency = smartDefaultCurrency;
      source = 'auto';
    }
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

  // 🚀 NEW: Sidebar handlers
  const openSidebar = (content: 'money-split' | 'analytics' | 'settings') => {
    setSidebarContent(content);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    // Small delay to avoid flickering
    setTimeout(() => setSidebarContent(null), 300);
  };

  // Firebase data loading (unchanged from previous version - shortened here for brevity)
  useEffect(() => {
    if (!user) return;
    // ... Firebase loading logic ...
  }, [user]);

  // Enhanced Toolbar Component
  const DashboardToolbar = () => (
    <Box sx={{ mb: 3 }}>
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

          {/* 🚀 NEW: Action Buttons with Sidebar Triggers */}
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
              {smartDefaultCurrency && smartDefaultCurrency !== displayCurrency && (
                <Tooltip title={`Auto-select ${smartDefaultCurrency}`}>
                  <IconButton
                    size="small"
                    onClick={handleAutoSelectCurrency}
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
  );

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

  const sidebarConfig = getSidebarConfig();

  return (
    <LayoutShell>
      <Container maxWidth="xl" sx={{ py: { xs: 1, md: 2 }, px: { xs: 1, md: 3 } }}>
        {/* Header */}
        <DashboardHeader displayName={displayName} />

        {/* 🚀 NEW: Enhanced Toolbar */}
        <DashboardToolbar />

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

        {/* Main Content Grid */}
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

        {/* 🚀 NEW: Universal Right Sidebar */}
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