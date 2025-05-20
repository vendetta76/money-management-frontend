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
import { Plus, Eye, EyeOff, Search, Lock } from "lucide-react";
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
import PinEntryModal from "./PinEntryModal"; // Import the PIN entry component

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
  
  // Use the PIN timeout context
  const { pinTimeout, isPinVerified, verifyPin, lockPin } = usePinTimeout();
  
  // Original wallet state
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

  // Handle PIN verification
  const handlePinVerify = () => {
    verifyPin();
  };

  // Handle manual lock
  const handleManualLock = () => {
    lockPin();
  };

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));
  const orderedWallets = [
    ...walletOrder.map((id) => walletMap[id]).filter(Boolean),
    ...wallets.filter((w) => !walletOrder.includes(w.id))
  ];

  const visibleWallets = orderedWallets.filter((w) => w.status !== "archived");
  
  // Filter wallets based on search term
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

  // Handle search
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <LayoutShell>
      <main
        className="relative min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto transition-all duration-300"
      >
        {/* PIN Lock Overlay - Show when PIN is not verified */}
        {!isPinVerified && pinTimeout !== 0 && (
          <PinEntryModal onPinVerify={handlePinVerify} />
        )}
      
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Dompet Saya</h1>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-sm underline flex items-center gap-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />} {showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
              </button>
              
              {/* Manual Lock Button */}
              {isPinVerified && pinTimeout !== 0 && (
                <button
                  onClick={handleManualLock}
                  className="text-sm underline flex items-center gap-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                >
                  <Lock size={16} /> Kunci Dompet
                </button>
              )}
              
              <RecalcButtonWithTooltip
                userId={user?.uid || ""}
                setLoading={setRecalcLoading}
                loading={recalcLoading}
              />
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={16} /> Tambah Wallet
              </button>
            </div>
          </div>

          {/* Search Bar Integration */}
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