import { useState } from "react";
import { formatCurrency } from "../helpers/formatCurrency";
import { useTransfer } from "./TransferContext";
import { useAuth } from "../../context/AuthContext";
import { handleDeleteTransfer, handleEditTransfer } from "./transferUtils";
import { 
  Edit3, 
  Trash2, 
  ArrowRightLeft, 
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
  Heart
} from "lucide-react";

// Add CSS to prevent iOS overscroll/bounce
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
    input, textarea, [contenteditable] {
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

const TransferHistory: React.FC = () => {
  const { user } = useAuth();
  const {
    transferHistory,
    setEditingTransfer,
    setFromWalletId,
    setToWalletId,
    setAmount,
    setDescription
  } = useTransfer();

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const itemsPerPage = 6;
  const totalPages = Math.ceil(transferHistory.length / itemsPerPage);
  const paginatedTransfers = transferHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTransferEdit = (entry: any) => {
    if (!user) return;
    handleEditTransfer(
      entry,
      setEditingTransfer,
      setFromWalletId,
      setToWalletId,
      setAmount,
      setDescription
    );
  };

  const handleTransferDelete = async (entry: any) => {
    if (!user) return;
    
    try {
      await handleDeleteTransfer(entry, user.uid);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting transfer:", error);
      alert("Gagal menghapus transfer. Silakan coba lagi.");
    }
  };

  const toggleExpand = (id: string) => {
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

  // Fun cat ASCII for empty state
  const CatMascot = () => (
    <div className="text-center text-gray-400 dark:text-gray-500 text-xs font-mono leading-tight opacity-60">
      <div>╱|、</div>
      <div>(˚ˎ。7</div>
      <div>|、˜〵</div>
      <div>じしˍ,)ノ</div>
    </div>
  );

  if (transferHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 lg:mt-12 pwa-container">
      <div className="bg-gradient-to-br from-white via-purple-50/40 to-violet-50/30 dark:from-gray-800 dark:via-purple-900/20 dark:to-violet-900/10 p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl border border-purple-200/60 dark:border-purple-700/40 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4 w-20 h-20 border-2 border-purple-300 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-2 border-violet-300 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-12 h-12 border border-purple-400 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10">
          {/* Header - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-purple-500 via-violet-500 to-purple-600 p-3 sm:p-4 rounded-xl shadow-xl flex-shrink-0 border-2 border-purple-200/50">
                <ArrowRightLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  🔄 Riwayat Transfer Terbaru
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-500" />
                </h3>
                <p className="text-purple-600 dark:text-purple-300 text-sm sm:text-base flex items-center gap-1 font-medium">
                  <Target className="w-4 h-4" />
                  {transferHistory.length} total transfer
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <div className="bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 px-3 py-2 rounded-full text-purple-700 dark:text-purple-300 text-sm font-bold flex items-center gap-2 border border-purple-200 dark:border-purple-700">
                <Zap className="w-4 h-4" />
                Live Data
              </div>
            </div>
          </div>

          {/* Transfer List - Mobile Optimized */}
          <div className="space-y-3 sm:space-y-4">
            {paginatedTransfers.map((entry, index) => (
              <div
                key={entry.id}
                className={`group relative transform transition-all duration-300 ${
                  hoveredId === entry.id ? 'scale-[1.01] sm:scale-102 -translate-y-1' : ''
                }`}
                onMouseEnter={() => setHoveredId(entry.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Main Transfer Card - Mobile Optimized */}
                <div
                  className={`relative bg-white dark:bg-gray-700 rounded-xl lg:rounded-2xl p-4 sm:p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                    expandedId === entry.id 
                      ? 'border-purple-300 dark:border-purple-600 shadow-2xl shadow-purple-100 dark:shadow-purple-900/20' 
                      : 'border-gray-100 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-700 hover:shadow-xl'
                  } ${deleteConfirm === entry.id ? 'pointer-events-none' : ''}`}
                  onClick={() => toggleExpand(entry.id)}
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-purple-500 to-violet-500"></div>

                  <div className="relative z-10">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      {/* Top Row - Transfer Route and Amount */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800 dark:text-white text-sm truncate">
                              {entry.from}
                            </span>
                            <ArrowRight className="w-3 h-3 text-purple-500 flex-shrink-0" />
                            <span className="font-bold text-gray-800 dark:text-white text-sm truncate">
                              {entry.to}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {entry.description}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(entry.amount, entry.currency)}
                          </div>
                        </div>
                      </div>

                      {/* Middle Row - Date */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(entry.createdAt)}
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                          {entry.currency}
                        </span>
                      </div>

                      {/* Bottom Row - Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTransferEdit(entry);
                            }}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Edit transfer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(entry.id);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Hapus transfer"
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
                        {/* Left Side - Transfer Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0 bg-gradient-to-br from-purple-500 to-violet-500">
                            <ArrowRightLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-800 dark:text-white text-lg">
                                {entry.from}
                              </span>
                              <ArrowRight className="w-4 h-4 text-purple-500" />
                              <span className="font-bold text-gray-800 dark:text-white text-lg">
                                {entry.to}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm">
                              {entry.description}
                            </p>
                            
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
                            <div className="text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {formatCurrency(entry.amount, entry.currency)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTransferEdit(entry);
                              }}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Edit transfer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(entry.id);
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Hapus transfer"
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
                              Detail Transfer
                            </p>
                            <div className="bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-lg">
                              <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {entry.from}
                                </span>
                                <ArrowRight className="w-4 h-4 text-purple-500" />
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {entry.to}
                                </span>
                              </div>
                              <p className="text-center text-xs text-gray-600 dark:text-gray-300 mt-1">
                                {entry.description}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">Waktu Transfer</p>
                            <p className="text-gray-800 dark:text-white font-medium bg-white dark:bg-gray-700 p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                              {formatDate(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Mobile Optimized */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-purple-200 dark:border-purple-700">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium min-h-[44px] border border-purple-200 dark:border-purple-600"
              >
                ← Sebelumnya
              </button>
              
              <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[44px] h-11 sm:w-10 sm:h-10 rounded-xl font-medium transition-all duration-300 flex-shrink-0 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg border-2 border-purple-300'
                        : 'bg-purple-50 dark:bg-purple-800/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-700/30 border border-purple-200 dark:border-purple-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-xl bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium min-h-[44px] border border-purple-200 dark:border-purple-600"
              >
                Berikutnya →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Hapus Transfer?
              </h3>
              {(() => {
                const entry = transferHistory.find(t => t.id === deleteConfirm);
                if (!entry) return null;
                return (
                  <>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">
                          {entry.from}
                        </span>
                        <ArrowRight className="w-3 h-3 text-purple-500" />
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">
                          {entry.to}
                        </span>
                      </div>
                      <p className="text-purple-600 dark:text-purple-400 font-bold">
                        {formatCurrency(entry.amount, entry.currency)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {entry.description}
                      </p>
                    </div>
                  </>
                );
              })()}
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Transfer akan dihapus permanen dan saldo akan dikembalikan.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-3 rounded-xl font-semibold transition-colors text-sm min-h-[48px] border border-gray-300 dark:border-gray-600"
              >
                Batal
              </button>
              
              <button
                onClick={() => {
                  const entry = transferHistory.find(t => t.id === deleteConfirm);
                  if (entry) {
                    handleTransferDelete(entry);
                  }
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors text-sm min-h-[48px] flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferHistory;