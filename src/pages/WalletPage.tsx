// src/pages/WalletPage.tsx
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

interface WalletEntry {
  id?: string
  name: string
  balance: number
  currency: string
  createdAt?: any
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

const WalletPage: React.FC = () => {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [form, setForm] = useState({ name: '', balance: '0', currency: 'USD' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  const totalsByCurrency = wallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'users', user.uid, 'wallets'),
      orderBy('createdAt', 'desc')
    )
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
        await updateDoc(
          doc(db, 'users', user!.uid, 'wallets', editingId),
          payload
        )
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
        {/* Total Saldo */}
        <div className="mb-6">
  <h2 className="text-xl font-bold mb-4">💰 Total Saldo per Mata Uang</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Object.entries(totalsByCurrency).map(([currency, total]) => (
      <div
        key={currency}
        className="bg-white shadow-md rounded-lg p-4 border-t-4 border-indigo-500 hover:shadow-lg transition"
      >
        <div className="text-sm text-gray-500 font-medium mb-1">{currency}</div>
        <div className="text-xl font-bold text-gray-900 tracking-tight">
          {showBalance
            ? new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency,
                maximumFractionDigits: 0,
              }).format(total)
            : '••••••'}
        </div>
      </div>
    ))}
  </div>
</div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Daftar Wallet</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-sm flex items-center gap-1"
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              {showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('walletPinVerifiedAt')
                window.location.href = '/wallet'
              }}
              className="text-sm flex items-center gap-1 text-red-500 hover:text-red-600"
            >
              <Lock size={16} />
              Kunci
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Plus size={16} /> Tambah Wallet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-xl flex flex-col justify-between"
            >
              <div className="flex justify-between">
                <h3>{w.name}</h3>
                <Settings
                  onClick={() => handleEdit(w)}
                  className="cursor-pointer"
                />
              </div>
              <div className="text-2xl font-bold">
                {showBalance
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: w.currency,
                      maximumFractionDigits: 0,
                    }).format(w.balance)
                  : '••••••'}
              </div>
            </div>
          ))}
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            {success}
          </div>
        )}

        {/* Form Tambah/Edit */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-xl max-w-sm w-full relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                }}
                className="absolute top-3 right-3"
              >
                <X size={20} />
              </button>
              <h3 className="mb-4 font-semibold">
                {editingId ? 'Edit Wallet' : 'Tambah Wallet'}
              </h3>
              <div className="mb-3">
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Nama Wallet"
                  className="w-full px-4 py-2 border rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              <div className="mb-4">
                <Select
                  options={currencyOptions}
                  value={currencyOptions.find(
                    (o) => o.value === form.currency
                  )}
                  onChange={(sel) =>
                    setForm({
                      ...form,
                      currency: sel?.value || '',
                    })
                  }
                  placeholder="Pilih mata uang"
                />
                {errors.currency && (
                  <p className="text-red-500 text-sm">
                    {errors.currency}
                  </p>
                )}
              </div>
              <div className="flex justify-between items-center">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    Hapus Wallet
                  </button>
                )}
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </LayoutShell>
  )
}

export default WalletPage
