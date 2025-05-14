import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Repeat2, Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

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

  useEffect(() => {
    if (!user || !walletId) return;

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
  }, [user, walletId]);

  if (!isOpen || !walletId) return null;

  const filteredTransactions = transactions.filter(tx => {
    const matchDescription = tx.description?.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter ? format(new Date(tx.createdAt.seconds * 1000), "yyyy-MM-dd") === dateFilter : true;
    return matchDescription && matchDate;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-white rounded-xl shadow-xl">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-bold">{walletName}</DialogTitle>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </DialogHeader>

        <div className="rounded-xl h-32 mt-4 shadow-md" style={cardStyle} />

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