import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Minus,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  X,
  RotateCcw,
  Building2,
  BarChart3,
  Sparkles
} from 'lucide-react';

const categories = [
  { id: 'food', name: 'Makanan & Minuman', icon: '🍽️', color: 'bg-red-500' },
  { id: 'transport', name: 'Transportasi', icon: '🚗', color: 'bg-blue-500' },
  { id: 'shopping', name: 'Belanja', icon: '🛍️', color: 'bg-yellow-500' },
  { id: 'bills', name: 'Tagihan', icon: '🏠', color: 'bg-purple-500' },
  { id: 'salary', name: 'Gaji', icon: '💼', color: 'bg-green-500' },
  { id: 'investment', name: 'Investasi', icon: '📈', color: 'bg-indigo-500' },
];

const EnhancedDemoPage = () => {
  const [wallets, setWallets] = useState([
    { id: 'main', name: 'Dompet Utama', balance: 2500000, gradient: 'from-pink-500 to-teal-500' },
    { id: 'savings', name: 'Tabungan', balance: 5000000, gradient: 'from-green-500 to-emerald-600' },
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

    // Update wallet balances - keeping the original logic
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
    setTimeout(() => setShowSuccess(false), 4000);
    setOpenDialog(false);
    setForm({ name: '', amount: '', category: 'food', from: 'main', to: 'savings' });
  };

  const openTransactionDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const resetDemo = () => {
    setWallets([
      { id: 'main', name: 'Dompet Utama', balance: 2500000, gradient: 'from-pink-500 to-teal-500' },
      { id: 'savings', name: 'Tabungan', balance: 5000000, gradient: 'from-green-500 to-emerald-600' },
    ]);
    setTransactions([
      { id: 1, name: 'Gaji Bulanan', amount: 8000000, type: 'income', category: 'salary', date: new Date(), from: 'main' },
      { id: 2, name: 'Belanja Groceries', amount: -350000, type: 'expense', category: 'shopping', date: new Date(), from: 'main' },
    ]);
    setSuccessMessage('🔄 Demo telah direset!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Success Alert */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-from-top">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-300 to-teal-300 rounded-full -mr-16 -mt-16 opacity-20"></div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-teal-500 bg-clip-text text-transparent">
            🎮 Demo Interaktif MeowIQ
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Kelola keuangan Anda dengan mudah dan cerdas
          </p>
          
          {/* Total Balance Indicator */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-full font-bold text-lg shadow-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Total Saldo: {formatCurrency(totalBalance)}
          </div>
        </div>

        {/* Wallets Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Wallet className="w-8 h-8 text-pink-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">Dompet Anda</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {wallets.map((wallet, index) => (
              <div
                key={wallet.id}
                className={`bg-gradient-to-r ${wallet.gradient} text-white rounded-2xl p-6 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full p-4 animate-pulse">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{wallet.name}</h3>
                    <p className="text-white text-opacity-90 mb-2">Saldo Tersedia</p>
                    <p className="text-3xl font-bold">{formatCurrency(wallet.balance)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <BarChart3 className="w-8 h-8 text-pink-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">Aksi Cepat</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => openTransactionDialog('income')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl p-6 flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-6 h-6" />
              <span className="text-lg font-semibold">Tambah Pemasukan</span>
            </button>
            
            <button
              onClick={() => openTransactionDialog('expense')}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl p-6 flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Minus className="w-6 h-6" />
              <span className="text-lg font-semibold">Tambah Pengeluaran</span>
            </button>
            
            <button
              onClick={() => openTransactionDialog('transfer')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 flex items-center justify-center space-x-3 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowLeftRight className="w-6 h-6" />
              <span className="text-lg font-semibold">Transfer Dompet</span>
            </button>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">Riwayat Transaksi ({transactions.length})</h2>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤷‍♂️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum ada transaksi</h3>
                <p className="text-gray-500">Mulai tambahkan transaksi pertama Anda!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((tx, index) => {
                  const categoryInfo = getCategoryInfo(tx.category);
                  const fromWallet = getWalletInfo(tx.from);
                  const toWallet = getWalletInfo(tx.to);
                  
                  return (
                    <div
                      key={tx.id}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl ${
                          tx.type === 'income' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          tx.type === 'expense' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}>
                          {tx.type === 'transfer' ? <ArrowLeftRight className="w-6 h-6" /> : categoryInfo.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-lg font-semibold">{tx.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tx.type === 'income' ? 'bg-green-100 text-green-800' :
                              tx.type === 'expense' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {tx.type !== 'transfer' ? categoryInfo.name : `${fromWallet?.name} → ${toWallet?.name}`}
                            </span>
                            <span>• {tx.date.toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-xl font-bold ${
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

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={resetDemo}
            className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-pink-500 text-pink-500 rounded-full font-semibold hover:bg-pink-500 hover:text-white transition-all transform hover:scale-105"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setOpenDialog(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 animate-bounce"
        >
          <Plus className="w-8 h-8" />
        </button>

        {/* Transaction Dialog */}
        {openDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-3xl animate-scale-in">
              
              {/* Dialog Header */}
              <div className="bg-gradient-to-r from-pink-500 to-teal-500 text-white p-6 rounded-t-3xl flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {dialogType === 'income' ? '💰 Tambah Pemasukan' : 
                   dialogType === 'expense' ? '💸 Tambah Pengeluaran' : 
                   '🔄 Transfer Dompet'}
                </h3>
                <button
                  onClick={() => setOpenDialog(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Dialog Content */}
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder={
                    dialogType === 'income' ? 'cth: Gaji, Bonus, Freelance' :
                    dialogType === 'expense' ? 'cth: Makan, Transport, Belanja' :
                    'cth: Transfer ke Tabungan'
                  }
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                />
                
                <input
                  type="number"
                  placeholder="Masukkan jumlah"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                />
                
                {(dialogType === 'income' || dialogType === 'expense') && (
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
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
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
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
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
                  >
                    {wallets.filter(w => w.id !== form.from).map(w => (
                      <option key={w.id} value={w.id}>
                        🏦 {w.name} ({formatCurrency(w.balance)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Dialog Actions */}
              <div className="p-6 pt-0 flex space-x-3">
                <button
                  onClick={() => setOpenDialog(false)}
                  className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleTransaction}
                  disabled={!form.name || !form.amount}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-teal-500 text-white rounded-xl hover:from-pink-600 hover:to-teal-600 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Simpan Transaksi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-from-top {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-slide-in-from-top {
          animation: slide-in-from-top 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EnhancedDemoPage;