import React, { useState, useEffect, useMemo, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Repeat2, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import IncomeForm from "../pages/Income/IncomeForm";
import OutcomeForm from "../pages/Outcome/OutcomeForm";
import WalletCard from "../pages/Wallet/WalletCard";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../helpers/formatCurrency";

const tabs = ["income", "outcome", "history"];

// Animation variants for staggered effects
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const paginationVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const WalletPopup = ({ walletId, wallets = [], isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activePreset, setActivePreset] = useState("today");
  const [showBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("history");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 5;

  useEffect(() => {
    if (activeTab === "history") {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [activeTab]);

  if (!isOpen || !walletId) return null;

  const wallet = useMemo(() => wallets.find(w => w?.id === walletId), [wallets, walletId]);

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
      <AnimatePresence>
        {isOpen && (
          <DialogContent
            as={motion.div}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md md:max-w-xl rounded-xl bg-white p-4 pb-6 shadow-xl h-[650px] flex flex-col"
          >
            <DialogTitle asChild>
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                className="text-center font-bold text-lg mb-2"
              >
                Dompet Saya
              </motion.h2>
            </DialogTitle>
            <DialogDescription className="sr-only">Popup riwayat transaksi dan form wallet</DialogDescription>

            <motion.button
              onClick={onClose}
              className="absolute right-4 top-4 bg-white border border-gray-300 shadow rounded-full p-1.5 hover:bg-gray-100 z-20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
              className="flex justify-center mt-2 mb-3"
            >
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
            </motion.div>

            <div className="sticky top-0 z-10 bg-white py-2 flex justify-center gap-2 border-b mb-2">
              <motion.div layoutId="tab-underline" className="absolute bottom-0 h-0.5 bg-blue-600" />
              {tabs.map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`relative px-4 py-2 rounded text-sm font-medium transition-all duration-200 shadow-sm ${
                    activeTab === tab ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-background"
                      className="absolute inset-0 bg-blue-600 rounded z-[-1]"
                      initial={false}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === "income" && "Pemasukan"}
                    {tab === "outcome" && "Pengeluaran"}
                    {tab === "history" && "Riwayat"}
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.div className="px-1 space-y-4 flex-1 overflow-y-auto max-h-[420px]">
              <AnimatePresence mode="wait">
                {activeTab === "history" && (
                  <motion.div
                    key={activeTab + currentPage}
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-2"
                    >
                      <motion.div variants={itemVariants}>
                        <Search size={18} className="text-gray-400" />
                      </motion.div>
                      <motion.div variants={itemVariants} className="w-full">
                        <Input
                          ref={searchInputRef}
                          placeholder="Cari transaksi..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full"
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-wrap gap-2"
                    >
                      {["today", "yesterday", "last7", "all"].map((preset) => (
                        <motion.button
                          key={preset}
                          variants={itemVariants}
                          onClick={() => handleDatePreset(preset)}
                          className={`px-3 py-1 rounded border text-sm ${
                            activePreset === preset ? "bg-blue-600 text-white" : "bg-gray-100"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {preset === "today" && "Hari Ini"}
                          {preset === "yesterday" && "Kemarin"}
                          {preset === "last7" && "7 Hari"}
                          {preset === "all" && "Semua"}
                        </motion.button>
                      ))}
                    </motion.div>

                    {loading ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center items-center min-h-[284px]"
                      >
                        <Loader2 className="animate-spin text-gray-500" size={24} />
                      </motion.div>
                    ) : (
                      <div className="min-h-[284px] space-y-4">
                        {paginatedTx.length ? (
                          paginatedTx.map(tx => (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 shadow-sm"
                              whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", transition: { duration: 0.2, ease: "easeOut" } }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-3">
                                {tx.type === "income" && <ArrowDownCircle className="text-green-500" size={16} />}
                                {tx.type === "outcome" && <ArrowUpCircle className="text-red-500" size={16} />}
                                {tx.type === "transfer" && <Repeat2 className="text-blue-500" size={16} />}
                                <span className="font-medium truncate">{tx.description || "Transfer"}</span>
                              </div>
                              <span className="font-semibold">{formatCurrency(tx.amount, tx.currency)}</span>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="text-center text-gray-500 py-10 min-h-[284px] flex items-center justify-center"
                          >
                            Tidak ada transaksi ditemukan.
                          </motion.div>
                        )}
                      </div>
                    )}

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex justify-between items-center pt-2"
                    >
                      <motion.button
                        variants={paginationVariants}
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="text-gray-600 hover:text-blue-600 disabled:text-gray-400"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ← Sebelumnya
                      </motion.button>
                      <motion.span variants={paginationVariants} className="text-sm text-gray-500">
                        Hal {currentPage} dari {totalPages}
                      </motion.span>
                      <motion.button
                        variants={paginationVariants}
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="text-gray-600 hover:text-blue-600 disabled:text-gray-400"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Selanjutnya →
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === "income" && (
                  <motion.div
                    key="income-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
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
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <OutcomeForm presetWalletId={walletId} hideCardPreview onClose={() => setActiveTab("history")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
              className="fixed bottom-4 right-4 z-50 flex gap-2"
            >
              <motion.button
                onClick={() => setActiveTab("income")}
                className="p-3 rounded-full bg-green-500 text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowDownCircle size={20} />
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("outcome")}
                className="p-3 rounded-full bg-red-500 text-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowUpCircle size={20} />
              </motion.button>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default WalletPopup;