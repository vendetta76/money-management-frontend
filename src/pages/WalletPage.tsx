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
} from "firebase/firestore"

interface WalletEntry {
  id?: string
  name: string
  balance: number
  createdAt?: any
}

const WalletPage = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: "", balance: "" })
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")

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
    if (!form.name.trim()) newErrors.name = "Wallet name is required"
    if (!form.balance.trim() || parseFloat(form.balance) < 0) newErrors.balance = "Balance must be ≥ 0"
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    try {
      const payload = {
        name: form.name,
        balance: parseFloat(form.balance),
        createdAt: serverTimestamp(),
      }

      if (editingId) {
        const docRef = doc(db, "users", user!.uid, "wallets", editingId)
        await updateDoc(docRef, payload)
        setSuccess("Wallet updated successfully!")
      } else {
        await addDoc(collection(db, "users", user!.uid, "wallets"), payload)
        setSuccess("Wallet added successfully!")
      }

      setForm({ name: "", balance: "" })
      setEditingId(null)
      setTimeout(() => setSuccess(""), 2000)
    } catch (err) {
      console.error("Error saving wallet:", err)
    }
  }

  const handleEdit = (wallet: WalletEntry) => {
    setForm({ name: wallet.name, balance: wallet.balance.toString() })
    setEditingId(wallet.id!)
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
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Wallet Management</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 mb-6">
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

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {editingId ? "Update Wallet" : "Add Wallet"}
          </button>
        </form>

        <h2 className="text-lg font-semibold mb-2">Your Wallets</h2>
        {wallets.length === 0 ? (
          <p className="text-gray-500">No wallets found.</p>
        ) : (
          <ul className="space-y-3">
            {wallets.map((wallet) => (
              <li
                key={wallet.id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{wallet.name}</p>
                  <p className="text-sm text-gray-500">
                    Balance: ${wallet.balance.toFixed(2)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(wallet)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wallet.id!)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </LayoutWithSidebar>
  )
}

export default WalletPage
