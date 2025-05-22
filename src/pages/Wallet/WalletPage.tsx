import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import LayoutShell from "../../layouts/LayoutShell";
import { Plus, Eye, EyeOff, Search, Lock, Unlock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import WalletPopupHistory from "../../components/WalletPopupHistory";
import WalletTotalOverview from "./WalletTotalOverview";
import WalletGrid from "./WalletGrid";
import WalletFormModal from "./WalletFormModal";
import { useIsBypassed } from "../../hooks/useIsBypassed";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";
import RecalcButtonWithTooltip from "./RecalcButtonWithTooltip";
import WalletSearchBar from "./WalletSearchBar";
import { usePinTimeout } from "../../context/PinTimeoutContext";
import PinEntryModal from "../../components/PinEntryModal";

interface WalletData {
  id: string;
  name: string;
  balance: number;
  currency: string;
  colorStyle: "solid" | "gradient";
  colorValue: string | { start: string; end: string };
  createdAt: any;
  status?: string;
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userMeta } = useAuth();
  const { locked, message, isBypassed } = useIsBypassed("wallet");
  
  const { pinTimeout, isPinVerified, verifyPin, lockPin, hasPin } = usePinTimeout();
  const [showPinDialog, setShowPinDialog] = useState(false);
  
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [walletOrder, setWalletOrder] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletData | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const shouldShowWalletContent = !hasPin || isPinVerified;

  useEffect(() => {
    if (hasPin && !isPinVerified) {
      setShowPinDialog(true);
    } else {
      setShowPinDialog(false);
    }
  }, [hasPin, isPinVerified]);

  useEffect(() => {
    console.log("Wallet lock status:", {
      hasPin,
      pinTimeout,
      isPinVerified,
      shouldShowWalletContent,
      showPinDialog
    });
  }, [hasPin, pinTimeout, isPinVerified, shouldShowWalletContent, showPinDialog]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "users", user.uid, "wallets"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WalletData)));
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      toast.error("Gagal memuat dompet");
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setWalletOrder(snap.data().walletOrder || []);
      }
    });
    return () => unsub();
  }, [user?.uid]);

  useEffect(() => {
    if (wallets.length === 0) return;
    wallets.forEach((w) => {
      if (!w.currency) {
        toast.error(`⚠️ Dompet "${w.name}" tidak memiliki currency, silakan perbaiki di Firestore.`);
      }
    });
  }, [wallets]);

  const handlePinVerify = () => {
    verifyPin();
    setShowPinDialog(false);
  };

  const handleManualLock = () => {
    console.log("Manual lock triggered");
    lockPin();
    setShowPinDialog(true);
  };

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));
  const orderedWallets = [
    ...walletOrder.map((id) => walletMap[id]).filter(Boolean),
    ...wallets.filter((w) => !walletOrder.includes(w.id))
  ];

  const visibleWallets = orderedWallets.filter((w) => w.status !== "archived");
  
  const filteredWallets = searchTerm.trim() === "" 
    ? visibleWallets 
    : visibleWallets.filter(wallet => 
        wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wallet.currency.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const totalsByCurrency = filteredWallets.reduce((acc, w) => {
    const safeBalance = isNaN(w.balance) ? 0 : w.balance;
    acc[w.currency] = (acc[w.currency] || 0) + safeBalance;
    return acc;
  }, {});

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const canLockManually = hasPin && isPinVerified;

  return (
    <LayoutShell>
      <main className="relative min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto transition-all duration-300">
        {/* PIN Entry Modal */}
        <PinEntryModal
          open={showPinDialog}
          onPinVerify={handlePinVerify}
          onClose={() => setShowPinDialog(false)}
        />
      
        {(locked && !isBypassed) && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 dark:bg-black/50 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={userMeta?.role || ""}
              bypassFor={["Admin", "Staff", "Tester"]}
            />
          </div>
        )}

        <div className="relative z-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
            {/* Title and Status */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Dompet Saya
              </h1>
              {hasPin && (
                <span className={`inline-flex items-center text-xs sm:text-sm font-medium rounded-full px-2 py-1 ${
                  isPinVerified 
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}>
                  {isPinVerified ? (
                    <>
                      <Unlock size={12} className="mr-1" />
                      <span className="hidden sm:inline">Terbuka</span>
                    </>
                  ) : (
                    <>
                      <Lock size={12} className="mr-1" />
                      <span className="hidden sm:inline">Terkunci</span>
                    </>
                  )}
                </span>
              )}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {canLockManually && (
                <button
                  onClick={handleManualLock}
                  className="group relative flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md gap-2"
                  title="Kunci Dompet untuk Keamanan"
                >
                  <div className="relative">
                    <Lock size={16} className="transition-transform group-hover:scale-110" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <span>Kunci Dompet</span>
                </button>
              )}
              
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} /> Tambah Wallet
              </button>
            </div>
          </div>

          {/* Mobile Quick Actions */}
          <div className="sm:hidden mb-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => setShowForm(true)}
                className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm font-medium"
              >
                <Plus size={16} /> Tambah
              </button>
              
              {canLockManually && (
                <button
                  onClick={handleManualLock}
                  className="group flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
                >
                  <div className="relative">
                    <Lock size={16} className="transition-transform group-hover:scale-110" />
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <span>Kunci</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <WalletSearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
            </div>
            {searchTerm.trim() !== "" && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {filteredWallets.length > 0 
                  ? `Menampilkan ${filteredWallets.length} dari ${visibleWallets.length} dompet` 
                  : "Tidak ada dompet yang cocok dengan pencarian Anda"}
              </div>
            )}
          </div>

          {/* Main Content */}
          {shouldShowWalletContent ? (
            <>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <>
                  <WalletTotalOverview 
                    totalsByCurrency={totalsByCurrency} 
                    showBalance={showBalance}
                    onToggleBalance={() => setShowBalance(!showBalance)}
                  />
                  {filteredWallets.length === 0 && searchTerm.trim() !== "" ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Tidak ada hasil</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
                        Tidak ada dompet yang cocok dengan pencarian "{searchTerm}". Coba kata kunci lain atau tambahkan dompet baru.
                      </p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus size={16} /> Tambah Wallet Baru
                      </button>
                    </div>
                  ) : (
                    <WalletGrid
                      userId={user?.uid || ""}
                      wallets={filteredWallets}
                      showBalance={showBalance}
                      isMobile={isMobile}
                      onEdit={(id) => {
                        setSelectedWalletId(null);
                        setEditingWallet(walletMap[id]);
                        setShowForm(true);
                      }}
                      onCardClick={(id) => {
                        if (editingWallet || showForm) return;
                        setSelectedWalletId(id);
                      }}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-6">
                <Lock size={36} className="text-red-600 dark:text-red-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                Dompet Terkunci
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                Untuk alasan keamanan, dompet Anda terkunci. 
                Masukkan PIN untuk mengakses saldo dan riwayat transaksi Anda.
              </p>
              <button
                onClick={() => setShowPinDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Unlock size={18} /> Buka Dompet
              </button>
            </div>
          )}
        </div>
      </main>

      <WalletFormModal
        isOpen={showForm || !!editingWallet}
        editingData={editingWallet}
        onClose={() => {
          setShowForm(false);
          setEditingWallet(null);
          setSelectedWalletId(null);
        }}
      />

      {selectedWalletId && (
        <WalletPopupHistory
          walletId={selectedWalletId}
          wallets={visibleWallets}
          isOpen={!!selectedWalletId}
          onClose={() => setSelectedWalletId(null)}
        />
      )}
    </LayoutShell>
  );
};

export default WalletPage;