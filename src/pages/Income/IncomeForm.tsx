import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebaseClient";
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
  CheckCircle,
  Plus,
  Save,
  Calendar,
  Target,
  Zap
} from "lucide-react";
import { formatCurrency } from "../helpers/formatCurrency";
import { getCardStyle } from "../helpers/getCardStyle";
import { WalletEntry, IncomeEntry } from "../helpers/types";
import { toast } from "react-toastify";

interface IncomeFormProps {
  hideCardPreview?: boolean;
  presetWalletId?: string;
  onClose?: () => void;
  editingEntry?: IncomeEntry | null;
  onEditComplete?: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ 
  presetWalletId, 
  onClose, 
  hideCardPreview, 
  editingEntry, 
  onEditComplete 
}) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [form, setForm] = useState({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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

  // Calculate total income today for quick stats
  const todayIncomes = incomes.filter((income) => {
    const today = new Date();
    const incomeDate = new Date(income.createdAt?.toDate?.() ?? income.createdAt);
    return incomeDate.toDateString() === today.toDateString();
  });

  const todayTotal = todayIncomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="relative">
      {/* Success Animation */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">
              {editingId ? "Pemasukan diperbarui! ✨" : "Pemasukan berhasil disimpan! 🎉"}
            </span>
          </div>
        </div>
      )}

      {/* Quick Stats Card */}
      {!editingId && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-2xl mb-6 border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pemasukan Hari Ini</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(todayTotal, 'IDR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Transaksi</p>
              <p className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-1">
                {todayIncomes.length}
                <Zap className="w-4 h-4 text-yellow-500" />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 p-8 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-600 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg">
            {editingId ? (
              <FileText className="w-7 h-7 text-white" />
            ) : (
              <TrendingUp className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {editingId ? "Edit Pemasukan" : "Tambah Pemasukan"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Catat pemasukan Anda dengan mudah
            </p>
          </div>
          {editingId && (
            <div className="ml-auto">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Mode Edit
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <Wallet className="w-4 h-4 text-blue-500" />
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
                className={`w-full rounded-2xl border-2 px-5 py-4 pr-12 dark:bg-gray-700 dark:text-white text-gray-800 font-medium transition-all duration-300 ${
                  errors.wallet 
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                    : focusedField === 'wallet'
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-100 dark:shadow-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <option value="">-- Pilih Dompet --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} • {formatCurrency(w.balance || 0, w.currency)}
                  </option>
                ))}
              </select>
              <CreditCard className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                focusedField === 'wallet' ? 'text-blue-500' : 'text-gray-400'
              }`} />
            </div>
            {errors.wallet && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {errors.wallet}
              </p>
            )}

            {/* Wallet Card Preview */}
            {form.wallet && !hideCardPreview && (
              <div className="mt-6 transform transition-all duration-500 animate-in slide-in-from-top-4">
                {(() => {
                  const selectedWallet = getSelectedWallet();
                  if (!selectedWallet) return null;
                  
                  return (
                    <div
                      className="rounded-2xl text-white p-6 shadow-xl transform hover:scale-105 transition-transform duration-300 cursor-pointer relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${selectedWallet.color || '#3B82F6'} 0%, ${selectedWallet.color || '#3B82F6'}dd 100%)`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold truncate">{selectedWallet.name}</h3>
                          <Wallet className="w-6 h-6 opacity-80" />
                        </div>
                        <p className="text-2xl font-bold">
                          {formatCurrency(selectedWallet.balance || 0, selectedWallet.currency)}
                        </p>
                        <p className="text-sm opacity-80 mt-1">Current Balance</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Description and Amount - Two Column Layout on Larger Screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <FileText className="w-4 h-4 text-purple-500" />
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
                  className={`w-full rounded-2xl border-2 px-5 py-4 dark:bg-gray-700 dark:text-white text-gray-800 placeholder-gray-400 font-medium transition-all duration-300 ${
                    errors.description 
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'description'
                      ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-100 dark:shadow-purple-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-purple-300 hover:bg-purple-50/50"
                  }`}
                />
              </div>
              {errors.description && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <DollarSign className="w-4 h-4 text-green-500" />
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
                  placeholder="0"
                  disabled={loading}
                  className={`w-full rounded-2xl border-2 px-5 py-4 dark:bg-gray-700 dark:text-white text-gray-800 text-xl font-bold placeholder-gray-400 transition-all duration-300 ${
                    errors.amount 
                      ? "border-red-300 bg-red-50 dark:bg-red-900/20" 
                      : focusedField === 'amount'
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-100 dark:shadow-green-900/20"
                      : "border-gray-200 dark:border-gray-600 bg-white hover:border-green-300 hover:bg-green-50/50"
                  }`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                  {form.currency || "IDR"}
                </div>
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          {/* Currency Display */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Mata Uang</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {form.currency || "Akan otomatis terisi setelah memilih dompet"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-medium transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Batal Edit
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none min-h-[56px]"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
              </button>

              {!editingId && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAddAndContinue}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none min-h-[56px]"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  Simpan & Lanjut
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;