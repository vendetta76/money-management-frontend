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
import { formatCurrency } from "../pages/helpers/formatCurrency";
import { toast } from "react-toastify";

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
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force re-render
  const perPage = 5;

  useEffect(() => {
    if (activeTab === "history") {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [activeTab]);

  // Reset pagination when switching tabs
  useEffect(() => {
    setCurrentPage(1);
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
  }, [user, walletId, isOpen, refreshKey]);

  const handleDatePreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    if (preset === "today") setDateFilter(format(today, "yyyy-MM-dd"));
    else if (preset === "yesterday") setDateFilter(format(subDays(today, 1), "yyyy-MM-dd"));
    else if (preset === "last7") setDateFilter("last7");
    else setDateFilter("");
  };

  // Success handler for income/outcome forms
  const handleFormSuccess = (isEdit, formType) => {
    console.log(`Form success: ${formType}, isEdit: ${isEdit}`); // Debug log
    
    // Show success toast
    const message = isEdit 
      ? `${formType === 'income' ? 'Pemasukan' : 'Pengeluaran'} berhasil diperbarui!`
      : `${formType === 'income' ? 'Pemasukan' : 'Pengeluaran'} berhasil ditambahkan!`;
    
    toast.success(message);
    
    // Force refresh of data
    setRefreshKey(prev => prev + 1);
    
    // Switch to history tab after a short delay
    setTimeout(() => {
      setActiveTab("history");
      setCurrentPage(1);
    }, 1000);
  };

  const handleFormClose = () => {
    setActiveTab("history");
  };

  const allFiltered = transactions
    .filter(tx => tx.wallet === walletId || tx.from === walletId || tx.to === walletId)
    .filter(tx => {
      const matchDesc = !search || tx.description?.toLowerCase().includes(search.toLowerCase());
      let matchDate = true;
      if (dateFilter === "last7") {
        const txDate = new Date((tx.createdAt?.seconds ?? Date.now() / 1000) * 1000);
        matchDate = txDate >= subDays(new Date(), 7);
      } else if (dateFilter) {
        matchDate = format(new Date((tx.createdAt?.seconds ?? Date.now() / 1000) * 1000), "yyyy-MM-dd") === dateFilter;
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
            className="w-full max-w-md md:max-w-xl rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 pb-6 shadow-xl h-[650px] flex flex-col"
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
              className="absolute right-4 top-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 z-20"
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

            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 flex justify-center gap-2 border-b mb-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`relative px-4 py-2 rounded text-sm font-medium transition-all duration-200 shadow-sm ${
                    activeTab === tab 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                    key={`history-${refreshKey}-${currentPage}`}
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
                        <Search size={18} className="text-gray-400 dark:text-gray-300" />
                      </motion.div>
                      <motion.div variants={itemVariants} className="w-full">
                        <Input
                          ref={searchInputRef}
                          placeholder="Cari transaksi..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
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
                          className={`px-3 py-1 rounded border text-sm transition-colors ${
                            activePreset === preset 
                              ? "bg-blue-600 text-white border-blue-600" 
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                      <div className="min-h-[284px] space-y-3">
                        {paginatedTx.length ? (
                          paginatedTx.map(tx => (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm border-gray-200 dark:border-gray-700"
                              whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", transition: { duration: 0.2, ease: "easeOut" } }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {tx.type === "income" && <ArrowDownCircle className="text-green-500 flex-shrink-0" size={16} />}
                                {tx.type === "outcome" && <ArrowUpCircle className="text-red-500 flex-shrink-0" size={16} />}
                                {tx.type === "transfer" && <Repeat2 className="text-blue-500 flex-shrink-0" size={16} />}
                                <div className="min-w-0 flex-1">
                                  <span className="font-medium truncate text-gray-800 dark:text-white block">{tx.description || "Transfer"}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {format(new Date((tx.createdAt?.seconds ?? Date.now() / 1000) * 1000), "dd/MM/yyyy HH:mm")}
                                  </span>
                                </div>
                              </div>
                              <span className={`font-semibold text-sm flex-shrink-0 ${
                                tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 
                                tx.type === 'outcome' ? 'text-red-600 dark:text-red-400' : 
                                'text-blue-600 dark:text-blue-400'
                              }`}>
                                {tx.type === 'income' ? '+' : tx.type === 'outcome' ? '-' : ''}
                                {formatCurrency(tx.amount, tx.currency)}
                              </span>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="text-center text-gray-500 py-10 min-h-[284px] flex flex-col items-center justify-center"
                          >
                            <div className="text-gray-400 mb-2">📊</div>
                            <p>Tidak ada transaksi ditemukan.</p>
                            <p className="text-sm mt-1">Mulai tambahkan pemasukan atau pengeluaran!</p>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {totalPages > 1 && (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700"
                      >
                        <motion.button
                          variants={paginationVariants}
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                          whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                          whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                        >
                          ← Sebelumnya
                        </motion.button>
                        <motion.span variants={paginationVariants} className="text-sm text-gray-500 dark:text-gray-400">
                          Hal {currentPage} dari {totalPages}
                        </motion.span>
                        <motion.button
                          variants={paginationVariants}
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="text-gray-600 dark:text-gray-300 hover:text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                          whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
                          whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                        >
                          Selanjutnya →
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === "income" && (
                  <motion.div
                    key="income-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full"
                  >
                    <IncomeForm 
                      presetWalletId={walletId} 
                      hideCardPreview={true}
                      onClose={handleFormClose}
                      onSuccess={(isEdit) => {
                        console.log("Income form success callback triggered:", isEdit);
                        handleFormSuccess(isEdit, 'income');
                      }}
                    />
                  </motion.div>
                )}

                {activeTab === "outcome" && (
                  <motion.div
                    key="outcome-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full"
                  >
                    <OutcomeForm 
                      presetWalletId={walletId} 
                      hideCardPreview={true}
                      onClose={handleFormClose}
                      onSuccess={(isEdit) => {
                        console.log("Outcome form success callback triggered:", isEdit);
                        handleFormSuccess(isEdit, 'outcome');
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Floating Action Buttons - Only show when on history tab */}
            {activeTab === "history" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
                className="fixed bottom-6 right-6 z-50 flex gap-3"
              >
                <motion.button
                  onClick={() => {
                    console.log("Switching to income tab");
                    setActiveTab("income");
                  }}
                  className="p-3 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Tambah Pemasukan"
                >
                  <ArrowDownCircle size={20} />
                </motion.button>
                <motion.button
                  onClick={() => {
                    console.log("Switching to outcome tab");
                    setActiveTab("outcome");
                  }}
                  className="p-3 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 hover:shadow-xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Tambah Pengeluaran"
                >
                  <ArrowUpCircle size={20} />
                </motion.button>
              </motion.div>
            )}
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default WalletPopup;