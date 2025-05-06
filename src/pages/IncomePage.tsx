import { useState, useEffect } from "react"
import LayoutShell from "../layouts/LayoutShell"
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

interface IncomeEntry {
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

const IncomePage = () => {
  const { user } = useAuth()
  const [incomes, setIncomes] = useState<IncomeEntry[]>([])
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [form, setForm] = useState({ wallet: "", description: "", amount: "", currency: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"))
    const unsubIncomes = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IncomeEntry[]
      setIncomes(data)
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
      unsubIncomes()
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
        const docRef = await addDoc(collection(db, "users", user.uid, "incomes"), {
          ...form,
          amount: parsedAmount,
          createdAt: serverTimestamp(),
        })

        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(parsedAmount)
        })
      } else {
        const old = incomes.find(i => i.id === editingId)
        if (!old) return

        await updateDoc(doc(db, "users", user.uid, "incomes", editingId), {
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

        const diff = parsedAmount - old.amount
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(diff)
        })
      }

      setForm({ wallet: "", description: "", amount: "", currency: "" })
      setEditingId(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error("Gagal menyimpan pemasukan:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: IncomeEntry) => {
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
    await deleteDoc(doc(db, "users", user.uid, "incomes", id))
    await updateDoc(doc(db, "users", user.uid, "wallets", wallet), {
      balance: increment(-amount)
    })
  }

  return (
    <LayoutShell>
      <main className="2xl:px-20 max-w-screen-2xl md:ml-64 md:px-8 min-h-screen mx-auto pt-4 px-4 sm:px-6 w-full xl:px-12">
        <h1 className="dark:text-white font-bold mb-6 text-2xl">{editingId ? "Edit Pemasukan" : "Tambah Pemasukan"}</h1>

        {success && (
          <div className="bg-green-100 border border-green-300 dark:bg-gray-900 dark:text-white mb-4 p-3 rounded-lg text-green-700">
            ✅ {editingId ? "Pemasukan berhasil diperbarui!" : "Pemasukan berhasil disimpan!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 max-w-xl mb-6 p-6 rounded-xl shadow w-full">
          <div className="mb-4">
            <label className="block dark:text-white font-medium mb-1 text-sm">Pilih Dompet</label>
            <select
              name="wallet"
              value={form.wallet}
              onChange={handleWalletChange}
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.wallet && "border-red-500"}`}
            >
              <option value="">-- Pilih Dompet --</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            {errors.wallet && <p className="dark:text-white mt-1 text-red-500 text-sm">{errors.wallet}</p>}
          </div>

          <div className="mb-4">
            <label className="block dark:text-white font-medium mb-1 text-sm">Deskripsi</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              type="text"
              placeholder="Tulis deskripsi"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.description && "border-red-500"}`}
            />
            {errors.description && <p className="dark:text-white mt-1 text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div className="mb-4">
            <label className="block dark:text-white font-medium mb-1 text-sm">Nominal</label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.amount && "border-red-500"}`}
            />
            {errors.amount && <p className="dark:text-white mt-1 text-red-500 text-sm">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <label className="block dark:text-white font-medium mb-1 text-sm">Mata Uang</label>
            <input
              type="text"
              value={form.currency}
              disabled
              className="bg-gray-200 border dark:bg-gray-900 dark:text-white px-4 py-2 rounded-lg text-gray-700 w-full"
            />
            {errors.currency && <p className="dark:text-white mt-1 text-red-500 text-sm">{errors.currency}</p>}
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
              className="bg-blue-600 dark:bg-gray-900 disabled:opacity-50 hover:bg-blue-700 px-6 py-2 rounded-lg text-white"
            >
              {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="dark:text-white font-semibold mb-4 text-xl">Transaksi Terbaru</h2>
          {incomes.length === 0 ? (
            <p className="dark:text-white text-gray-500">Belum ada data pemasukan.</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="bg-white border dark:bg-gray-900 min-w-full rounded-xl shadow">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-900 dark:text-white text-left text-sm">
                    <th className="border-b px-4 py-2">Dompet</th>
                    <th className="border-b px-4 py-2">Deskripsi</th>
                    <th className="border-b px-4 py-2">Nominal</th>
                    <th className="border-b px-4 py-2">Mata Uang</th>
                    <th className="border-b px-4 py-2">Tanggal</th>
                    <th className="border-b px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map((entry) => (
                    <tr key={entry.id} className="dark:text-white text-sm">
                      <td className="border-b px-4 py-2">{wallets.find(w => w.id === entry.wallet)?.name || entry.wallet}</td>
                      <td className="border-b px-4 py-2">{entry.description}</td>
                      <td className="border-b px-4 py-2">{entry.amount.toLocaleString()}</td>
                      <td className="border-b px-4 py-2">{entry.currency}</td>
                      <td className="border-b px-4 py-2">
                        {entry.createdAt?.toDate
                          ? new Date(entry.createdAt.toDate()).toLocaleString()
                          : "-"}
                      </td>
                      <td className="border-b px-4 py-2 space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="dark:text-white hover:underline text-blue-600 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id!, entry.amount, entry.wallet)}
                          className="dark:text-white hover:underline text-red-600 text-xs"
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

export default IncomePage
