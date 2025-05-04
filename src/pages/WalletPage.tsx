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
  { value: "MYR", label: "MYR" },
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
    <LayoutWithSidebar>
      {/* ...UI tetap sama, hanya hilangkan bagian input saldo... */}
    </LayoutWithSidebar>
  )
}

export default WalletPage
