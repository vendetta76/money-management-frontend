import { useState, useEffect, useRef } from "react";
import { useAuth } from "src/context/AuthContext";
import { db } from "src/lib/firebaseClient";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { 
  Loader2, 
  Wallet, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Sparkles,
  CreditCard,
  Plus,
  Save
} from "lucide-react";
import { formatCurrency } from "src/pages/helpers/formatCurrency";
import { getCardStyle } from "src/pages/helpers/getCardStyle";
import { WalletEntry, IncomeEntry } from "src/pages/helpers/types";
import QuickAmountButtons from "src/pages/helpers/QuickAmountButtons";
import { toast } from "react-toastify";

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

interface IncomeFormProps {
  hideCardPreview?: boolean;
  presetWalletId?: string;
  onClose?: () => void;
  editingEntry?: IncomeEntry | null;
  onEditComplete?: () => void;
  onSuccess?: (isEdit: boolean) => void; // New prop for success callback
}

const IncomeForm: React.FC<IncomeFormProps> = ({ 
  presetWalletId, 
  onClose, 
  hideCardPreview, 
  editingEntry, 
  onEditComplete,
  onSuccess 
}) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [form, setForm] = useState({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const handleQuickAmount = (value: number) => {
    const formattedAmount = value.toLocaleString('id-ID', {
      useGrouping: true,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    setForm({ ...form, amount: formattedAmount });
    setErrors({ ...errors, amount: "" });
  };

  // Handle editing existing entry
  useEffect(() => {
    if (editingEntry) {
      setEditingId(editingEntry.id);
      
      const formattedAmount = editingEntry.amount.toLocaleString('id-ID', {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      
      setForm({
        wallet: editingEntry.wallet,
        description: editingEntry.description,
        amount: formattedAmount,
        currency: editingEntry.currency
      });
    } else {
      setEditingId(null);
      setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
    }
  }, [editingEntry, presetWalletId]);

  useEffect(() => {
    if (!user) return;
    
    const walletRef = collection(db, "users", user.uid, "wallets");
    
    const unsubWallets = onSnapshot(walletRef, (snap) => {
      const allWallets = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WalletEntry[];
      
      const activeWallets = allWallets.filter(w => {
        if (!w.name || w.name.trim() === '' || w.id.startsWith('_')) {
          return false;
        }
        
        const isArchived = w.status === "archived" || 
                          w.status === "deleted" || 
                          w.status === "inactive" ||
                          w.isArchived === true ||
                          w.deleted === true ||
                          w.active === false;
        
        return !isArchived;
      });
      
      setWallets(activeWallets);
      
      if (form.wallet && !activeWallets.find(w => w.id === form.wallet)) {
        setForm(prev => ({ ...prev, wallet: "", currency: "" }));
        if (presetWalletId === form.wallet) {
          toast.error("Dompet yang dipilih sudah dihapus atau diarsipkan.");
          if (onClose) onClose();
        }
      }
    });
    
    const incomeRef = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      setIncomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IncomeEntry[]);
    });
    
    return () => {
      unsubWallets();
      unsubIncomes();
    };
  }, [user, form.wallet, presetWalletId, onClose]);

   // 🎯 ADD THIS NEW useEffect HERE ⬇️
  // Auto-detect currency when preset wallet is ready
  useEffect(() => {
    if (presetWalletId && wallets.length > 0 && !form.currency) {
      const presetWallet = wallets.find(w => w.id === presetWalletId);
      if (presetWallet?.currency) {
        console.log("🎯 Auto-setting currency for preset wallet:", presetWallet.currency);
        setForm(prev => ({
          ...prev,
          currency: presetWallet.currency
        }));
      }
    }
  }, [presetWalletId, wallets, form.currency]);
  // 🎯 END OF NEW CODE ⬆️

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      let cleaned = value.replace(/[^0-9.,]/g, "");
      
      const parts = cleaned.split(",");
      if (parts.length > 2) {
        cleaned = parts[0] + "," + parts.slice(1).join("").replace(/,/g, "");
      }
      
      const numberWithoutSeparator = parts[0].replace(/\./g, "");
      
      let formattedInteger = "";
      if (numberWithoutSeparator.length > 0) {
        formattedInteger = numberWithoutSeparator.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }
      
      const finalValue = parts.length > 1 
        ? formattedInteger + "," + parts[1] 
        : formattedInteger;
        
      setForm({ ...form, amount: finalValue });
    } else {
      setForm({ ...form, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = wallets.find((w) => w.id === e.target.value);
    setForm({
      ...form,
      wallet: e.target.value,
      currency: selected?.currency || "",
    });
    setErrors({ ...errors, wallet: "", currency: "" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.wallet.trim()) e.wallet = "Dompet wajib dipilih.";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi.";
    if (!form.amount.trim() || parseFloat(form.amount.replace(/\./g, "").replace(",", ".")) <= 0) 
      e.amount = "Nominal harus lebih dari 0.";
    if (!form.currency.trim()) e.currency = "Mata uang wajib dipilih.";
    
    if (form.wallet && !wallets.find(w => w.id === form.wallet)) {
      e.wallet = "Dompet sudah dihapus atau diarsipkan.";
    }
    
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;

    const selectedWallet = wallets.find(w => w.id === form.wallet);
    if (!selectedWallet) {
      toast.error("Dompet sudah dihapus atau diarsipkan.");
      return;
    }

    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      if (!editingId) {
        const incomeData = {
          amount: parsedAmount,
          description: form.description,
          wallet: form.wallet,
          currency: form.currency,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "users", user.uid, "incomes"), incomeData);
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(parsedAmount),
        });
      } else {
        const old = incomes.find((i) => i.id === editingId);
        if (!old) return;
        await updateDoc(doc(db, "users", user.uid, "incomes", editingId), {
          description: form.description,
          amount: parsedAmount,
          wallet: form.wallet,
          currency: form.currency,
          editHistory: arrayUnion({
            description: old.description,
            amount: old.amount,
            editedAt: new Date(),
          }),
        });
        const diff = parsedAmount - old.amount;
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(diff),
        });
      }

      setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: form.currency });
      setEditingId(null);
      
      // Call parent success callback instead of showing toast here
      if (onSuccess) {
        onSuccess(!!editingId);
      }
      
      if (editingId && onEditComplete) {
        onEditComplete();
      }
      
      if (onClose) onClose();
    } catch (err) {
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAndContinue = async () => {
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;

    const selectedWallet = wallets.find(w => w.id === form.wallet);
    if (!selectedWallet) {
      toast.error("Dompet sudah dihapus atau diarsipkan.");
      return;
    }

    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      const incomeData = {
        amount: parsedAmount,
        description: form.description,
        wallet: form.wallet,
        currency: form.currency,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", user.uid, "incomes"), incomeData);
      await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
        balance: increment(parsedAmount),
      });

      setForm({ wallet: form.wallet, description: "", amount: "", currency: form.currency });
      setTimeout(() => descriptionRef.current?.focus(), 50);
      
      // Call parent success callback
      if (onSuccess) {
        onSuccess(false);
      }
    } catch (err) {
      toast.error("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedWallet = () => {
    if (!form.wallet) return null;
    return wallets.find((w) => w.id === form.wallet) || null;
  };

  const resetForm = () => {
    setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
    setEditingId(null);
    setErrors({});
    if (onEditComplete) onEditComplete();
    if (onClose) onClose();
  };

  return (
    <div className="relative pwa-container">
      {/* Main Form Card */}
      <div className="bg-gradient-to-br from-white via-purple-50/40 to-pink-50/30 dark:from-gray-800 dark:via-purple-900/20 dark:to-pink-900/10 p-4 sm:p-6 lg:p-8 rounded-3xl lg:rounded-[2rem] shadow-2xl border-2 border-purple-200/50 dark:border-purple-700/30 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 dark:from-purple-800/20 dark:to-pink-800/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-purple-200/20 dark:from-blue-800/20 dark:to-purple-800/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 p-3 sm:p-4 rounded-2xl shadow-xl flex-shrink-0 transform hover:scale-110 transition-all duration-300">
            {editingId ? (
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            ) : (
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              {editingId ? "Edit Pemasukan" : "Tambah Pemasukan"}
            </h2>
            <p className="text-purple-600 dark:text-purple-300 text-sm sm:text-base flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Catat pemasukan Anda dengan mudah
            </p>
          </div>
          {editingId && (
            <div className="sm:ml-auto">
              <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 sm:px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ✏️ Mode Edit
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Wallet Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Wallet className="w-4 h-4 text-purple-500" />
              Pilih Dompet
            </label>
            <div className="relative">
              <select
                name="wallet"
                value={form.wallet}
                onChange={handleWalletChange}
                disabled={!!presetWalletId || loading}
                onFocus={() => setFocusedField('wallet')}
                onBlur={() => setFocusedField(null)}
                className={`w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 pr-10 sm:pr-12 dark:bg-gray-700 dark:text-white text-gray-800 font-medium transition-all duration-300 text-sm sm:text-base min-h-[48px] ${
                  errors.wallet 
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                    : focusedField === 'wallet'
                    ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-100 dark:shadow-purple-900/20"
                    : "border-gray-200 dark:border-gray-600 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                }`}
              >
                <option value="">-- Pilih Dompet --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} • {formatCurrency(w.balance || 0, w.currency)}
                  </option>
                ))}
              </select>
              <CreditCard className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                focusedField === 'wallet' ? 'text-purple-500' : 'text-gray-400'
              }`} />
            </div>
            {errors.wallet && (
              <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.wallet}
              </p>
            )}

            {/* Wallet Card Preview */}
            {form.wallet && !hideCardPreview && (
              <div className="mt-4 sm:mt-6 transform transition-all duration-500 animate-in slide-in-from-top-4">
                {(() => {
                  const selectedWallet = getSelectedWallet();
                  if (!selectedWallet) return null;
                  
                  return (
                    <div
                      className="rounded-xl sm:rounded-2xl text-white p-4 sm:p-6 shadow-xl transform hover:scale-105 transition-transform duration-300 cursor-pointer relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${selectedWallet.color || '#3B82F6'} 0%, ${selectedWallet.color || '#3B82F6'}dd 100%)`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                          <h3 className="text-base sm:text-lg font-bold truncate pr-2">{selectedWallet.name}</h3>
                          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 opacity-80 flex-shrink-0" />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold">
                          {formatCurrency(selectedWallet.balance || 0, selectedWallet.currency)}
                        </p>
                        <p className="text-xs sm:text-sm opacity-80 mt-1">Current Balance</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Description and Amount - Now Vertical Layout */}
          <div className="space-y-4 sm:space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <FileText className="w-4 h-4 text-pink-500" />
                Deskripsi
              </label>
              <div className="relative">
                <input
                  ref={descriptionRef}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Contoh: Gaji bulanan, Bonus..."
                  disabled={loading}
                  className={`w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 dark:bg-gray-700 dark:text-white text-gray-800 placeholder-gray-400 font-medium transition-all duration-300 text-sm sm:text-base min-h-[48px] ${
                    errors.description 
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'description'
                      ? "border-pink-400 bg-pink-50 dark:bg-pink-900/20 shadow-lg shadow-pink-100 dark:shadow-pink-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-pink-300 hover:bg-pink-50/50"
                  }`}
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Nominal
              </label>
              <div className="relative">
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('amount')}
                  onBlur={() => setFocusedField(null)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.,]*"
                  placeholder="Ketik nominal"
                  disabled={loading}
                  className={`w-full rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 dark:bg-gray-700 dark:text-white text-gray-800 text-lg sm:text-xl font-bold placeholder-gray-400 transition-all duration-300 min-h-[48px] pr-16 ${
                    errors.amount 
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'amount'
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                />
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-sm">
                  {form.currency || "IDR"}
                </div>
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs sm:text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Quick Amount Buttons */}
          {form.currency && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Nominal Cepat:</p>
              <QuickAmountButtons
                currency={form.currency}
                onAmountSelect={handleQuickAmount}
                disabled={loading}
              />
            </div>
          )}

          {/* Currency Display */}
          <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg flex-shrink-0">
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Mata Uang</p>
                <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                  {form.currency || "Akan otomatis terisi setelah memilih dompet"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2 sm:pt-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="w-full px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl min-h-[48px]"
              >
                Batal Edit
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
              </button>

              {!editingId && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAddAndContinue}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  Simpan & Lanjut
                </button>
              )}
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default IncomeForm;