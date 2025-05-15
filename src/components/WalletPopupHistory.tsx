import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Repeat2, Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import IncomeForm from "../pages/Income/IncomeForm";
import OutcomeForm from "../pages/Outcome/OutcomeForm";
import WalletCard from "../pages/Wallet/WalletCard";

const WalletPopup = ({ walletId, wallets, isOpen, onClose }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("history"); // "income" | "outcome" | "history"

  const activeWallet = wallets.find(w => w.id === walletId);
  if (!isOpen || !walletId || !activeWallet) return null;

  useEffect(() => {
    if (!user) return;

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"));
    const transferQuery = collection(db, "users", user.uid, "transfers");

    const unsubIn = onSnapshot(incomeQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "income", ...d.data() }))
        .filter(tx => tx.wallet === walletId);
      setTransactions(prev => [...prev.filter(x => x.type !== "income"), ...data]);
    });

    const unsubOut = onSnapshot(outcomeQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "outcome", ...d.data() }))
        .filter(tx => tx.wallet === walletId);
      setTransactions(prev => [...prev.filter(x => x.type !== "outcome"), ...data]);
    });

    const unsubTransfer = onSnapshot(transferQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "transfer", ...d.data() }))
        .filter(tx => tx.from === walletId || tx.to === walletId);
      setTransactions(prev => [...prev.filter(x => x.type !== "transfer"), ...data]);
    });

    return () => {
      unsubIn(); unsubOut(); unsubTransfer();
    };
  }, [user, walletId, isOpen]);

  const filteredTransactions = transactions.filter(tx => {
    const matchDesc = !search || tx.description?.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || (
      tx.createdAt?.seconds &&
      format(new Date(tx.createdAt.seconds * 1000), "yyyy-MM-dd") === dateFilter
    );
    return matchDesc && matchDate;
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showClose={false}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                   w-[95%] max-w-lg p-3 sm:p-6 bg-white rounded-xl shadow-xl 
                   max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-white border border-gray-300 shadow rounded-full p-1.5 hover:bg-gray-100 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* WalletCard */}
        <div className="flex justify-center mt-4 mb-2">
          <WalletCard
            id={activeWallet.id}
            name={activeWallet.name}
            balance={activeWallet.balance}
            currency={activeWallet.currency}
            colorStyle={activeWallet.colorStyle}
            colorValue={activeWallet.colorValue}
            showBalance={showBalance}
            onEdit={() => {}}
            onClick={() => {}}
            showEdit={false}
          />
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center gap-2 mt-4 mb-2">
          {["income", "outcome", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded text-sm font-medium ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "income" && "Pemasukan"}
              {tab === "outcome" && "Pengeluaran"}
              {tab === "history" && "Riwayat"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-2 flex-1 overflow-y-auto space-y-4">
          {activeTab === "income" && (
            <IncomeForm
              presetWalletId={walletId}
              onClose={() => setActiveTab("history")}
            />
          )}

          {activeTab === "outcome" && (
            <OutcomeForm
              presetWalletId={walletId}
              onClose={() => setActiveTab("history")}
            />
          )}

          {activeTab === "history" && (
            <>
              <div className="flex items-center gap-2">
                <Search size={18} className="text-gray-400" />
                <Input
                  placeholder="Cari transaksi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                {filteredTransactions.length ? (
                  filteredTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        {tx.type === "income" && <ArrowDownCircle className="text-green-500" size={16} />}
                        {tx.type === "outcome" && <ArrowUpCircle className="text-red-500" size={16} />}
                        {tx.type === "transfer" && <Repeat2 className="text-blue-500" size={16} />}
                        <span className="font-medium truncate">{tx.description || "Transfer"}</span>
                      </div>
                      <span className="font-semibold">{tx.currency} {tx.amount.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 pt-4">Tidak ada transaksi ditemukan.</div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletPopup;
