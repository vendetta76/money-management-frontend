
import { useEffect, useState } from "react"
import { db } from "../lib/firebaseClient"
import { useAuth } from "../context/AuthContext"
import LayoutShell from "../layouts/LayoutShell"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc
} from "firebase/firestore"
import { Settings, Plus, X, Eye, EyeOff } from "lucide-react"
import Select from "react-select"

interface WalletEntry {
  id?: string
  name: string
  balance: number
  currency: string
  createdAt?: any
}

const currencyOptions = [...]; // singkat

const WalletPage = () => {
  const { user, userMeta } = useAuth()
  const [form, setForm] = useState({ name: "", balance: "0", currency: "USD" })
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  const totalsByCurrency = wallets.reduce((acc, wallet) => {
    if (!acc[wallet.currency]) acc[wallet.currency] = 0
    acc[wallet.currency] += wallet.balance
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "users", user.uid, "wallets"),
      orderBy("createdAt", "desc")
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletEntry[]
      setWallets(data)
    })
    return () => unsubscribe()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => { /* sama seperti sebelumnya */ }

  const handleEdit = (wallet: WalletEntry) => { /* sama */ }
  const handleDelete = async () => { /* sama */ }

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-10 2xl:px-16 pt-4 md:ml-64 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Wallet</h1>
          <button
            onClick={() => { setForm({ name: "", balance: "0", currency: "USD" }); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            <Plus size={16} /> Tambah Wallet
          </button>
        </div>

        {/* Total saldo */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Total Saldo per Mata Uang</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              total > 0 && (
                <div key={currency} className="bg-white border rounded-xl px-5 py-4 shadow text-sm font-medium text-gray-800">
                  <div className="flex items-center justify-between">
                    <span>Total {currency}</span>
                    <span className="font-semibold">
                      {showBalance
                        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency, maximumFractionDigits: 0 }).format(total)
                        : "••••••••"}
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* List Wallet */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Daftar Wallet</h2>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />} {showBalance ? "Sembunyikan" : "Tampilkan"} Saldo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-2xl shadow h-32 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">{wallet.name}</h3>
                <Settings className="w-5 h-5 opacity-80 hover:opacity-100 cursor-pointer" onClick={() => handleEdit(wallet)} />
              </div>
              <div className="text-2xl font-bold">
                {showBalance
                  ? new Intl.NumberFormat("id-ID", { style: "currency", currency: wallet.currency || 'IDR', maximumFractionDigits: 0 }).format(wallet.balance)
                  : "••••••••"}
              </div>
            </div>
          ))}
        </div>
      </main>
    </LayoutShell>
  )
}

export default WalletPage
