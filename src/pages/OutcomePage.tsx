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
  updateDoc,
  deleteDoc,
  doc,
  increment,
  arrayUnion
} from "firebase/firestore"
import LayoutShell from "../layouts/LayoutShell"

interface OutcomeEntry {
  id?: string
  wallet: string
  description: string
  amount: number
  currency: string
  createdAt?: any
  editHistory?: any[]
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
  const [form, setForm] = useState({ wallet: "", description: "", amount: "", currency: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const parsedAmount = parseFloat(form.amount)

      if (!editingId) {
        const selectedWallet = wallets.find(w => w.id === form.wallet)
        if (selectedWallet && selectedWallet.balance < parsedAmount) {
          alert("Saldo wallet tidak mencukupi.")
          setLoading(false)
          return
        }

        await addDoc(collection(db, "users", user.uid, "outcomes"), {
          ...form,
          amount: parsedAmount,
          createdAt: serverTimestamp(),
        })

        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(-parsedAmount)
        })
      } else {
        const old = outcomes.find(i => i.id === editingId)
        if (!old) return

        const diff = parsedAmount - old.amount
        const selectedWallet = wallets.find(w => w.id === form.wallet)
        if (selectedWallet && selectedWallet.balance + old.amount < parsedAmount) {
          alert("Saldo wallet tidak mencukupi.")
          setLoading(false)
          return
        }

        await updateDoc(doc(db, "users", user.uid, "outcomes", editingId), {
          description: form.description,
          amount: parsedAmount,
          wallet: form.wallet,
          currency: form.currency,
          editHistory: arrayUnion({
            description: old.description,
            amount: old.amount,
            editedAt: new Date()
          })
        })

        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(-diff)
        })
      }

      setForm({ wallet: "", description: "", amount: "", currency: "" })
      setEditingId(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error("Gagal menyimpan pengeluaran:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: OutcomeEntry) => {
    setForm({
      wallet: item.wallet,
      description: item.description,
      amount: item.amount.toString(),
      currency: item.currency,
    })
    setEditingId(item.id || null)
  }

  const handleDelete = async (id: string, amount: number, wallet: string) => {
    if (!user) return
    await deleteDoc(doc(db, "users", user.uid, "outcomes", id))
    await updateDoc(doc(db, "users", user.uid, "wallets", wallet), {
      balance: increment(amount)
    })
  }

  return (
    <LayoutShell>
      <main className="dark:text-white dark:bg-gray-900 min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 md:ml-64 pt-4 max-w-screen-2xl mx-auto">
        <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold mb-6 text-red-600 dark:text-red-400">
          📤 {editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
        </h1>

        {success && (
          <div className="dark:text-white dark:bg-gray-900 mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
            ✅ {editingId ? "Pengeluaran berhasil diperbarui!" : "Pengeluaran berhasil disimpan!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="dark:text-white dark:bg-gray-900 bg-white dark:bg-gray-900 shadow rounded-xl p-6 mb-6 max-w-xl w-full">
          <div className="dark:text-white dark:bg-gray-900 mb-4">
            <label className="dark:text-white dark:bg-gray-900 block mb-1 text-sm font-medium">Pilih Dompet</label>
            <select
              name="wallet"
              value={form.wallet}
              onChange={handleWalletChange}
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.wallet && "border-red-500"}`}
            >
              <option value="">-- Pilih Dompet --</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
              ))}
            </select>
            {errors.wallet && <p className="dark:text-white dark:bg-gray-900 text-red-500 text-sm mt-1">{errors.wallet}</p>}
          </div>

          <div className="dark:text-white dark:bg-gray-900 mb-4">
            <label className="dark:text-white dark:bg-gray-900 block mb-1 text-sm font-medium">Deskripsi</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              type="text"
              placeholder="Tulis deskripsi"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.description && "border-red-500"}`}
            />
            {errors.description && <p className="dark:text-white dark:bg-gray-900 text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="dark:text-white dark:bg-gray-900 mb-4">
            <label className="dark:text-white dark:bg-gray-900 block text-sm font-medium mb-1">Nominal</label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.amount && "border-red-500"}`}
            />
            {errors.amount && <p className="dark:text-white dark:bg-gray-900 text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div className="dark:text-white dark:bg-gray-900 mb-4">
            <label className="dark:text-white dark:bg-gray-900 block text-sm font-medium mb-1">Mata Uang</label>
            <input
              type="text"
              value={form.currency}
              disabled
              className="dark:text-white dark:bg-gray-900 w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-700"
            />
            {errors.currency && <p className="dark:text-white dark:bg-gray-900 text-red-500 text-sm mt-1">{errors.currency}</p>}
          </div>

          <div className="dark:text-white dark:bg-gray-900 flex justify-between">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ wallet: "", description: "", amount: "", currency: "" })
                  setEditingId(null)
                }}
                className="dark:text-white dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-300 hover:underline"
              >
                Batal Edit
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="dark:text-white dark:bg-gray-900 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>

        <div className="dark:text-white dark:bg-gray-900 mt-8">
          <h2 className="dark:text-white dark:bg-gray-900 text-xl font-semibold mb-4">Transaksi Pengeluaran</h2>
          {outcomes.length === 0 ? (
            <p className="dark:text-white dark:bg-gray-900 text-gray-500 dark:text-gray-300">Belum ada data pengeluaran.</p>
          ) : (
            <div className="dark:text-white dark:bg-gray-900 overflow-x-auto w-full">
              <table className="dark:text-white dark:bg-gray-900 min-w-full bg-white dark:bg-gray-900 border rounded-xl shadow">
                <thead>
                  <tr className="dark:text-white dark:bg-gray-900 bg-gray-100 text-sm text-left">
                    <th className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">Dompet</th>
                    <th className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">Deskripsi</th>
                    <th className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">Nominal</th>
                    <th className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">Mata Uang</th>
                    <th className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">Tanggal</th>
                    <th className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomes.map((entry) => (
                    <tr key={entry.id} className="dark:text-white dark:bg-gray-900 text-sm">
                      <td className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">{wallets.find(w => w.id === entry.wallet)?.name || entry.wallet}</td>
                      <td className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">{entry.description}</td>
                      <td className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">{entry.amount.toLocaleString()}</td>
                      <td className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">{entry.currency}</td>
                      <td className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b">
                        {entry.createdAt?.toDate
                          ? new Date(entry.createdAt.toDate()).toLocaleString()
                          : "-"}
                      </td>
                      <td className="dark:text-white dark:bg-gray-900 px-4 py-2 border-b space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="dark:text-white dark:bg-gray-900 text-blue-600 text-xs hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id!, entry.amount, entry.wallet)}
                          className="dark:text-white dark:bg-gray-900 text-red-600 text-xs hover:underline"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </LayoutShell>
  )
}

export default OutcomePage
