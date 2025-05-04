import { useState, useEffect } from "react"
import LayoutWithSidebar from "../layouts/LayoutWithSidebar"
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

interface IncomeEntry {
  id?: string
  wallet: string
  description: string
  amount: number
  currency: string
  createdAt?: any
}

const IncomePage = () => {
  const { user } = useAuth()
  const [incomes, setIncomes] = useState<IncomeEntry[]>([])
  const [form, setForm] = useState({ wallet: "", description: "", amount: "", currency: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "users", user.uid, "incomes"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IncomeEntry[]
      setIncomes(data)
    })

    return () => unsubscribe()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.wallet.trim()) newErrors.wallet = "Wallet is required"
    if (!form.description.trim()) newErrors.description = "Description is required"
    if (!form.amount.trim() || parseFloat(form.amount) <= 0) newErrors.amount = "Amount must be greater than 0"
    if (!form.currency.trim()) newErrors.currency = "Currency is required"
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
      await addDoc(collection(db, "users", user.uid, "incomes"), {
        ...form,
        amount: parseFloat(form.amount),
        createdAt: serverTimestamp(),
      })

      setForm({ wallet: "", description: "", amount: "", currency: "" })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error("Failed to save income:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create Income</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
            ✅ Income saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 mb-6 max-w-xl">
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Choose your wallet</label>
            <select
              name="wallet"
              value={form.wallet}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${
                errors.wallet && "border-red-500"
              }`}
            >
              <option value="">-- Select Wallet --</option>
              <option value="Main">Main Wallet</option>
              <option value="Savings">Savings</option>
              <option value="Investment">Investment</option>
            </select>
            {errors.wallet && <p className="text-red-500 text-sm mt-1">{errors.wallet}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              type="text"
              placeholder="e.g., Freelance project"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${
                errors.description && "border-red-500"
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Nominal</label>
            <div className="relative">
              <input
                name="amount"
                value={form.amount}
                onChange={handleChange}
                type="number"
                placeholder="0.00"
                className={`w-full pl-7 pr-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${
                  errors.amount && "border-red-500"
                }`}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Currency</label>
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
              <option value="EUR">THB</option>
            </select>
            {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting" : "Submit"}
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Transaction</h2>
          {incomes.length === 0 ? (
            <p className="text-gray-500">No income entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-xl shadow">
                <thead>
                  <tr className="bg-gray-100 text-sm text-left">
                    <th className="px-4 py-2 border-b">Wallet</th>
                    <th className="px-4 py-2 border-b">Description</th>
                    <th className="px-4 py-2 border-b">Nominal</th>
                    <th className="px-4 py-2 border-b">Currency</th>
                    <th className="px-4 py-2 border-b">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="text-sm">
                      <td className="px-4 py-2 border-b">{entry.wallet}</td>
                      <td className="px-4 py-2 border-b">{entry.description}</td>
                      <td className="px-4 py-2 border-b">${entry.amount.toFixed(2)}</td>
                      <td className="px-4 py-2 border-b">{entry.currency}</td>
                      <td className="px-4 py-2 border-b">
                        {entry.createdAt?.toDate
                          ? new Date(entry.createdAt.toDate()).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  )
}

export default IncomePage
