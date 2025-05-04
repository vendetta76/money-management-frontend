// Final WalletPage.tsx with searchable currency dropdown

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
import { Settings, Plus, X, Eye, EyeOff } from "lucide-react"

const currencyOptions = [
  "USD", "IDR", "EUR", "JPY", "GBP", "CHF", "AUD", "CAD",
  "SGD", "CNY", "KRW", "THB", "PHP", "MYR"
]

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
  const [currencySearch, setCurrencySearch] = useState("")
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  // ... other functions unchanged ...

  // Inside the form where currency dropdown is rendered:

  <div className="mb-4">
    <label className="block text-sm font-medium mb-1">Currency</label>
    <input
      type="text"
      placeholder="Search currency..."
      value={currencySearch}
      onChange={(e) => setCurrencySearch(e.target.value.toUpperCase())}
      className="mb-2 w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
    />
    <select
      name="currency"
      value={form.currency}
      onChange={handleChange}
      className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.currency && "border-red-500"}`}
    >
      <option value="">-- Select Currency --</option>
      {currencyOptions
        .filter(cur => cur.includes(currencySearch))
        .map(cur => (
          <option key={cur} value={cur}>{cur}</option>
        ))}
    </select>
    {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
  </div>
}

export default WalletPage
