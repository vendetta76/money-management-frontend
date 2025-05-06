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

const currencyOptions = [
  { value: "USD", label: "USD" },
  { value: "IDR", label: "IDR" },
  { value: "EUR", label: "EUR" },
  { value: "JPY", label: "JPY" },
  { value: "GBP", label: "GBP" },
  { value: "CHF", label: "CHF" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
  { value: "SGD", label: "SGD" },
  { value: "CNY", label: "CNY" },
  { value: "KRW", label: "KRW" },
  { value: "THB", label: "THB" },
  { value: "PHP", label: "PHP" },
  { value: "MYR", label: "MYR" }
]

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

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = "Nama wallet wajib diisi."
    if (!form.currency) newErrors.currency = "Mata uang wajib dipilih."
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    const maxWallets = userMeta?.role === "premium" ? 10 : 5
    if (!editingId && wallets.length >= maxWallets) {
      alert(`Batas wallet telah tercapai. Pengguna ${userMeta?.role === "premium" ? "Premium" : "Reguler"} hanya dapat membuat maksimal ${maxWallets} wallet.`)
      return
    }

    try {
      const payload = {
        name: form.name,
        balance: 0,
        currency: form.currency,
        createdAt: serverTimestamp(),
      }
      const userDocRef = doc(db, "users", user!.uid)
      const docRef = editingId
        ? doc(db, "users", user!.uid, "wallets", editingId)
        : null

      if (!editingId) {
        await setDoc(userDocRef, {}, { merge: true })
        await addDoc(collection(db, "users", user!.uid, "wallets"), payload)
        setSuccess("Wallet berhasil ditambahkan. Anda dapat menambahkan saldo melalui menu Transaksi.")
      } else {
        await updateDoc(docRef!, payload)
        setSuccess("Wallet berhasil diperbarui.")
      }

      setForm({ name: "", balance: "0", currency: "USD" })
      setEditingId(null)
      setShowForm(false)
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      console.error("Terjadi kesalahan saat menyimpan wallet:", err)
    }
  }

  const handleEdit = (wallet: WalletEntry) => {
    setForm({
      name: wallet.name,
      balance: "0",
      currency: wallet.currency || "USD",
    })
    setEditingId(wallet.id!)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!editingId) return
    const confirm = window.confirm("Apakah Anda yakin ingin menghapus wallet ini?")
    if (!confirm) return
    try {
      await deleteDoc(doc(db, "users", user!.uid, "wallets", editingId))
      setEditingId(null)
      setShowForm(false)
    } catch (err) {
      console.error("Terjadi kesalahan saat menghapus wallet:", err)
    }
  }

  return (
    <LayoutShell>
      <main className="2xl:px-16 max-w-2xl md:ml-64 md:px-8 min-h-screen mx-auto pt-4 px-4 sm:px-6 w-full xl:px-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-2xl">Manajemen Wallet</h1>
          <button
            onClick={() => {
              setForm({ name: "", balance: "0", currency: "USD" })
              setEditingId(null)
              setShowForm(true)
            }}
            className="bg-blue-600 flex gap-2 hover:bg-blue-700 items-center px-3 py-1.5 rounded text-sm text-white"
          >
            <Plus size={16} /> Tambah Wallet
          </button>
        </div>

        {success && (
          <div className="bg-green-100 border border-green-300 dark:border-gray-700 mb-4 p-3 rounded-lg text-green-700">
            ✅ {success}
          </div>
        )}

        <div className="mb-6">
          <h2 className="dark:text-white font-semibold mb-3 text-gray-800 text-lg">Total Saldo per Mata Uang</h2>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              total > 0 && (
                <div
                  key={currency}
                  className="bg-white border dark:bg-gray-900 dark:border-gray-700 dark:text-white font-medium px-5 py-4 rounded-xl shadow text-gray-800 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span>Total {currency}</span>
                    <span className="font-semibold">
                      {showBalance
                        ? new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency,
                            maximumFractionDigits: 0
                          }).format(total)
                        : "••••••••"}
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Daftar Wallet</h2>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="dark:text-white flex gap-1 hover:text-gray-800 items-center text-gray-600 text-sm"
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />} {showBalance ? "Sembunyikan" : "Tampilkan"} Saldo
          </button>
        </div>

        {wallets.length === 0 ? (
          <p className="dark:text-white text-gray-500">Belum ada wallet ditambahkan.</p>
        ) : (
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-gradient-to-br flex flex-col from-purple-600 h-32 justify-between p-5 rounded-2xl shadow text-white to-indigo-600"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{wallet.name}</h3>
                  <Settings
                    className="cursor-pointer h-5 hover:opacity-100 opacity-80 w-5"
                    onClick={() => handleEdit(wallet)}
                  />
                </div>
                <div className="font-bold text-2xl">
                  {showBalance
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: wallet.currency || "IDR",
                        maximumFractionDigits: 0
                      }).format(wallet.balance)
                    : "••••••••"}
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="bg-black bg-opacity-30 fixed flex inset-0 items-center justify-center z-50">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-900 max-w-sm md:p-6 p-4 relative rounded-xl shadow-xl w-full"
            >
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="absolute dark:text-white hover:text-gray-600 right-4 text-gray-400 top-4"
              >
                <X size={20} />
              </button>
              <h2 className="font-semibold mb-4 text-lg">{editingId ? "Edit Wallet" : "Tambah Wallet"}</h2>

              <div className="mb-4">
                <label className="block font-medium mb-1 text-sm">Nama Wallet</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.name && "border-red-500"}`}
                />
                {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1 text-sm">Mata Uang</label>
                <Select
                  name="currency"
                  value={currencyOptions.find(opt => opt.value === form.currency)}
                  onChange={(selected) =>
                    setForm({ ...form, currency: selected?.value || "" })
                  }
                  options={currencyOptions}
                  classNamePrefix="react-select"
                  placeholder="Pilih mata uang..."
                  isSearchable
                />
                {errors.currency && <p className="mt-1 text-red-500 text-sm">{errors.currency}</p>}
              </div>

              <div className="flex items-center justify-between">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="hover:underline text-red-600 text-sm"
                  >
                    Hapus Wallet
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-white"
                >
                  {editingId ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </LayoutShell>
  )
}

export default WalletPage
