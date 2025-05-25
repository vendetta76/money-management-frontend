import { useState } from "react";
import { formatCurrency } from "../helpers/formatCurrency";
import { useTransfer } from "./TransferContext";
import { useAuth } from "../../context/AuthContext";
import { formatAmountWithThousandSeparator, processTransfer } from "./transferUtils";
import { 
  Loader2, 
  ArrowRightLeft, 
  Wallet, 
  DollarSign, 
  FileText, 
  Sparkles,
  CreditCard,
  CheckCircle,
  Save,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

// Add CSS to prevent iOS overscroll/bounce in PWA
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Prevent iOS bounce/overscroll in PWA */
    html, body {
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
      overflow-x: hidden;
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    /* PWA specific fixes */
    .pwa-container {
      touch-action: pan-y;
      overscroll-behavior: none;
      -webkit-overflow-scrolling: touch;
    }
    
    /* Prevent horizontal scroll and drag */
    body {
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      -webkit-text-size-adjust: none;
    }
    
    /* Allow text selection in form inputs */
    input, textarea, select, [contenteditable] {
      user-select: text;
      -webkit-user-select: text;
    }
    
    /* Fix for iOS PWA viewport */
    @media screen and (max-width: 768px) {
      html {
        overflow-x: hidden;
        overscroll-behavior-x: none;
      }
      
      body {
        overflow-x: hidden;
        overscroll-behavior-x: none;
        position: relative;
      }
    }
  `;
  document.head.appendChild(style);
}

const TransferForm: React.FC = () => {
  const { user } = useAuth();
  const {
    wallets,
    fromWalletId,
    toWalletId,
    amount,
    description,
    editingTransfer,
    setFromWalletId,
    setToWalletId,
    setAmount,
    setDescription,
    resetForm,
  } = useTransfer();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmountWithThousandSeparator(e.target.value));
    setErrors({ ...errors, amount: "" });
  };

  const getSelectedWallet = (walletId: string) => {
    return wallets.find((w) => w.id === walletId) || null;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fromWalletId.trim()) e.fromWallet = "Dompet asal wajib dipilih.";
    if (!toWalletId.trim()) e.toWallet = "Dompet tujuan wajib dipilih.";
    if (fromWalletId === toWalletId) e.sameWallet = "Dompet asal dan tujuan tidak boleh sama.";
    if (!description.trim()) e.description = "Deskripsi wajib diisi.";
    if (!amount.trim() || parseFloat(amount.replace(/\./g, "").replace(",", ".")) <= 0) 
      e.amount = "Nominal harus lebih dari 0.";
    
    const fromWallet = getSelectedWallet(fromWalletId);
    const parsedAmount = Number(amount.replace(/\./g, "").replace(",", "."));
    if (fromWallet && parsedAmount > fromWallet.balance) {
      e.insufficientBalance = "Saldo dompet asal tidak mencukupi.";
    }
    
    return e;
  };

  const handleTransfer = async () => {
    if (!user) return;
    
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await processTransfer(
        user.uid,
        fromWalletId,
        toWalletId,
        amount,
        description,
        wallets,
        editingTransfer,
        resetForm
      );
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Transfer error:", error);
      setErrors({ general: "Gagal melakukan transfer. Silakan coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  const fromWallet = getSelectedWallet(fromWalletId);
  const toWallet = getSelectedWallet(toWalletId);
  const parsedAmount = Number(amount.replace(/\./g, "").replace(",", ".")) || 0;
  const hasInsufficientBalance = fromWallet && parsedAmount > fromWallet.balance;

  return (
    <div className="relative pwa-container">
      {/* Success Animation */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
          <div className="bg-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 animate-bounce max-w-sm text-center">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base">
              {editingTransfer ? "Transfer diperbarui! ✨" : "Transfer berhasil! 💫"}
            </span>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-gradient-to-br from-white via-emerald-50/40 to-green-50/30 dark:from-gray-800 dark:via-emerald-900/20 dark:to-green-900/10 p-4 sm:p-6 lg:p-8 rounded-3xl lg:rounded-[2rem] shadow-2xl border-2 border-emerald-200/50 dark:border-emerald-700/30 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-green-200/20 dark:from-emerald-800/20 dark:to-green-800/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-200/20 to-emerald-200/20 dark:from-green-800/20 dark:to-emerald-800/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 p-3 sm:p-4 rounded-2xl shadow-xl flex-shrink-0 transform hover:scale-110 transition-all duration-300">
              <ArrowRightLeft className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                {editingTransfer ? "Edit Transfer" : "Transfer Antar Wallet"}
              </h2>
              <p className="text-emerald-600 dark:text-emerald-300 text-sm sm:text-base flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Pindahkan dana antar dompet dengan mudah
              </p>
            </div>
            {editingTransfer && (
              <div className="sm:ml-auto">
                <span className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 px-3 sm:px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  ✏️ Mode Edit
                </span>
              </div>
            )}
          </div>

          {/* Error Messages */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <p className="font-semibold text-sm">Perhatian</p>
              </div>
              {Object.values(errors).map((error, i) => (
                <p key={i} className="text-red-600 dark:text-red-400 text-xs sm:text-sm">• {error}</p>
              ))}
            </div>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* From Wallet Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Wallet className="w-4 h-4 text-emerald-500" />
                Dari Dompet
              </label>
              <div className="relative">
                <select
                  value={fromWalletId}
                  onChange={(e) => {
                    setFromWalletId(e.target.value);
                    setErrors({ ...errors, fromWallet: "", sameWallet: "", insufficientBalance: "" });
                  }}
                  onFocus={() => setFocusedField('fromWallet')}
                  onBlur={() => setFocusedField(null)}
                  disabled={loading}
                  className={`w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 dark:bg-gray-700 dark:text-white text-gray-800 font-medium transition-all duration-300 text-sm sm:text-base min-h-[48px] ${
                    errors.fromWallet || errors.sameWallet || errors.insufficientBalance
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'fromWallet'
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  <option value="">-- Pilih Dompet Asal --</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
                    </option>
                  ))}
                </select>
                <CreditCard className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  focusedField === 'fromWallet' ? 'text-emerald-500' : 'text-gray-400'
                }`} />
              </div>
            </div>

            {/* Transfer Arrow */}
            {fromWalletId && toWalletId && (
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-3 rounded-full shadow-lg animate-pulse">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            )}

            {/* To Wallet Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <Wallet className="w-4 h-4 text-green-500" />
                Ke Dompet
              </label>
              <div className="relative">
                <select
                  value={toWalletId}
                  onChange={(e) => {
                    setToWalletId(e.target.value);
                    setErrors({ ...errors, toWallet: "", sameWallet: "" });
                  }}
                  onFocus={() => setFocusedField('toWallet')}
                  onBlur={() => setFocusedField(null)}
                  disabled={loading}
                  className={`w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 dark:bg-gray-700 dark:text-white text-gray-800 font-medium transition-all duration-300 text-sm sm:text-base min-h-[48px] ${
                    errors.toWallet || errors.sameWallet
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'toWallet'
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-100 dark:shadow-green-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-green-300 hover:bg-green-50/50"
                  }`}
                >
                  <option value="">-- Pilih Dompet Tujuan --</option>
                  {wallets.map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
                    </option>
                  ))}
                </select>
                <CreditCard className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                  focusedField === 'toWallet' ? 'text-green-500' : 'text-gray-400'
                }`} />
              </div>
            </div>

            {/* Wallet Preview Cards */}
            {(fromWallet || toWallet) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {fromWallet && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dari:</p>
                    <div
                      className="rounded-xl text-white p-4 shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${fromWallet.color || '#10B981'} 0%, ${fromWallet.color || '#10B981'}dd 100%)`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                      <div className="relative z-10">
                        <h3 className="text-sm font-bold truncate mb-2">{fromWallet.name}</h3>
                        <p className="text-lg font-bold">
                          {formatCurrency(fromWallet.balance || 0, fromWallet.currency)}
                        </p>
                        {hasInsufficientBalance && (
                          <p className="text-xs bg-red-500/20 px-2 py-1 rounded mt-1">
                            ⚠️ Saldo tidak cukup
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {toWallet && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ke:</p>
                    <div
                      className="rounded-xl text-white p-4 shadow-lg transform hover:scale-105 transition-transform duration-300 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${toWallet.color || '#059669'} 0%, ${toWallet.color || '#059669'}dd 100%)`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                      <div className="relative z-10">
                        <h3 className="text-sm font-bold truncate mb-2">{toWallet.name}</h3>
                        <p className="text-lg font-bold">
                          {formatCurrency(toWallet.balance || 0, toWallet.currency)}
                        </p>
                        {parsedAmount > 0 && (
                          <p className="text-xs bg-green-500/20 px-2 py-1 rounded mt-1">
                            +{formatCurrency(parsedAmount, toWallet.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Jumlah Transfer
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.,]*"
                  value={amount}
                  onChange={handleAmountChange}
                  onFocus={() => setFocusedField('amount')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Masukkan jumlah"
                  disabled={loading}
                  className={`w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 dark:bg-gray-700 dark:text-white text-gray-800 text-lg sm:text-xl font-bold placeholder-gray-400 transition-all duration-300 min-h-[48px] pr-16 ${
                    errors.amount || errors.insufficientBalance
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'amount'
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-sm">
                  {fromWallet?.currency || "IDR"}
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <FileText className="w-4 h-4 text-green-500" />
                Deskripsi *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors({ ...errors, description: "" });
                  }}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Masukkan deskripsi (wajib)"
                  disabled={loading}
                  className={`w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 dark:bg-gray-700 dark:text-white text-gray-800 placeholder-gray-400 font-medium transition-all duration-300 text-sm sm:text-base min-h-[48px] ${
                    errors.description
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'description'
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-100 dark:shadow-green-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-green-300 hover:bg-green-50/50"
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                {loading ? "Memproses..." : editingTransfer ? "Perbarui Transfer" : "Transfer"}
              </button>

              {editingTransfer && (
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="w-full px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl min-h-[48px]"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferForm;