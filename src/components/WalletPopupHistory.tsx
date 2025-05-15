// WalletPopupHistory.tsx - Versi Swipeable Tabs + Sorted + Pagination + Preset Date Filter

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Repeat2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import IncomeForm from "../pages/Income/IncomeForm";
import OutcomeForm from "../pages/Outcome/OutcomeForm";
import WalletCard from "../pages/Wallet/WalletCard";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const tabs = ["income", "outcome", "history"];

const WalletPopup = ({ walletId, wallets, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activePreset, setActivePreset] = useState("today");
  const [showBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const activeWallet = wallets.find(w => w.id === walletId);
  if (!isOpen || !walletId || !activeWallet) return null;

  useEffect(() => {
    if (!user) return;

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"));
    const transferQuery = collection(db, "users", user.uid, "transfers");

    const unsubIn = onSnapshot(incomeQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "income", ...d.data() }));
      setTransactions(prev => [...prev.filter(x => x.type !== "income"), ...data]);
    });

    const unsubOut = onSnapshot(outcomeQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "outcome", ...d.data() }));
      setTransactions(prev => [...prev.filter(x => x.type !== "outcome"), ...data]);
    });

    const unsubTransfer = onSnapshot(transferQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "transfer", ...d.data() }));
      setTransactions(prev => [...prev.filter(x => x.type !== "transfer"), ...data]);
    });

    return () => {
      unsubIn(); unsubOut(); unsubTransfer();
    };
  }, [user, walletId, isOpen]);

  const handleDatePreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    if (preset === "today") {
      setDateFilter(format(today, "yyyy-MM-dd"));
    } else if (preset === "yesterday") {
      setDateFilter(format(subDays(today, 1), "yyyy-MM-dd"));
    } else if (preset === "last7") {
      setDateFilter("last7");
    } else {
      setDateFilter("");
    }
  };

  const allFiltered = transactions
    .filter(tx => tx.wallet === walletId || tx.from === walletId || tx.to === walletId)
    .filter(tx => {
      const matchDesc = !search || tx.description?.toLowerCase().includes(search.toLowerCase());
      let matchDate = true;
      if (dateFilter === "last7") {
        const txDate = new Date(tx.createdAt.seconds * 1000);
        matchDate = txDate >= subDays(new Date(), 7);
      } else if (dateFilter) {
        matchDate = format(new Date(tx.createdAt.seconds * 1000), "yyyy-MM-dd") === dateFilter;
      }
      return matchDesc && matchDate;
    })
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

  const totalPages = Math.ceil(allFiltered.length / perPage);
  const paginatedTx = allFiltered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const swipeToTab = (direction) => {
    const index = tabs.indexOf(activeTab);
    const next = direction === "left" ? index + 1 : index - 1;
    if (tabs[next]) setActiveTab(tabs[next]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showClose={false}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg p-3 sm:p-6 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-white border border-gray-300 shadow rounded-full p-1.5 hover:bg-gray-100 z-20"
        >
          <X className="w-4 h-4" />
        </button>

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

        <div className="flex justify-center gap-2 mt-4 mb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded text-sm font-medium ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "income" && "Pemasukan"}
              {tab === "outcome" && "Pengeluaran"}
              {tab === "history" && "Riwayat"}
            </button>
          ))}
        </div>

        <div className="mt-2 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + currentPage}
              className="w-full h-full overflow-y-auto"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.x < -50) swipeToTab("left");
                else if (info.offset.x > 50) swipeToTab("right");
              }}
            >
              {activeTab === "income" && (
                <IncomeForm presetWalletId={walletId} onClose={() => setActiveTab("history")} />
              )}
              {activeTab === "outcome" && (
                <OutcomeForm presetWalletId={walletId} onClose={() => setActiveTab("history")} />
              )}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-gray-400" />
                    <Input
                      placeholder="Cari transaksi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Preset Tanggal */}
                  <div className="flex flex-wrap gap-2">
                    {["today", "yesterday", "last7", "all"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleDatePreset(preset)}
                        className={`px-3 py-1 rounded border text-sm ${
                          activePreset === preset ? "bg-blue-600 text-white" : "bg-gray-100"
                        }`}
                      >
                        {preset === "today" && "Hari Ini"}
                        {preset === "yesterday" && "Kemarin"}
                        {preset === "last7" && "7 Hari"}
                        {preset === "all" && "Semua"}
                      </button>
                    ))}
                  </div>

                  {paginatedTx.length ? (
                    paginatedTx.map(tx => (
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

                  <div className="flex justify-between items-center pt-2">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                      ← Sebelumnya
                    </button>
                    <span className="text-sm text-gray-500">Hal {currentPage} dari {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      Selanjutnya →
                    </button>
                  </div>

                  <div className="text-center mt-4">
                    <button
                      onClick={() => navigate("/history")}
                      className="text-blue-600 underline text-sm"
                    >
                      Lihat Selengkapnya
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletPopup;