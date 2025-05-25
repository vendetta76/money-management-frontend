import { useEffect, useState } from "react";
import { db } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { IncomeEntry, WalletEntry } from "../helpers/types";
import { 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  Wallet,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Sparkles,
  Clock,
  ArrowRight,
  Zap,
  Target,
  Heart,
  MoreHorizontal,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "../helpers/formatCurrency";

interface RecentTransactionsProps {
  onEdit?: (entry: IncomeEntry) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onEdit }) => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(incomes.length / itemsPerPage);
  const paginatedIncomes = incomes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    
    const q = query(
      collection(db, "users", user.uid, "incomes"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setIncomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IncomeEntry[]);
      setLoading(false);
    });
    
    const walletRef = collection(db, "users", user.uid, "wallets");
    const unsubWallets = onSnapshot(walletRef, (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WalletEntry[]);
    });
    
    return () => {
      unsub();
      unsubWallets();
    };
  }, [user]);

  const getWalletName = (id: string) =>
    wallets.find((w) => w.id === id)?.name || "Dompet tidak ditemukan";

  const getWalletColor = (id: string) =>
    wallets.find((w) => w.id === id)?.color || "#3B82F6";

  const handleDelete = async (id: string, amount: number, wallet: string) => {
    if (!user) return;
    
    try {
      // Delete the income document
      await deleteDoc(doc(db, "users", user.uid, "incomes", id));
      
      // Update wallet balance (subtract the amount)
      await updateDoc(doc(db, "users", user.uid, "wallets", wallet), {
        balance: increment(-amount),
      });
      
      // Clear the delete confirmation
      setDeleteConfirm(null);
      
      // Show success message
      console.log("Income deleted successfully");
    } catch (error) {
      console.error("Error deleting income:", error);
      alert("Gagal menghapus transaksi. Silakan coba lagi.");
    }
  };

  const handleEdit = (entry: IncomeEntry) => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  const toggleExpand = (id: string) => {
    // Don't toggle if we're in delete confirmation mode
    if (deleteConfirm === id) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (date: any) => {
    const d = new Date(date?.toDate?.() ?? date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return `Hari ini • ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Kemarin • ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  };

  // Fun cat ASCII for empty state (subtle and optional)
  const CatMascot = () => (
    <div className="text-center text-gray-400 dark:text-gray-500 text-xs font-mono leading-tight opacity-60">
      <div>╱|、</div>
      <div>(˚ˎ。7</div>
      <div>|、˜〵</div>
      <div>じしˍ,)ノ</div>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-6 lg:mt-12">
        <div className="bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-green-100 dark:border-gray-600">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 sm:p-3 rounded-xl lg:rounded-2xl animate-pulse">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded-lg w-36 sm:w-48 animate-pulse"></div>
              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded-lg w-24 sm:w-32 mt-2 animate-pulse"></div>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 sm:p-6 rounded-xl lg:rounded-2xl animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-600 rounded-lg sm:rounded-xl"></div>
                    <div>
                      <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded w-24 sm:w-32 mb-2"></div>
                      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-20 sm:w-24"></div>
                    </div>
                  </div>
                  <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded w-16 sm:w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 lg:mt-12">
      <div className="bg-gradient-to-br from-white via-green-50/30 to-blue-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl border border-green-100 dark:border-gray-600">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 sm:p-3 rounded-xl lg:rounded-2xl shadow-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Transaksi Terbaru
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm flex items-center gap-1">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                {incomes.length} total transaksi
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 justify-end sm:justify-start">
            <div className="bg-green-100 dark:bg-green-900/30 px-2 sm:px-3 py-1 rounded-full text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Live
            </div>
          </div>
        </div>

        {incomes.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              Belum ada pemasukan
            </h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base px-4">
              Transaksi pemasukan Anda akan muncul disini setelah Anda menambahkan yang pertama.
            </p>
            
            {/* Subtle cat mascot for empty state */}
            <div className="mb-4">
              <CatMascot />
            </div>
            
            <div className="mt-4 sm:mt-6">
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto animate-bounce" />
            </div>
          </div>
        ) : (
          <>
            {/* Transaction List - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              {paginatedIncomes.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`group relative transform transition-all duration-300 ${
                    hoveredId === entry.id ? 'scale-[1.01] sm:scale-102 -translate-y-1' : ''
                  }`}
                  onMouseEnter={() => setHoveredId(entry.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Main Transaction Card - Mobile Optimized */}
                  <div
                    className={`relative bg-white dark:bg-gray-700 rounded-xl lg:rounded-2xl p-4 sm:p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                      expandedId === entry.id 
                        ? 'border-green-300 dark:border-green-600 shadow-2xl shadow-green-100 dark:shadow-green-900/20' 
                        : 'border-gray-100 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-700 hover:shadow-xl'
                    } ${deleteConfirm === entry.id ? 'pointer-events-none' : ''}`}
                    onClick={() => toggleExpand(entry.id)}
                  >
                    {/* Background Gradient */}
                    <div 
                      className="absolute inset-0 opacity-5"
                      style={{
                        background: `linear-gradient(135deg, ${getWalletColor(entry.wallet)} 0%, transparent 70%)`
                      }}
                    ></div>

                    <div className="relative z-10">
                      {/* Mobile Layout */}
                      <div className="block sm:hidden">
                        {/* Top Row - Description and Amount */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-bold text-gray-800 dark:text-white text-base leading-tight truncate">
                              {entry.description}
                            </h4>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(entry.amount, entry.currency)}
                            </div>
                          </div>
                        </div>

                        {/* Middle Row - Wallet and Date */}
                        <div className="flex items-center justify-between mb-3">
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                            style={{ backgroundColor: getWalletColor(entry.wallet) }}
                          >
                            <Wallet className="w-3 h-3 mr-1" />
                            {getWalletName(entry.wallet)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>

                        {/* Bottom Row - Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(entry);
                              }}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Edit transaksi"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(entry.id);
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Hapus transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Expand Button */}
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center">
                            {expandedId === entry.id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden sm:block">
                        <div className="flex items-start justify-between">
                          {/* Left Side - Icon and Info */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div 
                              className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                              style={{ 
                                background: `linear-gradient(135deg, ${getWalletColor(entry.wallet)} 0%, ${getWalletColor(entry.wallet)}dd 100%)` 
                              }}
                            >
                              <Wallet className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-gray-800 dark:text-white text-lg leading-tight mb-1">
                                    {entry.description}
                                  </h4>
                                  <span 
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                                    style={{ backgroundColor: getWalletColor(entry.wallet) }}
                                  >
                                    <Wallet className="w-3 h-3 mr-1" />
                                    {getWalletName(entry.wallet)}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(entry.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {entry.currency}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Amount and Actions */}
                          <div className="flex flex-col items-end gap-3 flex-shrink-0 ml-4">
                            <div className="text-right">
                              <div className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(entry.amount, entry.currency)}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(entry);
                                }}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Edit transaksi"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(entry.id);
                                }}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Hapus transaksi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Expand Button */}
                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center">
                              {expandedId === entry.id ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content - Mobile Optimized */}
                      <div className={`transition-all duration-500 overflow-hidden ${
                        expandedId === entry.id ? 'max-h-56 opacity-100 mt-4 sm:mt-6' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="bg-gray-50 dark:bg-gray-600 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-500">
                          <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 font-medium mb-1 flex items-center gap-1">
                                <Heart className="w-3 h-3 text-pink-500" />
                                Detail Transaksi
                              </p>
                              <p className="text-gray-800 dark:text-white font-medium bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                                {entry.description}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">Waktu Dibuat</p>
                              <p className="text-gray-800 dark:text-white font-medium bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                                {formatDate(entry.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          {entry.editHistory && entry.editHistory.length > 0 && (
                            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-500">
                              <p className="text-gray-600 dark:text-gray-300 font-medium mb-2 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Riwayat Edit ({entry.editHistory.length})
                              </p>
                              <div className="space-y-2 max-h-24 overflow-y-auto">
                                {entry.editHistory.slice(0, 3).map((edit, i) => (
                                  <div key={i} className="bg-white dark:bg-gray-700 p-2 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                      {new Date(edit.editedAt?.toDate?.() ?? edit.editedAt).toLocaleDateString("id-ID")}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-800 dark:text-white">
                                      {edit.description} • {formatCurrency(edit.amount, entry.currency)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation Modal - Positioned Outside Main Card */}
                  {deleteConfirm === entry.id && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl lg:rounded-2xl z-20 flex items-center justify-center p-4 border-2 border-orange-200 dark:border-orange-700">
                      <div className="text-center max-w-sm">
                        <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h4 className="font-bold text-gray-800 dark:text-white mb-2 text-lg">
                          Hapus Transaksi?
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
                          Transaksi ini akan dihapus secara permanen dan saldo dompet akan disesuaikan.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(null);
                            }}
                            className="flex-1 bg-white hover:bg-blue-50 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-sm min-h-[48px] flex items-center justify-center border-2 border-gray-300 dark:border-gray-500 hover:border-blue-400 dark:hover:border-blue-400 shadow-sm hover:shadow-md"
                          >
                            Batal
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(entry.id, entry.amount, entry.wallet);
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-sm min-h-[48px] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination - Mobile Optimized */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium min-h-[44px]"
                >
                  Sebelumnya
                </button>
                
                <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[44px] h-11 sm:w-10 sm:h-10 rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium min-h-[44px]"
                >
                  Berikutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;