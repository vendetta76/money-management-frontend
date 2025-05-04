import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../lib/firebaseClient"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import LayoutWithSidebar from "../layouts/LayoutWithSidebar"

interface OutcomeEntry {
  id?: string
  wallet: string
  description: string
  amount: number
  currency: string
  category: string
  createdAt?: any
}

interface WalletEntry {
  id?: string
  name: string
  balance: number
  currency: string
  createdAt?: any
}

const OutcomePage = () => {
  const { user } = useAuth()
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([])
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [form, setForm] = useState({ wallet: "", description: "", amount: "", currency: "", category: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"))
    const unsubOutcomes = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OutcomeEntry[]
      setOutcomes(data)
    })

    const walletRef = collection(db, "users", user.uid, "wallets")
    const unsubWallets = onSnapshot(walletRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletEntry[]
      setWallets(data)
    })

    return () => {
      unsubOutcomes()
      unsubWallets()
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWallet = wallets.find(w => w.id === e.target.value)
    setForm({
      ...form,
      wallet: e.target.value,
      currency: selectedWallet?.currency || ""
    })
    setErrors({ ...errors, wallet: "", currency: "" })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.wallet.trim()) newErrors.wallet = "Dompet wajib dipilih."
    if (!form.description.trim()) newErrors.description = "Deskripsi wajib diisi."
    if (!form.amount.trim() || parseFloat(form.amount) <= 0) newErrors.amount = "Nominal harus lebih dari 0."
    if (!form.currency.trim()) newErrors.currency = "Mata uang wajib dipilih."
    if (!form.category.trim()) newErrors.category = "Kategori wajib dipilih."
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    if (!user) return
    setLoading(true)

    try {
      await addDoc(collection(db, "users", user.uid, "outcomes"), {
        ...form,
        amount: parseFloat(form.amount),
        createdAt: serverTimestamp(),
      })

      setForm({ wallet: "", description: "", amount: "", currency: "", category: "" })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error("Gagal menyimpan pengeluaran:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">📤 Tambah Pengeluaran</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
            ✅ Pengeluaran berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <select
            name="wallet"
            value={form.wallet}
            onChange={handleWalletChange}
            className={`border px-3 py-2 rounded dark:bg-gray-900 dark:text-white ${errors.wallet && "border-red-500"}`}
          >
            <option value="">Pilih Dompet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
            ))}
          </select>

          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi"
            className={`border px-3 py-2 rounded dark:bg-gray-900 dark:text-white ${errors.description && "border-red-500"}`}
          />

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Jumlah"
            className={`border px-3 py-2 rounded dark:bg-gray-900 dark:text-white ${errors.amount && "border-red-500"}`}
          />

          <input
            type="text"
            value={form.currency}
            disabled
            className="border px-3 py-2 rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white"
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`border px-3 py-2 rounded dark:bg-gray-900 dark:text-white ${errors.category && "border-red-500"}`}
          >
            <option value="">Pilih Kategori</option>
            <option value="Makan">Makan</option>
            <option value="Transportasi">Transportasi</option>
            <option value="Langganan">Langganan</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="col-span-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Tambah"}
          </button>
        </form>

        {outcomes.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">Daftar Pengeluaran</h2>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300">
                <tr>
                  <th className="text-left py-2">Dompet</th>
                  <th className="text-left py-2">Deskripsi</th>
                  <th className="text-left py-2">Jumlah</th>
                  <th className="text-left py-2">Mata Uang</th>
                  <th className="text-left py-2">Kategori</th>
                  <th className="text-left py-2">Tanggal</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-200">
                {outcomes.map((out, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2">{wallets.find(w => w.id === out.wallet)?.name || out.wallet}</td>
                    <td className="py-2">{out.description}</td>
                    <td className="py-2">Rp {out.amount.toLocaleString("id-ID")}</td>
                    <td className="py-2">{out.currency}</td>
                    <td className="py-2">{out.category}</td>
                    <td className="py-2">
                      {new Date(out.createdAt?.toDate?.() ?? out.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutWithSidebar>
  )
}

export default OutcomePage
