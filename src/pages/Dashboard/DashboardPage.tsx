import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Collapse,
  Alert,
  LinearProgress,
  Backdrop,
  CircularProgress,
  Snackbar,
  useTheme,
  useMediaQuery,
  Zoom,
  Fade,
  Slide
} from '@mui/material';
import {
  Add as AddIcon,
  Timeline as TimelineIcon,
  AccountBalance as WalletIcon,
  SwapHoriz as TransferIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Calculate as CalculatorIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import LayoutShell from '../../layouts/LayoutShell';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebaseClient';

import DashboardHeader from './DashboardHeader';
import DashboardFilters from './DashboardFilters';
import MoneySplitSimulator from './MoneySplitSimulator';
import BalanceTrendChart from './BalanceTrendChart';
import WalletPieChart from './WalletPieChart';
import RecentTransactions from './RecentTransactions';
import SurvivabilityScoreBox from './SurvivabilityScoreBox';

function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const navigate = useNavigate();

  // Original state management - preserved exactly
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [income, setIncome] = useState(0);
  const [outcome, setOutcome] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isWalletsLoaded, setIsWalletsLoaded] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  // Loading states for enhanced UX
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadingProgress, setDataLoadingProgress] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const prevStatus = useRef(null);

  // Original filter states - preserved exactly
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  // Enhanced state for UI improvements
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(true);

  // Original Firebase logic - preserved exactly
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    let loadedComponents = 0;
    const totalComponents = 4; // user, incomes, outcomes, transfers, wallets

    const updateProgress = () => {
      loadedComponents++;
      setDataLoadingProgress((loadedComponents / totalComponents) * 100);
      if (loadedComponents === totalComponents) {
        setIsLoading(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
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

  const allCurrencies = Array.from(new Set(wallets.map((w) => w.currency)));

  // Quick actions for Speed Dial
  const speedDialActions = [
    {
      icon: <AddIcon />,
      name: 'Tambah Transaksi',
      onClick: () => navigate('/add-transaction')
    },
    {
      icon: <WalletIcon />,
      name: 'Kelola Wallet',
      onClick: () => navigate('/wallets')
    },
    {
      icon: <TransferIcon />,
      name: 'Transfer',
      onClick: () => navigate('/transfer')
    },
    {
      icon: <AnalyticsIcon />,
      name: 'Laporan',
      onClick: () => navigate('/reports')
    }
  ];

  // Quick Stats Component
  const QuickStats = () => {
    const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
    const netFlow = income - outcome;
    const savingsWallets = wallets.filter(w => w.isSaving).length;

    return (
      <Fade in={showQuickStats} timeout={500}>
        <Card elevation={1} sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
              📊 Ringkasan Cepat
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {income.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Pemasukan
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {outcome.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Pengeluaran
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color={netFlow >= 0 ? 'success.main' : 'error.main'}
                  >
                    {netFlow.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Net Flow
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {totalBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Saldo
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>
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
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="primary" fontWeight="bold">
            Memuat Dashboard...
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <LinearProgress 
              variant="determinate" 
              value={dataLoadingProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {Math.round(dataLoadingProgress)}% - Mengambil data dari server
            </Typography>
          </Box>
        </Box>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Header */}
        <DashboardHeader displayName={displayName} />

        {/* Quick Stats */}
        <QuickStats />

        {/* Filters */}
        <DashboardFilters
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          filterWallet={filterWallet}
          setFilterWallet={setFilterWallet}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          wallets={wallets}
          allCurrencies={allCurrencies}
        />

        {/* Trend Chart */}
        <Slide direction="up" in={true} timeout={500}>
          <Box>
            <BalanceTrendChart
              transactions={transactions}
              selectedCurrency={selectedCurrency}
              filterDate={filterDate}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              wallets={wallets}
            />
          </Box>
        </Slide>

        {/* Main Dashboard Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={700}>
              <Box>
                <WalletPieChart 
                  wallets={wallets} 
                  selectedCurrency={selectedCurrency} 
                />
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={900}>
              <Box>
                <RecentTransactions
                  transactions={transactions}
                  wallets={wallets}
                  isWalletsLoaded={isWalletsLoaded}
                />
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Fade in={true} timeout={1100}>
              <Box>
                <SurvivabilityScoreBox 
                  income={income} 
                  outcome={outcome} 
                  wallets={wallets} 
                />
              </Box>
            </Fade>
          </Grid>
        </Grid>

        {/* Money Split Simulator Section */}
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  💰 Money Split Simulator
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alat canggih untuk merencanakan pembagian uang dengan optimal
                </Typography>
              </Box>
              <Button
                variant={showSplit ? 'contained' : 'outlined'}
                startIcon={showSplit ? <HideIcon /> : <ShowIcon />}
                onClick={() => setShowSplit(!showSplit)}
                color="primary"
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3
                }}
              >
                {showSplit ? 'Sembunyikan' : 'Tampilkan'} Simulator
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Money Split Simulator */}
        <Collapse in={showSplit} timeout={500}>
          <Zoom in={showSplit} timeout={300}>
            <Box sx={{ mb: 4 }}>
              <MoneySplitSimulator />
            </Box>
          </Zoom>
        </Collapse>

        {/* Speed Dial for Quick Actions */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ 
            position: 'fixed', 
            bottom: isMobile ? 16 : 32, 
            right: isMobile ? 16 : 32,
            '& .MuiFab-primary': {
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
              }
            }
          }}
          icon={<SpeedDialIcon />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick={() => {
                action.onClick();
                setSpeedDialOpen(false);
              }}
              sx={{
                '& .MuiSpeedDialAction-fab': {
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }
              }}
            />
          ))}
        </SpeedDial>

        {/* Quick Stats Toggle FAB */}
        <Fab
          color="secondary"
          size="small"
          sx={{
            position: 'fixed',
            bottom: isMobile ? 80 : 96,
            right: isMobile ? 16 : 32,
          }}
          onClick={() => setShowQuickStats(!showQuickStats)}
        >
          <TrendingUpIcon />
        </Fab>

        {/* Success Message */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={3000}
          onClose={() => setShowSuccessMessage(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Dashboard berhasil dimuat! Semua data terbaru telah disinkronkan.
          </Alert>
        </Snackbar>
      </Container>
    </LayoutShell>
  );
}

export default DashboardPage;