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
import WalletGrid from "./WalletGrid";
import WalletTotalOverview from "./WalletTotalOverview";
import WalletFormModal from "./WalletFormModal";
import WalletPopupHistory from "../../components/WalletPopupHistory";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Plus } from "lucide-react";
import { usePageLockStatus } from "../../hooks/usePageLockStatus";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";

const allowedRecalcEmails = [
  "diorvendetta76@gmail.com",
  "joeverson.kamantha@gmail.com"
];

interface WalletEntry {
  id?: string;
  name: string;
  balance: number;
  currency: string;
  createdAt?: any;
  colorStyle: "solid" | "gradient";
  colorValue: string | { start: string; end: string };
}

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { locked, message } = usePageLockStatus("wallet");
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [walletOrder, setWalletOrder] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletEntry | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<{ id: string; name: string; style: React.CSSProperties } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "wallets"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setWallets(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as WalletEntry),
        }))
      );
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setWalletOrder(snap.data().walletOrder || []);
      }
    });
  }, [user]);

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id!, w]));
  const orderedWallets = [
    ...walletOrder.map((id) => walletMap[id]).filter(Boolean),
    ...wallets.filter((w) => !walletOrder.includes(w.id!))
  ];

  const totalsByCurrency = orderedWallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance;
    return acc;
  }, {} as Record<string, number>);

  return (
    <LayoutShell>
      <main className="relative min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {locked && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={user?.role || ""}
              bypassFor={["Admin", "diorvendetta76@gmail.com"]}
            />
          </div>
        )}

        <div className={locked ? "pointer-events-none blur-sm" : "relative z-10"}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">Dompet Saya</h1>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-sm underline flex items-center gap-1"
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />} {showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
              </button>
              {allowedRecalcEmails.includes(user?.email || "") && (
                <button
                  onClick={() => toast("Rekalkulasi placeholder")}
                  className="text-sm border px-3 py-1 rounded"
                >🔁 Rekalkulasi</button>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm sm:text-base"
              >
                <Plus size={16} /> Tambah Wallet
              </button>
            </div>
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

              <WalletGrid
                userId={user?.uid || ""}
                wallets={orderedWallets}
                showBalance={showBalance}
                onEdit={(id) => setEditingWallet(walletMap[id])}
                onCardClick={(id) => setSelectedWallet({ id, name: walletMap[id].name, style: {} })}
              />
            </>
          )}

          <WalletFormModal
            visible={showForm || !!editingWallet}
            onClose={() => {
              setShowForm(false);
              setEditingWallet(null);
            }}
            editing={editingWallet}
          />

          {selectedWallet && (
            <WalletPopupHistory
              walletId={selectedWallet.id}
              walletName={selectedWallet.name}
              cardStyle={selectedWallet.style}
              isOpen={!!selectedWallet}
              onClose={() => setSelectedWallet(null)}
            />
          )}
        </div>
      </main>
    </LayoutShell>
  );
};

export default WalletPage;