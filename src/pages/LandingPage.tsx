import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Paper,
  IconButton,
  Fab,
  Zoom,
  Grow,
  Slide,
  Stack,
  Rating,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ThemeProvider,
  createTheme,
  styled,
  keyframes
} from '@mui/material/styles';
import {
  ArrowForward,
  Security,
  Analytics,
  Speed,
  Star,
  TrendingUp,
  AccountBalance,
  Rocket,
  AutoAwesome,
  ChevronRight,
  Close,
  PlayArrow,
  Add,
  Remove,
  Wallet,
  ShoppingCart,
  Restaurant,
  LocalGasStation,
  Home
} from '@mui/icons-material';

// Tema warna yang lebih cerah dan modern
const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#E55555',
    },
    secondary: {
      main: '#4ECDC4',
      light: '#7ED6CF',
      dark: '#3BA89F',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
    warning: {
      main: '#FFD93D',
    },
    success: {
      main: '#48BB78',
    },
    error: {
      main: '#F56565',
    },
    info: {
      main: '#4299E1',
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 25,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          border: 'none',
        },
      },
    },
  },
});

// Animasi
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
  40%, 43% { transform: translate3d(0, -15px, 0); }
  70% { transform: translate3d(0, -7px, 0); }
  90% { transform: translate3d(0, -2px, 0); }
`;

// Komponen Styled
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
  color: theme.palette.text.primary,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #E55555 30%, #3BA89F 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 35px rgba(255, 107, 107, 0.4)',
  },
}));

const PlayfulCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)',
  border: '1px solid #E2E8F0',
  transition: 'all 0.4s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 25px 50px rgba(255, 107, 107, 0.15)',
    '& .card-icon': {
      animation: `${bounce} 1s ease-in-out`,
    },
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 70%, #48BB78 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: `${float} 6s ease-in-out infinite`,
  opacity: 0.3,
}));

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

// Enhanced Interactive Demo Component
const InteractiveDemo = ({ open, onClose }) => {
  const [wallets, setWallets] = useState([
    { id: 'main', name: 'Dompet Utama', balance: 2500000, gradient: 'from-pink-500 to-teal-500' },
    { id: 'savings', name: 'Tabungan', balance: 5000000, gradient: 'from-green-500 to-emerald-600' },
  ]);
  
  const [transactions, setTransactions] = useState([
    { id: 1, name: 'Gaji Bulanan', amount: 8000000, type: 'income', category: 'salary', date: new Date(), from: 'main' },
    { id: 2, name: 'Belanja Groceries', amount: -350000, type: 'expense', category: 'shopping', date: new Date(), from: 'main' },
    { id: 3, name: 'Makan di Restoran', amount: -150000, type: 'expense', category: 'food', date: new Date(), from: 'main' },
  ]);
  
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [form, setForm] = useState({ name: '', amount: '', category: 'food', from: 'main', to: 'savings' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    { id: 'food', name: 'Makanan & Minuman', icon: '🍽️', color: 'bg-red-500' },
    { id: 'transport', name: 'Transportasi', icon: '🚗', color: 'bg-blue-500' },
    { id: 'shopping', name: 'Belanja', icon: '🛍️', color: 'bg-yellow-500' },
    { id: 'bills', name: 'Tagihan', icon: '🏠', color: 'bg-purple-500' },
    { id: 'salary', name: 'Gaji', icon: '💼', color: 'bg-green-500' },
    { id: 'investment', name: 'Investasi', icon: '📈', color: 'bg-indigo-500' },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
    setTimeout(() => setShowSuccess(false), 3000);
    setOpenTransactionDialog(false);
    setForm({ name: '', amount: '', category: 'food', from: 'main', to: 'savings' });
  };

  const openTransactionDialogHandler = (type) => {
    setDialogType(type);
    setOpenTransactionDialog(true);
  };

  const resetDemo = () => {
    setWallets([
      { id: 'main', name: 'Dompet Utama', balance: 2500000, gradient: 'from-pink-500 to-teal-500' },
      { id: 'savings', name: 'Tabungan', balance: 5000000, gradient: 'from-green-500 to-emerald-600' },
    ]);
    setTransactions([
      { id: 1, name: 'Gaji Bulanan', amount: 8000000, type: 'income', category: 'salary', date: new Date(), from: 'main' },
      { id: 2, name: 'Belanja Groceries', amount: -350000, type: 'expense', category: 'shopping', date: new Date(), from: 'main' },
      { id: 3, name: 'Makan di Restoran', amount: -150000, type: 'expense', category: 'food', date: new Date(), from: 'main' },
    ]);
    setSuccessMessage('🔄 Demo telah direset!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-3xl">
        
        {/* Success Alert */}
        {showSuccess && (
          <div className="absolute top-4 right-4 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-2 animate-bounce">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-teal-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">🎮 Demo Interaktif MeowIQ</h2>
            <p className="opacity-90">Rasakan pengalaman mengelola keuangan yang sesungguhnya</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="p-6">
            
            {/* Total Balance */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-full font-bold text-lg shadow-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Total Saldo: {formatCurrency(totalBalance)}
              </div>
            </div>

            {/* Wallets */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`bg-gradient-to-r ${wallet.gradient} text-white rounded-2xl p-6 shadow-lg`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 rounded-full p-3">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{wallet.name}</h3>
                      <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => openTransactionDialogHandler('income')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Pemasukan</span>
              </button>
              
              <button
                onClick={() => openTransactionDialogHandler('expense')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl p-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
              >
                <Minus className="w-5 h-5" />
                <span className="font-semibold">Pengeluaran</span>
              </button>
              
              <button
                onClick={() => openTransactionDialogHandler('transfer')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
              >
                <ArrowLeftRight className="w-5 h-5" />
                <span className="font-semibold">Transfer</span>
              </button>
            </div>

            {/* Transactions */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
                <h3 className="text-lg font-bold flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Riwayat Transaksi ({transactions.length})
                </h3>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🤷‍♂️</div>
                    <p className="text-gray-600">Belum ada transaksi</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {transactions.slice(0, 5).map((tx) => {
                      const categoryInfo = getCategoryInfo(tx.category);
                      const fromWallet = getWalletInfo(tx.from);
                      const toWallet = getWalletInfo(tx.to);
                      
                      return (
                        <div key={tx.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                              tx.type === 'income' ? 'bg-green-500' :
                              tx.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                              {tx.type === 'transfer' ? <ArrowLeftRight className="w-4 h-4" /> : categoryInfo.icon}
                            </div>
                            <div>
                              <p className="font-semibold">{tx.name}</p>
                              <p className="text-sm text-gray-600">
                                {tx.type !== 'transfer' ? categoryInfo.name : `${fromWallet?.name} → ${toWallet?.name}`}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold ${
                            tx.amount > 0 ? 'text-green-600' : tx.type === 'transfer' ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={resetDemo}
                className="px-6 py-2 border-2 border-pink-500 text-pink-500 rounded-full font-semibold hover:bg-pink-500 hover:text-white transition-all"
              >
                🔄 Reset Demo
              </button>
              <button
                onClick={() => window.open('/register', '_blank')}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-teal-600 transition-all"
              >
                🚀 Mulai Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Dialog */}
        {openTransactionDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              
              <div className="bg-gradient-to-r from-pink-500 to-teal-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  {dialogType === 'income' ? '💰 Tambah Pemasukan' : 
                   dialogType === 'expense' ? '💸 Tambah Pengeluaran' : 
                   '🔄 Transfer Dompet'}
                </h3>
                <button
                  onClick={() => setOpenTransactionDialog(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <input
                  type="text"
                  placeholder="Nama transaksi"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                
                <input
                  type="number"
                  placeholder="Jumlah (Rp)"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                
                {(dialogType === 'income' || dialogType === 'expense') && (
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                )}
                
                <select
                  value={form.from}
                  onChange={e => setForm({ ...form, from: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      🏦 {w.name} ({formatCurrency(w.balance)})
                    </option>
                  ))}
                </select>
                
                {dialogType === 'transfer' && (
                  <select
                    value={form.to}
                    onChange={e => setForm({ ...form, to: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {wallets.filter(w => w.id !== form.from).map(w => (
                      <option key={w.id} value={w.id}>
                        🏦 {w.name} ({formatCurrency(w.balance)})
                      </option>
                    ))}
                  </select>
                )}
                
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setOpenTransactionDialog(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleTransaction}
                    disabled={!form.name || !form.amount}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-lg hover:from-pink-600 hover:to-teal-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingAnimation = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Memuat halaman MeowIQ...");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 12;
      });
    }, 400);

      const texts = [
      "Memuat halaman MeowIQ...",
      "Menyiapkan konten website...",
      "Menampilkan informasi produk...",
      "Hampir siap!",
    ];

    const textTimer = setInterval(() => {
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, []);

  return (
    <ThemeProvider theme={modernTheme}>
      <Box
        sx={{
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Elemen dekoratif mengambang */}
        <FloatingElement sx={{ top: '10%', left: '10%', animationDelay: '0s' }}>
          <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)' }} />
        </FloatingElement>
        <FloatingElement sx={{ top: '20%', right: '15%', animationDelay: '1s' }}>
          <Box sx={{ width: 60, height: 60, borderRadius: 2, background: 'rgba(255, 255, 255, 0.15)' }} />
        </FloatingElement>
        <FloatingElement sx={{ bottom: '20%', left: '20%', animationDelay: '2s' }}>
          <Box sx={{ width: 70, height: 70, borderRadius: 1, background: 'rgba(255, 255, 255, 0.1)' }} />
        </FloatingElement>

        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                color: '#FF6B6B',
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            >
              <AutoAwesome sx={{ fontSize: '3rem' }} />
            </Avatar>

            <Typography variant="h2" sx={{ mb: 3, fontWeight: 800, color: 'white' }}>
              MeowIQ
            </Typography>

            <Typography variant="h6" sx={{ mb: 4, minHeight: 80, color: 'rgba(255, 255, 255, 0.9)' }}>
              {loadingText}
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                mb: 6,
                background: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                  borderRadius: 5,
                },
              }}
            />

            <Stack direction="row" spacing={4} justifyContent="center">
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    animation: `${pulse} 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

const LandingPage = () => {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setLoading(false), 3000);
  }, []);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <ThemeProvider theme={modernTheme}>
      <Box sx={{ background: '#FFFFFF', minHeight: '100vh', position: 'relative' }}>
        
        {/* Elemen latar belakang */}
        <FloatingElement sx={{ top: '5%', left: '5%', animationDelay: '0s' }}>
          <Box sx={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)', opacity: 0.1 }} />
        </FloatingElement>
        <FloatingElement sx={{ top: '60%', right: '10%', animationDelay: '2s' }}>
          <Box sx={{ width: 100, height: 100, borderRadius: 2, background: 'linear-gradient(45deg, #48BB78, #FFD93D)', opacity: 0.1 }} />
        </FloatingElement>
        <FloatingElement sx={{ bottom: '10%', left: '15%', animationDelay: '4s' }}>
          <Box sx={{ width: 80, height: 80, borderRadius: 1, background: 'linear-gradient(45deg, #4299E1, #F56565)', opacity: 0.1 }} />
        </FloatingElement>

        {/* AppBar */}
        <StyledAppBar position="sticky" elevation={0}>
          <Toolbar>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
              <AutoAwesome sx={{ color: 'primary.main', fontSize: '2rem' }} />
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                MeowIQ
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button 
                color="primary" 
                href="/login"
                sx={{ 
                  color: 'text.primary',
                  '&:hover': { 
                    background: 'rgba(255, 107, 107, 0.1)' 
                  }
                }}
              >
                Masuk
              </Button>
              <GradientButton 
                variant="contained"
                href="/register"
              >
                Daftar
              </GradientButton>
            </Stack>
          </Toolbar>
        </StyledAppBar>

        {/* Bagian Hero */}
        <HeroSection>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
            <Grow in={mounted} timeout={1000}>
              <Box sx={{ textAlign: 'center', py: { xs: 8, md: 12 } }}>
                <Chip
                  icon={<Rocket sx={{ color: 'white !important' }} />}
                  label="Transformasi Masa Depan Keuangan Anda"
                  sx={{
                    mb: 4,
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '1rem',
                    height: 40,
                  }}
                />

                <Typography variant="h1" sx={{ mb: 4, fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  Kelola Keuangan
                  <br />
                  <Typography variant="h1" component="span" sx={{ 
                    background: 'linear-gradient(45deg, #FFD93D 30%, #FFFFFF 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                  }}>
                    Dengan Cerdas
                  </Typography>
                </Typography>

                <Typography variant="h5" sx={{ mb: 6, maxWidth: 700, mx: 'auto', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400 }}>
                  Aplikasi PWA revolusioner yang mengubah cara Anda mengelola dompet, melacak transaksi, dan melihat wawasan keuangan dengan analisis bertenaga AI.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" alignItems="center">
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ChevronRight />}
                    href="/login"
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255, 255, 255, 0.2)',
                      },
                      fontWeight: 600,
                    }}
                  >
                    Masuk Sekarang
                  </Button>
                  
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    href="/register"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2D3748',
                      fontWeight: 700,
                      '&:hover': {
                        background: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    Mulai Gratis
                  </Button>
                </Stack>

                {/* Statistik */}
                <Grid container spacing={4} sx={{ mt: 8, justifyContent: 'center' }}>
                  <Grid item xs={4} sm="auto">
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>50K+</Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Pengguna Aktif</Typography>
                  </Grid>
                  <Grid item xs={4} sm="auto">
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>Rp10M+</Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Dikelola</Typography>
                  </Grid>
                  <Grid item xs={4} sm="auto">
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'white' }}>99.9%</Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>Uptime</Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grow>
          </Container>
        </HeroSection>

        {/* Preview Aplikasi */}
        <Container maxWidth="lg" sx={{ py: 8, mt: -8, position: 'relative', zIndex: 3 }}>
          <Zoom in={mounted} timeout={1500}>
            <Paper
              elevation={24}
              sx={{
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #E2E8F0',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 30px 60px rgba(255, 107, 107, 0.2)',
                }
              }}
              onClick={() => setDemoOpen(true)}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}>
                  <Box sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `${pulse} 2s ease-in-out infinite`,
                  }}>
                    <PlayArrow sx={{ fontSize: '3rem', color: 'white' }} />
                  </Box>
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                  🎮 Coba Demo Interaktif
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  Rasakan pengalaman MeowIQ secara langsung!
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
                    borderRadius: 25,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #E55555 30%, #3BA89F 90%)',
                    }
                  }}
                >
                  Mulai Demo
                </Button>
              </Box>
              
              {/* Elemen dekoratif mengambang */}
              <Box sx={{ position: 'absolute', top: 30, left: 30, width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)', animation: `${float} 4s ease-in-out infinite` }} />
              <Box sx={{ position: 'absolute', bottom: 30, right: 30, width: 50, height: 50, borderRadius: 2, background: 'linear-gradient(45deg, #48BB78, #FFD93D)', animation: `${float} 5s ease-in-out infinite` }} />
            </Paper>
          </Zoom>
        </Container>

        {/* Fitur-fitur */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
              Fitur <GradientText variant="h2" component="span">Canggih</GradientText>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Semua yang Anda butuhkan untuk menguasai keuangan
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Slide direction="up" in={mounted} timeout={800}>
                <PlayfulCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 70,
                        height: 70,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(45deg, #FF6B6B, #F56565)',
                      }}
                    >
                      <Security sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Keamanan Tingkat Bank
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Enkripsi tingkat militer dan protokol keamanan berlapis melindungi data keuangan Anda dengan arsitektur zero-trust.
                    </Typography>
                  </CardContent>
                </PlayfulCard>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="up" in={mounted} timeout={1000}>
                <PlayfulCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 70,
                        height: 70,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(45deg, #4ECDC4, #48BB78)',
                      }}
                    >
                      <Analytics sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Wawasan Bertenaga AI
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Algoritma pembelajaran mesin menganalisis pola pengeluaran Anda dan memberikan rekomendasi personal untuk kesehatan keuangan optimal.
                    </Typography>
                  </CardContent>
                </PlayfulCard>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="up" in={mounted} timeout={1200}>
                <PlayfulCard>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar
                      className="card-icon"
                      sx={{
                        width: 70,
                        height: 70,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(45deg, #FFD93D, #4299E1)',
                      }}
                    >
                      <Speed sx={{ fontSize: '2rem' }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Super Cepat
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      Teknologi Progressive Web App memastikan loading instan, fungsi offline, dan performa seperti aplikasi native.
                    </Typography>
                  </CardContent>
                </PlayfulCard>
              </Slide>
            </Grid>
          </Grid>
        </Container>

        {/* Cara Kerja */}
        <Container maxWidth="lg" sx={{ py: 8, background: 'linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%)', borderRadius: 4, my: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
              Mulai dalam <GradientText variant="h2" component="span">Hitungan Menit</GradientText>
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Setup sederhana, hasil yang powerful
            </Typography>
          </Box>

          <Grid container spacing={6}>
            {[
              { icon: <AccountBalance />, title: "Buat Akun", desc: "Daftar secara instan dengan email atau login sosial. Tidak perlu kartu kredit." },
              { icon: <AutoAwesome />, title: "Setup Pintar", desc: "Konfigurasi dompet dengan panduan AI yang disesuaikan dengan tujuan dan preferensi keuangan Anda." },
              { icon: <TrendingUp />, title: "Lacak & Analisis", desc: "Kategorisasi transaksi otomatis dengan wawasan real-time dan peringatan pengeluaran." },
              { icon: <Star />, title: "Optimalisasi & Berkembang", desc: "Terima rekomendasi personal untuk memaksimalkan tabungan dan peluang investasi." }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Grow in={mounted} timeout={800 + index * 200}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        background: `linear-gradient(45deg, ${index % 2 === 0 ? '#FF6B6B, #4ECDC4' : '#48BB78, #FFD93D'})`,
                        fontWeight: 800,
                        fontSize: '1.5rem',
                        color: 'white',
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
                        {item.title}
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Bagian CTA */}
        <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
          <Zoom in={mounted} timeout={1500}>
            <Paper
              elevation={12}
              sx={{
                p: 6,
                background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, fontWeight: 700 }}>
                Siap Mengubah
                <br />
                Masa Depan Keuangan Anda?
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 4, maxWidth: 500, mx: 'auto', opacity: 0.9 }}>
                Bergabunglah dengan ribuan pengguna cerdas yang telah merevolusi manajemen keuangan mereka dengan MeowIQ.
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 4 }}>
                <Rating value={5} readOnly sx={{ color: '#FFD93D' }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Rating 5.0 dari 50,000+ pengguna
                </Typography>
              </Stack>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                href="/register"
                sx={{ 
                  fontSize: '1.3rem', 
                  py: 2, 
                  px: 5,
                  background: 'white',
                  color: '#FF6B6B',
                  fontWeight: 700,
                  '&:hover': {
                    background: '#F7FAFC',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                Mulai Perjalanan Anda
              </Button>
            </Paper>
          </Zoom>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid #E2E8F0',
            background: '#F7FAFC',
            mt: 8,
          }}
        >
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <AutoAwesome sx={{ color: 'primary.main', fontSize: '2rem' }} />
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    MeowIQ
                  </Typography>
                </Stack>
                <Typography color="text.secondary" variant="h6">
                  Masa Depan Manajemen Keuangan Pribadi
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Typography variant="body1" color="text.secondary">
                  © 2025 MeowIQ. Dibuat dengan ❤️ dan teknologi terdepan
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Interactive Demo Modal */}
        <InteractiveDemo 
          open={demoOpen} 
          onClose={() => setDemoOpen(false)} 
        />
      </Box>
    </ThemeProvider>
  );
};

export default LandingPage;