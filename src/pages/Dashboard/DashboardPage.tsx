import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

import LayoutShell from '../../layouts/LayoutShell';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebaseClient';

import DashboardHeader from './DashboardHeader';
import DashboardFilters from './DashboardFilters';
import MoneySplitSimulator from './MoneySplitSimulator';
import BalanceTrendChart from './BalanceTrendChart';
import WalletPieChart from './WalletPieChart';
import RecentTransactions from './RecentTransactions';
import SurvivabilityScoreBox from './SurvivabilityScoreBox';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [income, setIncome] = useState(0);
  const [outcome, setOutcome] = useState(0);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isWalletsLoaded, setIsWalletsLoaded] = useState(false);
  const [showSplit, setShowSplit] = useState(false);

  const prevStatus = useRef(null);

  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        setDisplayName(snap.data().name || user.email);
      } else {
        setDisplayName(user.email);
      }
    });

    const incomeRef = collection(db, 'users', user.uid, 'incomes');
    const outcomeRef = collection(db, 'users', user.uid, 'outcomes');
    const transferRef = collection(db, 'users', user.uid, 'transfers');
    const walletRef = collection(db, 'users', user.uid, 'wallets');

    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      let total = 0;
      const newTrans = [];
      snap.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
        newTrans.push({ ...data, type: 'income', id: doc.id });
      });
      setIncome(total);
      setTransactions((prev) => [...prev.filter((tx) => tx.type !== 'income'), ...newTrans]);
    });

    const unsubOutcomes = onSnapshot(outcomeRef, (snap) => {
      let total = 0;
      const newTrans = [];
      snap.forEach((doc) => {
        const data = doc.data();
        total += data.amount || 0;
        newTrans.push({ ...data, type: 'outcome', id: doc.id });
      });
      setOutcome(total);
      setTransactions((prev) => [...prev.filter((tx) => tx.type !== 'outcome'), ...newTrans]);
    });

    const unsubTransfers = onSnapshot(transferRef, (snap) => {
      const newTransfers = snap.docs.map((doc) => ({
        ...doc.data(),
        type: 'transfer',
        id: doc.id,
      }));
      setTransactions((prev) => [...prev.filter((tx) => tx.type !== 'transfer'), ...newTransfers]);
    });

    const unsubWallets = onSnapshot(walletRef, (snap) => {
      const walletData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWallets(walletData);
      setIsWalletsLoaded(true);
    });

    return () => {
      unsubIncomes();
      unsubOutcomes();
      unsubWallets();
      unsubTransfers();
    };
  }, [user]);

  const allCurrencies = Array.from(new Set(wallets.map((w) => w.currency)));

  return (
    <LayoutShell>
      <main className="min-h-screen w-full bg-background text-foreground">
        <DashboardHeader displayName={displayName} />

        <DashboardFilters
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          filterWallet={filterWallet}
          setFilterWallet={setFilterWallet}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          wallets={wallets}
          allCurrencies={allCurrencies}
        />

        <BalanceTrendChart
          transactions={transactions}
          selectedCurrency={selectedCurrency}
          filterDate={filterDate}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          wallets={wallets}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <WalletPieChart wallets={wallets} selectedCurrency={selectedCurrency} />
          <RecentTransactions
            transactions={transactions}
            wallets={wallets}
            isWalletsLoaded={isWalletsLoaded}
          />
          <SurvivabilityScoreBox income={income} outcome={outcome} wallets={wallets} />
        </div>

        <div className="mt-10">
          <button
            onClick={() => setShowSplit((prev) => !prev)}
            className="mb-4 inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-4 py-2 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
          >
            {showSplit ? 'Sembunyikan Split Simulator' : 'Tampilkan Split Simulator'}
          </button>

          {showSplit && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow lg:col-span-3">
                <MoneySplitSimulator />
              </div>
            </div>
          )}
        </div>
      </main>
    </LayoutShell>
  );
}

export default DashboardPage;