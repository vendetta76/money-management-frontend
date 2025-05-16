import React, { useState, useEffect, useMemo } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Repeat2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import IncomeForm from "../pages/Income/IncomeForm";
import OutcomeForm from "../pages/Outcome/OutcomeForm";
import WalletCard from "../pages/Wallet/WalletCard";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const tabs = ["income", "outcome", "history"];

const WalletPopup = ({ walletId, wallets = [], isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activePreset, setActivePreset] = useState("today");
  const [showBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 5;

  if (!isOpen || !walletId) return null;

  const wallet = useMemo(() => {
    return wallets.find(w => w?.id === walletId);
  }, [wallets, walletId]);

  if (!wallet || !wallet.colorStyle) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="p-6 text-center text-gray-500">
          <DialogDescription>Memuat data dompet...</DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  const colorStyle = wallet.colorStyle === "gradient" ? "gradient" : "solid";
  const colorValue = wallet.colorValue || "#cccccc";

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"));
    const transferQuery = collection(db, "users", user.uid, "transfers");

    const unsubIn = onSnapshot(incomeQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "income", ...d.data() }));
      setTransactions(prev => [...prev.filter(x => x.type !== "income"), ...data]);
      setLoading(false);
    });

    const unsubOut = onSnapshot(outcomeQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "outcome", ...d.data() }));
      setTransactions(prev => [...prev.filter(x => x.type !== "outcome"), ...data]);
      setLoading(false);
    });

    const unsubTransfer = onSnapshot(transferQuery, snap => {
      const data = snap.docs.map(d => ({ id: d.id, type: "transfer", ...d.data() }));
      setTransactions(prev => [...prev.filter(x => x.type !== "transfer"), ...data]);
      setLoading(false);
    });

    return () => {
      unsubIn(); unsubOut(); unsubTransfer();
    };
  }, [user, walletId, isOpen]);

  const handleDatePreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    if (preset === "today") setDateFilter(format(today, "yyyy-MM-dd"));
    else if (preset === "yesterday") setDateFilter(format(subDays(today, 1), "yyyy-MM-dd"));
    else if (preset === "last7") setDateFilter("last7");
    else setDateFilter("");
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-xl rounded-t-xl bg-white p-4 pb-8 shadow-xl max-h-[95vh] flex flex-col"
      >
        <DialogTitle className="text-center font-bold text-lg mb-2">Dompet Saya</DialogTitle>
        <DialogDescription className="sr-only">Popup riwayat transaksi dan form wallet</DialogDescription>

        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-white border border-gray-300 shadow rounded-full p-1.5 hover:bg-gray-100 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex justify-center mt-2 mb-3">
          <WalletCard
            id={wallet.id}
            name={wallet.name}
            balance={wallet.balance}
            currency={wallet.currency}
            colorStyle={colorStyle}
            colorValue={colorValue}
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

        <div className="flex-1 overflow-y-auto px-1 min-h-[300px] max-h-[70vh] md:max-h-[60vh]">
          <AnimatePresence mode="wait">
            {activeTab === "history" && !loading && (
              <motion.div
                key={activeTab + currentPage}
                className="space-y-4"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2">
                  <Search size={18} className="text-gray-400" />
                  <Input
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full"
                  />
                </div>

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
              </motion.div>
            )}

            {activeTab === "income" && (
              <motion.div
                key="income-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <IncomeForm presetWalletId={walletId} hideCardPreview onClose={() => setActiveTab("history")} />
              </motion.div>
            )}

            {activeTab === "outcome" && (
              <motion.div
                key="outcome-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <OutcomeForm presetWalletId={walletId} hideCardPreview onClose={() => setActiveTab("history")} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletPopup;