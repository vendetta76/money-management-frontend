import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Alert,
  Snackbar,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Container,
  Paper,
  IconButton
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as TransferIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Business as BusinessIcon,
  BarChart as BarChartIcon,
  AutoAwesome as SparklesIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ec4899', // pink-500
    },
    secondary: {
      main: '#14b8a6', // teal-500
    },
  },
});

const categories = [
  { id: 'food', name: 'Makanan & Minuman', icon: '🍽️', color: '#ef4444' },
  { id: 'transport', name: 'Transportasi', icon: '🚗', color: '#3b82f6' },
  { id: 'shopping', name: 'Belanja', icon: '🛍️', color: '#eab308' },
  { id: 'bills', name: 'Tagihan', icon: '🏠', color: '#a855f7' },
  { id: 'salary', name: 'Gaji', icon: '💼', color: '#22c55e' },
  { id: 'investment', name: 'Investasi', icon: '📈', color: '#6366f1' },
];

const EnhancedDemoPage = () => {
  const [wallets, setWallets] = useState([
    { id: 'main', name: 'Dompet Utama', balance: 2500000, gradient: 'linear-gradient(135deg, #ec4899 0%, #14b8a6 100%)' },
    { id: 'savings', name: 'Tabungan', balance: 5000000, gradient: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)' },
  ]);
  
  const [transactions, setTransactions] = useState([
    { id: 1, name: 'Gaji Bulanan', amount: 8000000, type: 'income', category: 'salary', date: new Date(), from: 'main' },
    { id: 2, name: 'Belanja Groceries', amount: -350000, type: 'expense', category: 'shopping', date: new Date(), from: 'main' },
  ]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', category: 'food', from: 'main', to: 'savings' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[0];
  };

  const getWalletInfo = (walletId) => {
    return wallets.find(w => w.id === walletId);
  };

  const handleTransaction = () => {
    const amount = parseFloat(form.amount);
    if (!form.name || !amount) return;

    const newTransaction = {
      ...form,
      amount: dialogType === 'expense' ? -amount : amount,
      type: dialogType,
      date: new Date(),
      id: Date.now()
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update wallet balances
    if (dialogType === 'income') {
      setWallets(prev => prev.map(w => 
        w.id === form.from ? { ...w, balance: w.balance + amount } : w
      ));
      setSuccessMessage('💰 Pemasukan berhasil ditambahkan!');
    } else if (dialogType === 'expense') {
      setWallets(prev => prev.map(w => 
        w.id === form.from ? { ...w, balance: w.balance - amount } : w
      ));
      setSuccessMessage('💸 Pengeluaran berhasil dicatat!');
    } else if (dialogType === 'transfer' && form.from !== form.to) {
      setWallets(prev => prev.map(w => {
        if (w.id === form.from) return { ...w, balance: w.balance - amount };
        if (w.id === form.to) return { ...w, balance: w.balance + amount };
        return w;
      }));
      setSuccessMessage('🔄 Transfer berhasil dilakukan!');
    }

    setShowSuccess(true);
    setOpenDialog(false);
    setForm({ name: '', amount: '', category: 'food', from: 'main', to: 'savings' });
  };

  const openTransactionDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const resetDemo = () => {
    setWallets([
      { id: 'main', name: 'Dompet Utama', balance: 2500000, gradient: 'linear-gradient(135deg, #ec4899 0%, #14b8a6 100%)' },
      { id: 'savings', name: 'Tabungan', balance: 5000000, gradient: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)' },
    ]);
    setTransactions([
      { id: 1, name: 'Gaji Bulanan', amount: 8000000, type: 'income', category: 'salary', date: new Date(), from: 'main' },
      { id: 2, name: 'Belanja Groceries', amount: -350000, type: 'expense', category: 'shopping', date: new Date(), from: 'main' },
    ]);
    setSuccessMessage('🔄 Demo telah direset!');
    setShowSuccess(true);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
        pb: 10
      }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          
          {/* Success Snackbar */}
          <Snackbar
            open={showSuccess}
            autoHideDuration={4000}
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setShowSuccess(false)} 
              severity="success" 
              sx={{ width: '100%', fontSize: '1rem', fontWeight: 600 }}
            >
              {successMessage}
            </Alert>
          </Snackbar>

          {/* Header */}
          <Card sx={{ 
            mb: 4, 
            borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%)',
            position: 'relative',
            overflow: 'visible'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
              borderRadius: '50%',
              zIndex: 0
            }} />
            
            <CardContent sx={{ textAlign: 'center', p: 6, position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  mb: 2,
                  background: 'linear-gradient(135deg, #ec4899 0%, #14b8a6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800
                }}
              >
                🎮 Demo Interaktif MeowIQ
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Kelola keuangan Anda dengan mudah dan cerdas
              </Typography>
              
              {/* Total Balance Indicator */}
              <Chip
                icon={<SparklesIcon />}
                label={`Total Saldo: ${formatCurrency(totalBalance)}`}
                sx={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #14b8a6 100%)',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  py: 3,
                  px: 2,
                  height: 'auto',
                  '& .MuiChip-label': { px: 2 }
                }}
              />
            </CardContent>
          </Card>

          {/* Wallets Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WalletIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Dompet Anda
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {wallets.map((wallet, index) => (
                <Grid item xs={12} md={6} key={wallet.id}>
                  <Card
                    sx={{
                      background: wallet.gradient,
                      color: 'white',
                      borderRadius: 4,
                      transform: 'scale(1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            width: 64,
                            height: 64,
                            mr: 3
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 0.5 }}>
                            {wallet.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                            Saldo Tersedia
                          </Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {formatCurrency(wallet.balance)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BarChartIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                Aksi Cepat
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  onClick={() => openTransactionDialog('income')}
                  variant="contained"
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    py: 3,
                    borderRadius: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Tambah Pemasukan
                </Button>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  onClick={() => openTransactionDialog('expense')}
                  variant="contained"
                  fullWidth
                  startIcon={<RemoveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    py: 3,
                    borderRadius: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Tambah Pengeluaran
                </Button>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Button
                  onClick={() => openTransactionDialog('transfer')}
                  variant="contained"
                  fullWidth
                  startIcon={<TransferIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    py: 3,
                    borderRadius: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  Transfer Dompet
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Transactions Section */}
          <Card sx={{ borderRadius: 6, overflow: 'hidden', mb: 4 }}>
            <Box sx={{
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
              color: 'white',
              p: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ fontSize: 32, mr: 2 }} />
                <Typography variant="h5" fontWeight="bold">
                  Riwayat Transaksi ({transactions.length})
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
              {transactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h1" sx={{ mb: 2 }}>🤷‍♂️</Typography>
                  <Typography variant="h6" fontWeight="600" color="text.secondary" sx={{ mb: 1 }}>
                    Belum ada transaksi
                  </Typography>
                  <Typography color="text.disabled">
                    Mulai tambahkan transaksi pertama Anda!
                  </Typography>
                </Box>
              ) : (
                <List>
                  {transactions.map((tx, index) => {
                    const categoryInfo = getCategoryInfo(tx.category);
                    const fromWallet = getWalletInfo(tx.from);
                    const toWallet = getWalletInfo(tx.to);
                    
                    return (
                      <React.Fragment key={tx.id}>
                        <ListItem sx={{ px: 3, py: 2 }}>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                background: tx.type === 'income' 
                                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                                  : tx.type === 'expense'
                                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                width: 56,
                                height: 56
                              }}
                            >
                              {tx.type === 'transfer' ? <TransferIcon /> : categoryInfo.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="h6" fontWeight="600">
                                  {tx.name}
                                </Typography>
                                <Chip
                                  label={tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                                  size="small"
                                  color={tx.type === 'income' ? 'success' : tx.type === 'expense' ? 'error' : 'info'}
                                  variant="outlined"
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {tx.type !== 'transfer' ? categoryInfo.name : `${fromWallet?.name} → ${toWallet?.name}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  • {tx.date.toLocaleDateString('id-ID')}
                                </Typography>
                              </Box>
                            }
                          />
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={tx.amount > 0 ? 'success.main' : tx.type === 'transfer' ? 'info.main' : 'error.main'}
                          >
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                          </Typography>
                        </ListItem>
                        {index < transactions.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Box>
          </Card>

          {/* Reset Button */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              onClick={resetDemo}
              variant="outlined"
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                borderRadius: 8,
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  transform: 'scale(1.05)'
                }
              }}
            >
              Reset Demo
            </Button>
          </Box>

          {/* Floating Action Button */}
          <Fab
            onClick={() => setOpenDialog(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #ec4899 0%, #14b8a6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #db2777 0%, #0f766e 100%)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <AddIcon sx={{ color: 'white' }} />
          </Fab>

          {/* Transaction Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { borderRadius: 6 }
            }}
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #ec4899 0%, #14b8a6 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6" fontWeight="bold">
                {dialogType === 'income' ? '💰 Tambah Pemasukan' : 
                 dialogType === 'expense' ? '💸 Tambah Pengeluaran' : 
                 '🔄 Transfer Dompet'}
              </Typography>
              <IconButton 
                onClick={() => setOpenDialog(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                <TextField
                  fullWidth
                  label="Nama Transaksi"
                  placeholder={
                    dialogType === 'income' ? 'cth: Gaji, Bonus, Freelance' :
                    dialogType === 'expense' ? 'cth: Makan, Transport, Belanja' :
                    'cth: Transfer ke Tabungan'
                  }
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                
                <TextField
                  fullWidth
                  type="number"
                  label="Jumlah"
                  placeholder="Masukkan jumlah"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                
                {(dialogType === 'income' || dialogType === 'expense') && (
                  <FormControl fullWidth>
                    <InputLabel>Kategori</InputLabel>
                    <Select
                      value={form.category}
                      label="Kategori"
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      sx={{ borderRadius: 3 }}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <FormControl fullWidth>
                  <InputLabel>Dari Dompet</InputLabel>
                  <Select
                    value={form.from}
                    label="Dari Dompet"
                    onChange={e => setForm({ ...form, from: e.target.value })}
                    sx={{ borderRadius: 3 }}
                  >
                    {wallets.map(w => (
                      <MenuItem key={w.id} value={w.id}>
                        🏦 {w.name} ({formatCurrency(w.balance)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {dialogType === 'transfer' && (
                  <FormControl fullWidth>
                    <InputLabel>Ke Dompet</InputLabel>
                    <Select
                      value={form.to}
                      label="Ke Dompet"
                      onChange={e => setForm({ ...form, to: e.target.value })}
                      sx={{ borderRadius: 3 }}
                    >
                      {wallets.filter(w => w.id !== form.from).map(w => (
                        <MenuItem key={w.id} value={w.id}>
                          🏦 {w.name} ({formatCurrency(w.balance)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={() => setOpenDialog(false)}
                variant="outlined"
                sx={{ 
                  borderRadius: 3, 
                  px: 4, 
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleTransaction}
                disabled={!form.name || !form.amount}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #14b8a6 100%)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #db2777 0%, #0f766e 100%)'
                  }
                }}
              >
                Simpan Transaksi
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default EnhancedDemoPage;