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
      <main className="2xl:px-20 max-w-screen-2xl md:ml-64 md:px-8 min-h-screen mx-auto pt-4 px-4 sm:px-6 w-full xl:px-12">
        <h1 className="dark:text-red-400 font-bold mb-6 text-2xl text-red-600">
          📤 {editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
        </h1>

        {success && (
          <div className="bg-green-100 border border-green-300 dark:border-gray-700 mb-4 p-3 rounded-lg text-green-700">
            ✅ {editingId ? "Pengeluaran berhasil diperbarui!" : "Pengeluaran berhasil disimpan!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 max-w-xl mb-6 p-6 rounded-xl shadow w-full">
          <div className="mb-4">
            <label className="block font-medium mb-1 text-sm">Pilih Dompet</label>
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
            {errors.wallet && <p className="mt-1 text-red-500 text-sm">{errors.wallet}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1 text-sm">Deskripsi</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              type="text"
              placeholder="Tulis deskripsi"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.description && "border-red-500"}`}
            />
            {errors.description && <p className="mt-1 text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1 text-sm">Nominal</label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.amount && "border-red-500"}`}
            />
            {errors.amount && <p className="mt-1 text-red-500 text-sm">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1 text-sm">Mata Uang</label>
            <input
              type="text"
              value={form.currency}
              disabled
              className="bg-gray-200 border dark:border-gray-700 dark:text-white px-4 py-2 rounded-lg text-gray-700 w-full"
            />
            {errors.currency && <p className="mt-1 text-red-500 text-sm">{errors.currency}</p>}
          </div>

          <div className="flex justify-between">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ wallet: "", description: "", amount: "", currency: "" })
                  setEditingId(null)
                }}
                className="dark:text-white hover:underline text-gray-500 text-sm"
              >
                Batal Edit
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 disabled:opacity-50 hover:bg-red-700 px-6 py-2 rounded-lg text-white"
            >
              {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="font-semibold mb-4 text-xl">Transaksi Pengeluaran</h2>
          {outcomes.length === 0 ? (
            <p className="dark:text-white text-gray-500">Belum ada data pengeluaran.</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="bg-white border dark:bg-gray-900 dark:border-gray-700 min-w-full rounded-xl shadow">
                <thead>
                  <tr className="bg-gray-100 text-left text-sm">
                    <th className="border-b dark:border-gray-700 px-4 py-2">Dompet</th>
                    <th className="border-b dark:border-gray-700 px-4 py-2">Deskripsi</th>
                    <th className="border-b dark:border-gray-700 px-4 py-2">Nominal</th>
                    <th className="border-b dark:border-gray-700 px-4 py-2">Mata Uang</th>
                    <th className="border-b dark:border-gray-700 px-4 py-2">Tanggal</th>
                    <th className="border-b dark:border-gray-700 px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {outcomes.map((entry) => (
                    <tr key={entry.id} className="text-sm">
                      <td className="border-b dark:border-gray-700 px-4 py-2">{wallets.find(w => w.id === entry.wallet)?.name || entry.wallet}</td>
                      <td className="border-b dark:border-gray-700 px-4 py-2">{entry.description}</td>
                      <td className="border-b dark:border-gray-700 px-4 py-2">{entry.amount.toLocaleString()}</td>
                      <td className="border-b dark:border-gray-700 px-4 py-2">{entry.currency}</td>
                      <td className="border-b dark:border-gray-700 px-4 py-2">
                        {entry.createdAt?.toDate
                          ? new Date(entry.createdAt.toDate()).toLocaleString()
                          : "-"}
                      </td>
                      <td className="border-b dark:border-gray-700 px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="hover:underline text-blue-600 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id!, entry.amount, entry.wallet)}
                          className="hover:underline text-red-600 text-xs"
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
