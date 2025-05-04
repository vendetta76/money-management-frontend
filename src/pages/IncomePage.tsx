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
  description: string
  amount: number
  category: string
  createdAt?: any
}

const IncomePage = () => {
  const { user } = useAuth()
  const [incomes, setIncomes] = useState<IncomeEntry[]>([])
  const [form, setForm] = useState({ description: "", amount: "", category: "" })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.description.trim()) newErrors.description = "Description required"
    if (!form.category.trim()) newErrors.category = "Category required"
    if (!form.amount.trim() || parseFloat(form.amount) <= 0) newErrors.amount = "Amount must be greater than 0"
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

      setForm({ description: "", amount: "", category: "" })
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
            <label className="block mb-1 text-sm font-medium">Income Description</label>
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
            <label className="block mb-1 text-sm font-medium">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              type="text"
              placeholder="e.g., Project, Salary"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${
                errors.category && "border-red-500"
              }`}
            />
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
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

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Income"}
          </button>
        </form>
      </div>
    </LayoutWithSidebar>
  )
}

export default IncomePage
