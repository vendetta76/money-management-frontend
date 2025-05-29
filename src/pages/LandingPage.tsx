import React, { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  ArrowLeftRight,
  X,
  Star,
  Wallet,
  BarChart3,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Building2,
  Rocket,
  Sparkles,
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-3xl mx-2 md:mx-0">
        
        {/* Success Alert */}
        {showSuccess && (
          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50">
            <div className="bg-green-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-2xl flex items-center space-x-2 animate-bounce">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold text-sm md:text-base">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-teal-500 text-white p-4 md:p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-1">🎮 Demo Interaktif MeowIQ</h2>
            <p className="opacity-90 text-sm md:text-base">Rasakan pengalaman mengelola keuangan yang sesungguhnya</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-80px)] md:max-h-[calc(90vh-100px)]">
          <div className="p-4 md:p-6">
            
            {/* Total Balance */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-full font-bold text-sm md:text-lg shadow-lg">
                <Star className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Total Saldo: {formatCurrency(totalBalance)}
              </div>
            </div>

            {/* Wallets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`bg-gradient-to-r ${wallet.gradient} text-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg`}
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className="bg-white bg-opacity-20 rounded-full p-2 md:p-3">
                      <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold">{wallet.name}</h3>
                      <p className="text-xl md:text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
              <button
                onClick={() => openTransactionDialogHandler('income')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-3 md:p-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Pemasukan</span>
              </button>
              
              <button
                onClick={() => openTransactionDialogHandler('expense')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl p-3 md:p-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
              >
                <Minus className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Pengeluaran</span>
              </button>
              
              <button
                onClick={() => openTransactionDialogHandler('transfer')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-3 md:p-4 flex items-center justify-center space-x-2 transition-all transform hover:scale-105 md:col-span-1 col-span-1"
              >
                <ArrowLeftRight className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-sm md:text-base">Transfer</span>
              </button>
            </div>

            {/* Transactions */}
            <div className="bg-gray-50 rounded-xl md:rounded-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 md:p-4">
                <h3 className="text-base md:text-lg font-bold flex items-center">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Riwayat Transaksi ({transactions.length})
                </h3>
              </div>
              
              <div className="max-h-56 md:max-h-64 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="text-center py-6 md:py-8">
                    <div className="text-3xl md:text-4xl mb-2">🤷‍♂️</div>
                    <p className="text-gray-600 text-sm md:text-base">Belum ada transaksi</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {transactions.slice(0, 5).map((tx) => {
                      const categoryInfo = getCategoryInfo(tx.category);
                      const fromWallet = getWalletInfo(tx.from);
                      const toWallet = getWalletInfo(tx.to);
                      
                      return (
                        <div key={tx.id} className="p-3 md:p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                              tx.type === 'income' ? 'bg-green-500' :
                              tx.type === 'expense' ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                              {tx.type === 'transfer' ? <ArrowLeftRight className="w-3 h-3 md:w-4 md:h-4" /> : categoryInfo.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm md:text-base truncate">{tx.name}</p>
                              <p className="text-xs md:text-sm text-gray-600 truncate">
                                {tx.type !== 'transfer' ? categoryInfo.name : `${fromWallet?.name} → ${toWallet?.name}`}
                              </p>
                            </div>
                          </div>
                          <div className={`font-bold text-sm md:text-base flex-shrink-0 ml-2 ${
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
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <button
                onClick={resetDemo}
                className="w-full md:w-auto px-4 md:px-6 py-2 border-2 border-pink-500 text-pink-500 rounded-full font-semibold hover:bg-pink-500 hover:text-white transition-all text-sm md:text-base"
              >
                🔄 Reset Demo
              </button>
              <button
                onClick={() => window.open('/register', '_blank')}
                className="w-full md:w-auto px-4 md:px-6 py-2 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-full font-semibold hover:from-pink-600 hover:to-teal-600 transition-all text-sm md:text-base"
              >
                🚀 Mulai Sekarang
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Dialog */}
        {openTransactionDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
              
              <div className="bg-gradient-to-r from-pink-500 to-teal-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-base md:text-lg font-bold">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                />
                
                <input
                  type="number"
                  placeholder="Jumlah (Rp)"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                />
                
                {(dialogType === 'income' || dialogType === 'expense') && (
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm md:text-base"
                  >
                    {wallets.filter(w => w.id !== form.from).map(w => (
                      <option key={w.id} value={w.id}>
                        🏦 {w.name} ({formatCurrency(w.balance)})
                      </option>
                    ))}
                  </select>
                )}
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-2">
                  <button
                    onClick={() => setOpenTransactionDialog(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors text-sm md:text-base"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleTransaction}
                    disabled={!form.name || !form.amount}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-lg hover:from-pink-600 hover:to-teal-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base"
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
    <div className="h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Floating elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-20 rounded-full animate-bounce"></div>
      <div className="absolute top-20 right-16 w-16 h-16 bg-white bg-opacity-15 rounded transform rotate-45"></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 bg-white bg-opacity-10 rounded"></div>

      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-24 h-24 mx-auto mb-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="w-12 h-12 text-pink-500" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          MeowIQ
        </h1>

        <p className="text-lg md:text-xl mb-8 text-white text-opacity-90 min-h-[2.5rem]">
          {loadingText}
        </p>

        <div className="w-full bg-white bg-opacity-30 rounded-full h-2.5 mb-8">
          <div 
            className="bg-gradient-to-r from-pink-500 to-teal-500 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-white bg-opacity-80 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.3}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
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
    <div className="bg-white min-h-screen relative">
      
      {/* Floating background elements */}
      <div className="absolute top-5 left-5 w-32 h-32 bg-gradient-to-r from-pink-500 to-teal-500 rounded-full opacity-10 animate-bounce"></div>
      <div className="absolute top-60 right-10 w-24 h-24 bg-gradient-to-r from-green-500 to-yellow-500 rounded opacity-10 animate-bounce" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-10 left-16 w-20 h-20 bg-gradient-to-r from-blue-500 to-red-500 rounded opacity-10 animate-bounce" style={{animationDelay: '4s'}}></div>

      {/* AppBar */}
      <nav className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold text-pink-500">MeowIQ</span>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/login"
                className="text-gray-700 hover:text-pink-500 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors"
              >
                Masuk
              </a>
              <a 
                href="/register"
                className="bg-gradient-to-r from-pink-500 to-teal-500 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-teal-600 transition-all transform hover:scale-105"
              >
                Daftar
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center py-12 md:py-20">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-white font-semibold mb-6 backdrop-blur-sm border border-white border-opacity-30">
              <Rocket className="w-5 h-5 mr-2" />
              Transformasi Masa Depan Keuangan Anda
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white drop-shadow-lg">
              Kelola Keuangan
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                Dengan Cerdas
              </span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white text-opacity-90 font-light">
              Aplikasi PWA revolusioner yang mengubah cara Anda mengelola dompet, melacak transaksi, dan melihat wawasan keuangan dengan analisis bertenaga AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              <a 
                href="/login"
                className="inline-flex items-center px-8 py-4 border-2 border-white border-opacity-50 text-white bg-white bg-opacity-10 rounded-full hover:bg-opacity-20 transition-all backdrop-blur-sm font-semibold"
              >
                Masuk Sekarang
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              
              <a 
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 font-bold shadow-lg"
              >
                Mulai Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">50K+</div>
                <div className="text-white text-opacity-80">Pengguna Aktif</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">Rp10M+</div>
                <div className="text-white text-opacity-80">Dikelola</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-white">99.9%</div>
                <div className="text-white text-opacity-80">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-20">
        <div 
          className="aspect-video bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300 relative overflow-hidden"
          onClick={() => setDemoOpen(true)}
        >
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-teal-500 rounded-full flex items-center justify-center animate-pulse">
                <Play className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              🎮 Coba Demo Interaktif
            </h3>
            <p className="text-xl text-gray-600 mb-6">
              Rasakan pengalaman MeowIQ secara langsung!
            </p>
            
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-full font-semibold text-lg hover:from-pink-600 hover:to-teal-600 transition-all transform hover:scale-105">
              <Play className="w-6 h-6 mr-2" />
              Mulai Demo
            </button>
          </div>
          
          {/* Decorative floating elements */}
          <div className="absolute top-8 left-8 w-10 h-10 bg-gradient-to-r from-pink-500 to-teal-500 rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-500 rounded opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            Fitur <span className="bg-gradient-to-r from-pink-500 via-teal-500 to-green-500 bg-clip-text text-transparent">Canggih</span>
          </h2>
          <p className="text-xl text-gray-600">
            Semua yang Anda butuhkan untuk menguasai keuangan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 text-center hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Keamanan Tingkat Bank
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Enkripsi tingkat militer dan protokol keamanan berlapis melindungi data keuangan Anda dengan arsitektur zero-trust.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 text-center hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Wawasan Bertenaga AI
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Algoritma pembelajaran mesin menganalisis pola pengeluaran Anda dan memberikan rekomendasi personal untuk kesehatan keuangan optimal.
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 text-center hover:transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl cursor-pointer">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Super Cepat
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Teknologi Progressive Web App memastikan loading instan, fungsi offline, dan performa seperti aplikasi native.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 my-16 rounded-3xl max-w-7xl mx-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Mulai dalam <span className="bg-gradient-to-r from-pink-500 via-teal-500 to-green-500 bg-clip-text text-transparent">Hitungan Menit</span>
            </h2>
            <p className="text-xl text-gray-600">
              Setup sederhana, hasil yang powerful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { icon: <Building2 />, title: "Buat Akun", desc: "Daftar secara instan dengan email atau login sosial. Tidak perlu kartu kredit." },
              { icon: <Sparkles />, title: "Setup Pintar", desc: "Konfigurasi dompet dengan panduan AI yang disesuaikan dengan tujuan dan preferensi keuangan Anda." },
              { icon: <TrendingUp />, title: "Lacak & Analisis", desc: "Kategorisasi transaksi otomatis dengan wawasan real-time dan peringatan pengeluaran." },
              { icon: <Star />, title: "Optimalisasi & Berkembang", desc: "Terima rekomendasi personal untuk memaksimalkan tabungan dan peluang investasi." }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-r ${
                  index % 2 === 0 ? 'from-pink-500 to-teal-500' : 'from-green-500 to-yellow-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-gradient-to-r from-pink-500 to-teal-500 rounded-3xl p-12 text-white relative overflow-hidden">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Siap Mengubah
            <br />
            Masa Depan Keuangan Anda?
          </h2>
          
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Bergabunglah dengan ribuan pengguna cerdas yang telah merevolusi manajemen keuangan mereka dengan MeowIQ.
          </p>

          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-300 fill-current" />
              ))}
            </div>
            <span className="text-white opacity-90 ml-2">
              Rating 5.0 dari 50,000+ pengguna
            </span>
          </div>

          <a 
            href="/register"
            className="inline-flex items-center px-10 py-4 bg-white text-pink-500 rounded-full font-bold text-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Mulai Perjalanan Anda
            <ArrowRight className="w-6 h-6 ml-2" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-8 h-8 text-pink-500" />
                <span className="text-3xl font-bold text-pink-500">MeowIQ</span>
              </div>
              <p className="text-xl text-gray-600">
                Masa Depan Manajemen Keuangan Pribadi
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-600">
                © 2025 MeowIQ. Dibuat dengan ❤️ dan teknologi terdepan
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{textAlign: 'center', fontSize: '14px', marginTop: '40px', paddingBottom: '20px'}}>
          Powered by <a href="https://meowiq.com" rel="dofollow" target="_blank">MeowIQ</a>
        </p>
      </footer>
      
      {/* Interactive Demo Modal */}
      <InteractiveDemo 
        open={demoOpen} 
        onClose={() => setDemoOpen(false)} 
      />
    </div>
  );
};

export default LandingPage;