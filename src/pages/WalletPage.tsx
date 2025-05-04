import { useEffect, useState } from "react"
import { db } from "../lib/firebaseClient"
import { useAuth } from "../context/AuthContext"
import LayoutWithSidebar from "../layouts/LayoutWithSidebar"
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
import { Settings, Plus, X, Trash2 } from "lucide-react"

interface WalletEntry {
  id?: string
  name: string
  balance: number
  currency: string
  createdAt?: any
}

const WalletPage = () => {
  const { user, userMeta } = useAuth()
  const [form, setForm] = useState({ name: "", balance: "", currency: "USD" })
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = "Wallet name is required"
    if (!form.balance.trim() || parseFloat(form.balance) < 0) newErrors.balance = "Balance must be ≥ 0"
    if (!form.currency) newErrors.currency = "Currency is required"
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
      alert(`Limit reached. ${userMeta?.role === "premium" ? "Premium" : "Regular"} users can create up to ${maxWallets} wallets.`)
      return
    }

    try {
      const payload = {
        name: form.name,
        balance: parseFloat(form.balance),
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
        setSuccess("Wallet added successfully!")
      } else {
        await updateDoc(docRef!, payload)
        setSuccess("Wallet updated successfully!")
      }

      setForm({ name: "", balance: "", currency: "USD" })
      setEditingId(null)
      setShowForm(false)
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      console.error("Error saving wallet:", err)
    }
  }

  const handleEdit = (wallet: WalletEntry) => {
    setForm({
      name: wallet.name,
      balance: wallet.balance.toString(),
      currency: wallet.currency || "USD",
    })
    setEditingId(wallet.id!)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this wallet?")
    if (!confirm) return
    try {
      await deleteDoc(doc(db, "users", user!.uid, "wallets", id))
    } catch (err) {
      console.error("Error deleting wallet:", err)
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Wallet Management</h1>
          {!editingId && (
            <button
              onClick={() => {
                setForm({ name: "", balance: "", currency: "USD" })
                setShowForm(true)
              }}
              className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              <Plus size={16} /> Add Wallet
            </button>
          )}
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
            ✅ {success}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-xl p-6 w-full max-w-sm relative">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-semibold mb-4">{editingId ? "Edit Wallet" : "Add Wallet"}</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Wallet Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Main Wallet"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${
                    errors.name && "border-red-500"
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Initial Balance</label>
                <input
                  type="number"
                  name="balance"
                  value={form.balance}
                  onChange={handleChange}
                  placeholder="e.g., 1000"
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${
                    errors.balance && "border-red-500"
                  }`}
                />
                {errors.balance && <p className="text-red-500 text-sm mt-1">{errors.balance}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${
                    errors.currency && "border-red-500"
                  }`}
                >
                  <option value="">-- Select Currency --</option>
                  <option value="USD">USD</option>
                  <option value="IDR">IDR</option>
                  <option value="EUR">EUR</option>
                  <option value="JPY">JPY</option>
                </select>
                {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingId ? "Update Wallet" : "Add Wallet"}
                </button>
              </div>
            </form>
          </div>
        )}

        <h2 className="text-lg font-semibold mb-4">Your Wallets</h2>
        {wallets.length === 0 ? (
          <p className="text-gray-500">No wallets found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-2xl shadow flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">{wallet.name}</h3>
                  <div className="flex gap-2 items-center">
                    <Trash2
                      className="w-5 h-5 opacity-80 hover:opacity-100 cursor-pointer"
                      onClick={() => handleDelete(wallet.id!)}
                    />
                    <Settings
                      className="w-5 h-5 opacity-80 hover:opacity-100 cursor-pointer"
                      onClick={() => handleEdit(wallet)}
                    />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: wallet.currency || 'IDR',
                    maximumFractionDigits: 0
                  }).format(wallet.balance)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LayoutWithSidebar>
  )
}

export default WalletPage
