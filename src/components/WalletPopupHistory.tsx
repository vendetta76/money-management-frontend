import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Repeat2, Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import IncomeForm from "../pages/Income/IncomeForm";
import OutcomeForm from "../pages/Outcome/OutcomeForm";

interface WalletPopupProps {
  walletId: string;
  walletName: string;
  cardStyle: React.CSSProperties;
  isOpen: boolean;
  onClose: () => void;
}

const WalletPopup: React.FC<WalletPopupProps> = ({ walletId, walletName, cardStyle, isOpen, onClose }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);

  console.log("🧪 WalletPopup props", { isOpen, walletId, walletName, cardStyle });

  if (!isOpen || !walletId || walletId === "" || !walletName || cardStyle == null) {
    console.warn("❌ WalletPopup render dihindari karena data tidak lengkap", {
      isOpen,
      walletId,
      walletName,
      cardStyle,
    });
    return null;
  }

  useEffect(() => {
    if (!isOpen || !walletId || walletId === "" || !user) return;

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"));
    const transferQuery = collection(db, "users", user.uid, "transfers");

    const unsubIn = onSnapshot(incomeQuery, snapshot => {
      const incomes = snapshot.docs
        .map(doc => ({ id: doc.id, type: "income", ...doc.data() }))
        .filter(tx => tx.wallet === walletId);
      setTransactions(prev => [...prev.filter(tx => tx.type !== "income"), ...incomes]);
    });

    const unsubOut = onSnapshot(outcomeQuery, snapshot => {
      const outcomes = snapshot.docs
        .map(doc => ({ id: doc.id, type: "outcome", ...doc.data() }))
        .filter(tx => tx.wallet === walletId);
      setTransactions(prev => [...prev.filter(tx => tx.type !== "outcome"), ...outcomes]);
    });

    const unsubTransfer = onSnapshot(transferQuery, snapshot => {
      const transfers = snapshot.docs
        .map(doc => ({ id: doc.id, type: "transfer", ...doc.data() }))
        .filter(tx => tx.from === walletId || tx.to === walletId);
      setTransactions(prev => [...prev.filter(tx => tx.type !== "transfer"), ...transfers]);
    });

    return () => {
      unsubIn();
      unsubOut();
      unsubTransfer();
    };
  }, [user, walletId, isOpen]);

  const filteredTransactions = transactions.filter(tx => {
    const matchDescription = tx.description?.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter && tx.createdAt?.seconds
      ? format(new Date(tx.createdAt.seconds * 1000), "yyyy-MM-dd") === dateFilter
      : true;
    return matchDescription && matchDate;
  });

  return (
    <Dialog open={isOpen}>
      <DialogContent
        hideClose
        className="w-[95%] max-w-lg p-4 sm:p-6 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="sticky top-0 z-10 bg-white flex justify-between items-center pb-2 border-b">
          <DialogTitle className="text-xl font-bold">{walletName}</DialogTitle>
        </DialogHeader>
        <button
          onClick={() => {
            console.log("Popup ditutup");
            onClose();
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-black transition hover:scale-110 transform transition-transform"
        >
          <X size={20} />
        </button>

        {/* Credit card preview */}
        <div className="w-full max-w-[320px] aspect-[16/10] rounded-xl shadow-md mx-auto mt-4" style={cardStyle} />

        {/* Tambah transaksi */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setShowIncomeForm(true)}
          >
            ➕ Tambah Pemasukan
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => setShowOutcomeForm(true)}
          >
            ➖ Tambah Pengeluaran
          </button>
        </div>

        {showIncomeForm && (
          <IncomeForm
            presetWalletId={walletId}
            onClose={() => setShowIncomeForm(false)}
          />
        )}

        {showOutcomeForm && (
          <OutcomeForm
            presetWalletId={walletId}
            onClose={() => setShowOutcomeForm(false)}
          />
        )}

        <div className="mt-4 flex items-center gap-2">
          <Search size={18} className="text-gray-400" />
          <Input
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {filteredTransactions.length ? filteredTransactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                {tx.type === "income" && <ArrowDownCircle className="text-green-500" size={16} />}
                {tx.type === "outcome" && <ArrowUpCircle className="text-red-500" size={16} />}
                {tx.type === "transfer" && <Repeat2 className="text-blue-500" size={16} />}
                <span className="font-medium truncate">{tx.description || "Transfer"}</span>
              </div>
              <span className="font-semibold">{tx.currency} {tx.amount.toLocaleString()}</span>
            </div>
          )) : (
            <div className="text-center text-gray-500">Tidak ada transaksi ditemukan.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletPopup;