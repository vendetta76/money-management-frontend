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
import { Plus, Eye, EyeOff, Search, Lock, Unlock, MoreVertical } from "lucide-react";
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [walletOrder, setWalletOrder] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletData | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [recalcLoading, setRecalcLoading] = useState(false);
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
      if (window.innerWidth > 768) {
        setShowMobileMenu(false);
      }
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
    setShowMobileMenu(false);
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

  // Action buttons component for reusability
  const ActionButtons = ({ isMobile = false, inDropdown = false }) => (
    <div className={`flex ${isMobile && !inDropdown ? 'flex-col' : 'flex-row'} items-center gap-2`}>
      {/* Show/Hide Balance Button */}
      <button
        onClick={() => {
          setShowBalance(!showBalance);
          if (isMobile) setShowMobileMenu(false);
        }}
        className={`flex items-center gap-1.5 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors ${
          isMobile && !inDropdown ? 'justify-start w-full py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700' : ''
        }`}
      >
        {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
        <span className="text-sm">{showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}</span>
      </button>
      
      {/* Lock Button */}
      {canLockManually && (
        <button
          onClick={handleManualLock}
          className={`flex items-center border rounded-md py-1 px-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer gap-1 transition-colors ${
            isMobile && !inDropdown ? 'justify-start w-full border-0 py-2 px-3 rounded-lg' : ''
          }`}
          title="Kunci Dompet"
          aria-label="Kunci Dompet"
        >
          <Lock size={16} />
          <span className="text-sm">Kunci Dompet</span>
        </button>
      )}
      
      {/* Recalc Button */}
      <div className={isMobile && !inDropdown ? 'w-full' : ''}>
        <RecalcButtonWithTooltip
          userId={user?.uid || ""}
          setLoading={setRecalcLoading}
          loading={recalcLoading}
          isMobile={isMobile && !inDropdown}
        />
      </div>
    </div>
  );

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
          <div className="mb-6">
            {/* Title and Status Row */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                Dompet Saya
                {hasPin && (
                  <span className={`inline-flex items-center text-sm font-medium rounded-full px-2 py-0.5 ${
                    isPinVerified 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {isPinVerified ? (
                      <>
                        <Unlock size={14} className="mr-1" />
                        Terbuka
                      </>
                    ) : (
                      <>
                        <Lock size={14} className="mr-1" />
                        Terkunci
                      </>
                    )}
                  </span>
                )}
              </h1>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-3">
                <ActionButtons />
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Plus size={16} /> Tambah Wallet
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Menu"
                >
                  <MoreVertical size={20} />
                </button>

                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10 bg-black/20"
                      onClick={() => setShowMobileMenu(false)}
                    />
                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                      <div className="px-3 py-2 space-y-1">
                        <ActionButtons isMobile={true} inDropdown={true} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Add Wallet Button - Prominent placement */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setShowForm(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white px-4 py-3 rounded-lg text-base flex items-center justify-center gap-2 transition-colors shadow-sm font-medium"
              >
                <Plus size={18} /> Tambah Wallet
              </button>
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
                  <WalletTotalOverview totalsByCurrency={totalsByCurrency} showBalance={showBalance} />
                  {filteredWallets.length === 0 && searchTerm.trim() !== "" ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search size={48} className="text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Tidak ada hasil</h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        Tidak ada dompet yang cocok dengan pencarian "{searchTerm}". Coba kata kunci lain atau tambahkan dompet baru.
                      </p>
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

        {/* Floating Action Button for Mobile (Alternative approach) */}
        {isMobile && shouldShowWalletContent && (
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-30 md:hidden"
            aria-label="Tambah Wallet"
          >
            <Plus size={24} />
          </button>
        )}
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