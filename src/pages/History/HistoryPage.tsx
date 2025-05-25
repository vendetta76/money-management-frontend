import LayoutShell from "@/layouts/LayoutShell";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { usePageLockStatus } from "@/hooks/usePageLockStatus";
import PageLockAnnouncement from "@/components/admin/PageLockAnnouncement";

import FilterControls from "./FilterControls";
import TransactionGroup from "./TransactionGroup";
import { HistoryEntry, TransferEntry, WalletEntry, UnifiedEntry } from "./historyTypes";
import { useHistoryFilimport { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  Backdrop
} from "@mui/material";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

import LayoutShell from "@/layouts/LayoutShell";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { usePageLockStatus } from "@/hooks/usePageLockStatus";
import PageLockAnnouncement from "@/components/admin/PageLockAnnouncement";

import FilterControls from "./FilterControls";
import TransactionGroup from "./TransactionGroup";
import { HistoryEntry, TransferEntry, WalletEntry, UnifiedEntry } from "./historyTypes";
import { useHistoryFilters } from "./useHistoryFilters";

const HistoryPage = () => {
  const { user } = useAuth();
  const { locked, message } = usePageLockStatus("history");
  
  // State management
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [transfers, setTransfers] = useState<TransferEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Merge and sort data
  const mergedHistory: UnifiedEntry[] = [
    ...history,
    ...transfers
  ].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

  // Use custom filter hook
  const { filters, setFilters, groupedData } = useHistoryFilters(mergedHistory);

  // Toggle expand functionality
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Firestore listeners
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    const incomeQuery = query(
      collection(db, "users", user.uid, "incomes"), 
      orderBy("createdAt", "desc")
    );
    const outcomeQuery = query(
      collection(db, "users", user.uid, "outcomes"), 
      orderBy("createdAt", "desc")
    );
    const walletQuery = collection(db, "users", user.uid, "wallets");
    const transferQuery = collection(db, "users", user.uid, "transfers");

    const unsubIn = onSnapshot(incomeQuery, (snapshot) => {
      const incomes = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "income" as const,
        ...doc.data(),
      })) as HistoryEntry[];

      setHistory((prev) => {
        const others = prev.filter((item) => item.type !== "income");
        return [...incomes, ...others];
      });
    });

    const unsubOut = onSnapshot(outcomeQuery, (snapshot) => {
      const outcomes = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "outcome" as const,
        ...doc.data(),
      })) as HistoryEntry[];

      setHistory((prev) => {
        const others = prev.filter((item) => item.type !== "outcome");
        return [...others, ...outcomes];
      });
    });

    const unsubWallet = onSnapshot(walletQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletEntry[];
      setWallets(data);
    });

    const unsubTransfer = onSnapshot(transferQuery, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .map((doc) => ({ ...doc, type: "transfer" as const })) as TransferEntry[];
      setTransfers(data);
      setLoading(false);
    });

    return () => {
      unsubIn();
      unsubOut();
      unsubWallet();
      unsubTransfer();
    };
  }, [user]);

  // Helper functions
  const getWalletName = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    if (!wallet) return `${walletId} (Tidak ditemukan)`;
    if (wallet.status === "archived") return `${wallet.name} (Telah dihapus)`;
    return wallet.name;
  };

  const getWalletCurrency = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    return wallet ? wallet.currency : "-";
  };

  if (loading) {
    return (
      <LayoutShell>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress size={40} />
          </Box>
        </Container>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <Container maxWidth="xl" sx={{ py: 3, position: 'relative' }}>
        {/* Page Lock Overlay */}
        {locked && (
          <Backdrop open={locked} sx={{ zIndex: 40 }}>
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={user?.role}
              bypassFor={["Admin", "Staff", "Tester"]}
            />
          </Backdrop>
        )}

        {/* Main Content */}
        <Box sx={{ filter: locked ? 'blur(4px)' : 'none', pointerEvents: locked ? 'none' : 'auto' }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              mb: 4, 
              fontWeight: 'bold',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📜 Riwayat Transaksi
          </Typography>

          {/* Filter Controls */}
          <FilterControls
            filters={filters}
            onFiltersChange={setFilters}
            wallets={wallets}
          />

          {/* Transaction History */}
          {Object.entries(groupedData).length === 0 ? (
            <Alert severity="info" sx={{ mt: 4 }}>
              Tidak ada transaksi ditemukan.
            </Alert>
          ) : (
            <Box sx={{ mt: 4 }}>
              {Object.entries(groupedData).map(([dateStr, entries]) => (
                <TransactionGroup
                  key={dateStr}
                  date={dateStr}
                  entries={entries}
                  expandedId={expandedId}
                  onToggleExpand={toggleExpand}
                  getWalletName={getWalletName}
                  getWalletCurrency={getWalletCurrency}
                />
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </LayoutShell>
  );
};

export default HistoryPage;