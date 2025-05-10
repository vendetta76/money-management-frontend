import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LayoutShell from '../layouts/LayoutShell'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import { collection, onSnapshot } from 'firebase/firestore'
import { format } from 'date-fns'
import { id as localeID } from 'date-fns/locale'
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { toast } from 'sonner'

const COLORS = ['#10B981', '#EF4444', '#6366F1', '#F59E0B', '#06B6D4']

// Rupiah formatter
const formatRupiah = (amount) => {
  return amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
}

const getSurvivabilityStatus = (income, outcome, wallets) => {
  const savings = wallets.reduce((acc, w) => acc + (w.isSaving ? w.balance || 0 : 0), 0)
  const total = wallets.reduce((acc, w) => acc + (w.balance || 0), 0)
  const ratio = outcome > 0 ? income / outcome : income > 0 ? 2 : 0
  const savingsRatio = total > 0 ? savings / total : 0

  let scoreIncome = ratio >= 1.5 ? 100 : ratio >= 1 ? 70 : ratio >= 0.8 ? 40 : 10
  let scoreSavings = savingsRatio >= 0.3 ? 100 : savingsRatio >= 0.2 ? 70 : savingsRatio >= 0.1 ? 40 : 10
  const totalScore = (scoreIncome + scoreSavings) / 2

  let status = '🔴'
  if (totalScore >= 80) status = '✅'
  else if (totalScore >= 50) status = '⚠️'

  return {
    icon: status,
    label: status === '✅' ? 'Aman' : status === '⚠️' ? 'Waspada' : 'Bahaya',
    details: {
      income: { score: scoreIncome, ratio: ratio.toFixed(2) },
      savings: { score: scoreSavings, ratio: savingsRatio.toFixed(2) },
      total: totalScore.toFixed(1)
    }
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [income, setIncome] = useState(0)
  const [outcome, setOutcome] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState('all')
  const [isWalletsLoaded, setIsWalletsLoaded] = useState(false) // Add loading state for wallets
  const prevStatus = useRef(null)

  useEffect(() => {
    if (!user) return

    const incomeRef = collection(db, 'users', user.uid, 'incomes')
    const outcomeRef = collection(db, 'users', user.uid, 'outcomes')
    const walletRef = collection(db, 'users', user.uid, 'wallets')

    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      let total = 0
      const newTrans = []
      snap.forEach(doc => {
        const data = doc.data()
        total += data.amount || 0
        newTrans.push({ ...data, type: 'income', id: doc.id })
      })
      setIncome(total)
      setTransactions(prev => [...prev, ...newTrans])
    })

    const unsubOutcomes = onSnapshot(outcomeRef, (snap) => {
      let total = 0
      const newTrans = []
      snap.forEach(doc => {
        const data = doc.data()
        total += data.amount || 0
        newTrans.push({ ...data, type: 'outcome', id: doc.id })
      })
      setOutcome(total)
      setTransactions(prev => [...prev, ...newTrans])
    })

    const unsubWallets = onSnapshot(walletRef, (snap) => {
      const walletData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setWallets(walletData)
      setIsWalletsLoaded(true) // Mark wallets as loaded
    })

    return () => {
      unsubIncomes()
      unsubOutcomes()
      unsubWallets()
    }
  }, [user])

  const sortedTx = transactions
    .filter(tx => tx.createdAt)
    .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
    .slice(0, 7)

  const allCurrencies = Array.from(new Set(wallets.map(w => w.currency)))
  const filteredWallets = selectedCurrency === 'all'
    ? wallets
    : wallets.filter(w => w.currency === selectedCurrency)

  const pieData = filteredWallets.map(wallet => ({ name: wallet.name, value: wallet.balance }))
  const totalSaldo = filteredWallets.reduce((acc, w) => acc + (w.balance || 0), 0)
  const lineData = [
    { name: 'Point 1', value: totalSaldo * 0.8 },
    { name: 'Point 2', value: totalSaldo * 0.9 },
    { name: 'Point 3', value: totalSaldo }
  ]
  const survivability = getSurvivabilityStatus(income, outcome, wallets)

  useEffect(() => {
    if (!prevStatus.current) prevStatus.current = survivability.icon
    else if (prevStatus.current !== survivability.icon) {
      toast(`Status survivability berubah dari ${prevStatus.current} ke ${survivability.icon}`)
      prevStatus.current = survivability.icon
    }
  }, [survivability.icon])

  // Function to get wallet name, aligned with HistoryPage.tsx
  const getWalletName = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId)
    return wallet ? wallet.name : `${walletId} (Telah dihapus)`
  }

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 md:px-8 max-w-screen-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-purple-700">Dashboard</h1>
          <p className="text-sm text-gray-500">Selamat datang kembali, {user?.email}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Filter Mata Uang</label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border rounded-lg bg-white shadow"
          >
            <option value="all">Semua</option>
            {allCurrencies.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">Trend Saldo ({selectedCurrency})</h2>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="value" stroke="#6366F1" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-sm font-semibold text-gray-500 mb-4">Distribusi Wallet (Pie)</h2>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {pieData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">Transaksi Terbaru</h3>
            {!isWalletsLoaded ? (
              <p className="text-sm text-gray-500">Memuat dompet...</p>
            ) : sortedTx.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada transaksi.</p>
            ) : (
              <>
                <div className="max-h-[250px] overflow-y-auto">
                  <ul className="space-y-4">
                    {sortedTx.map((tx) => {
                      const walletName = getWalletName(tx.walletId)
                      return (
                        <li
                          key={tx.id}
                          className="flex justify-between items-start text-sm flex-col sm:flex-row gap-2 sm:gap-0 hover:bg-gray-50 p-2 rounded transition"
                          title={`${tx.type === 'income' ? 'Income' : 'Outcome'}: ${tx.description} (Dompet: ${walletName})`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">
                              {tx.type === 'income' ? '📥' : '📤'}
                            </span>
                            <div>
                              <p className="font-medium">{tx.description}</p>
                              <p className="text-xs text-gray-400">
                                Dompet: {walletName} ·{' '}
                                {tx.createdAt?.toDate
                                  ? format(new Date(tx.createdAt.toDate()), 'dd MMM yyyy, HH:mm', { locale: localeID })
                                  : '-'}
                              </p>
                              {tx.category && (
                                <p className="text-xs text-gray-400">
                                  Kategori: {tx.category}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-sm font-semibold ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {tx.type === 'income' ? '+' : '–'} {formatRupiah(tx.amount)}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                <div className="mt-4 text-right">
                  <Link to="/history" className="text-blue-500 text-sm hover:underline">
                    Lihat Semua
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-sm text-gray-700">
            <h4 className="text-sm font-semibold text-gray-500 mb-4">Health Score</h4>
            <div className="text-center text-2xl font-semibold mb-2">
              <span
                className={
                  survivability.icon === '✅' ? 'text-green-500' :
                    survivability.icon === '⚠️' ? 'text-yellow-500' : 'text-red-500'
                }
              >
                {survivability.icon} {survivability.label}
              </span>
            </div>
            <h4 className="font-semibold mb-2">Rincian Penilaian:</h4>
            <ul className="space-y-1">
              <li>📈 Rasio Income/Outcome: {survivability.details.income.ratio} → Skor: {survivability.details.income.score}</li>
              <li>💰 Rasio Tabungan: {survivability.details.savings.ratio} → Skor: {survivability.details.savings.score}</li>
              <li>📊 Skor Total: {survivability.details.total}</li>
            </ul>
          </div>
        </div>
      </main>
    </LayoutShell>
  )
}