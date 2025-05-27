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
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  Calculate as CalculatorIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon
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

  // Simplified filter states
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [filterDate, setFilterDate] = useState('30days');

  // Firebase data loading
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

  const allCurrencies = Array.from(new Set(wallets.map((w) => w.currency)));

  // Quick Stats Component (Simplified)
  const QuickStats = () => {
    const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
    const netFlow = income - outcome;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {income.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pemasukan
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {outcome.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pengeluaran
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                color={netFlow >= 0 ? 'success.main' : 'error.main'}
              >
                {netFlow.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {totalBalance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Saldo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Simple Filters Component
  const SimpleFilters = () => (
    <Card elevation={1} sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Mata Uang</InputLabel>
              <Select
                value={selectedCurrency}
                label="Mata Uang"
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                <MenuItem value="all">Semua</MenuItem>
                {allCurrencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>



          <Grid item xs={12} sm={6} md={3}>
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
        </Grid>
      </CardContent>
    </Card>
  );

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

        {/* Quick Stats */}
        <QuickStats />

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
              selectedCurrency={selectedCurrency}
              filterDate={filterDate}
              customStartDate={null}
              customEndDate={null}
              wallets={wallets}
            />
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <WalletPieChart 
              wallets={wallets} 
              selectedCurrency={selectedCurrency} 
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <RecentTransactions
              transactions={transactions}
              wallets={wallets}
              isWalletsLoaded={isWalletsLoaded}
            />
          </Grid>
        </Grid>
      </Container>
    </LayoutShell>
  );
}

export default DashboardPage;