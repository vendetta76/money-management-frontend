
import React, { useEffect, useState } from 'react'
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
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import LayoutShell from '../layouts/LayoutShell'
import { Plus, X, Eye, EyeOff, Settings, Lock } from 'lucide-react'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import withPinProtection from '../hoc/withPinProtection'
import { usePinLock } from '../context/PinLockContext'
import PinModal from '../components/PinModal'

interface WalletEntry {
  id?: string
  name: string
  balance: number
  currency: string
  createdAt?: any
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { locked, unlock, lock } = usePinLock()
  const [pinLockVisible, setPinLockVisible] = useState(true)
  const [enteredPin, setEnteredPin] = useState("")
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [form, setForm] = useState({ name: '', balance: '0', currency: 'USD' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  useEffect(() => {
    if (!locked) {
      setPinLockVisible(false)
    }
  }, [locked])

  const handleUnlock = () => {
    if (unlock(enteredPin)) {
      setPinLockVisible(false)
    } else {
      alert("PIN salah!")
    }
  }

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'JPY', label: 'JPY' },
    { value: 'IDR', label: 'IDR' },
    { value: 'MYR', label: 'MYR' },
    { value: 'SGD', label: 'SGD' },
    { value: 'THB', label: 'THB' },
    { value: 'KRW', label: 'KRW' },
    { value: 'CNY', label: 'CNY' },
    { value: 'AUD', label: 'AUD' },
    { value: 'CAD', label: 'CAD' },
    { value: 'CHF', label: 'CHF' },
    { value: 'GBP', label: 'GBP' },
    { value: 'PHP', label: 'PHP' },
    { value: 'VND', label: 'VND' },
    { value: 'INR', label: 'INR' },
    { value: 'HKD', label: 'HKD' },
    { value: 'NZD', label: 'NZD' }
  ]

  const totalsByCurrency = wallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'users', user.uid, 'wallets'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
    })
  }, [user])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nama wajib diisi'
    if (!form.currency) e.currency = 'Pilih mata uang'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      return
    }
    try {
      const payload = {
        name: form.name,
        balance: 0,
        currency: form.currency,
        createdAt: serverTimestamp(),
      }
      if (!editingId) {
        await addDoc(collection(db, 'users', user!.uid, 'wallets'), payload)
        setSuccess('Wallet ditambahkan')
      } else {
        await updateDoc(doc(db, 'users', user!.uid, 'wallets', editingId), payload)
        setSuccess('Wallet diperbarui')
      }
      setForm({ name: '', balance: '0', currency: 'USD' })
      setEditingId(null)
      setShowForm(false)
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (w: WalletEntry) => {
    setForm({ name: w.name, balance: '0', currency: w.currency })
    setEditingId(w.id!)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!editingId) return
    if (!window.confirm('Yakin hapus wallet ini?')) return
    await deleteDoc(doc(db, 'users', user!.uid, 'wallets', editingId))
    setEditingId(null)
    setShowForm(false)
  }

  return (
    <LayoutShell>
      <main className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
        {/* ... semua UI saldo & wallet tetap ... */}
      </main>

      <PinModal
        visible={pinLockVisible}
        enteredPin={enteredPin}
        setEnteredPin={setEnteredPin}
        onUnlock={handleUnlock}
      />

      <button
        onClick={() => setPinLockVisible(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-40"
        title="Kunci Dompet"
      >
        <Lock />
      </button>
    </LayoutShell>
  )
}

export default withPinProtection(WalletPage)
