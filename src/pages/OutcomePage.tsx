import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { db } from "../lib/firebaseClient"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore"
import LayoutWithSidebar from "../layouts/LayoutWithSidebar"

interface OutcomeEntry {
  id?: string
  description: string
  amount: number
  category: string
  createdAt?: any
}

const OutcomePage = () => {
  const { user } = useAuth()
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([])
  const [form, setForm] = useState({ description: "", amount: "", category: "" })

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "users", user.uid, "outcomes"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OutcomeEntry[]
      setOutcomes(data)
    })

    return () => unsubscribe()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    await addDoc(collection(db, "users", user.uid, "outcomes"), {
      description: form.description,
      amount: parseInt(form.amount),
      category: form.category,
      createdAt: new Date(),
    })

    setForm({ description: "", amount: "", category: "" })
  }

  return (
    <LayoutWithSidebar>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">📤 Pengeluaran</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi"
            required
            className="border px-3 py-2 rounded dark:bg-gray-900 dark:text-white"
          />
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Jumlah"
            required
            className="border px-3 py-2 rounded dark:bg-gray-900 dark:text-white"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded dark:bg-gray-900 dark:text-white"
          >
            <option value="">Pilih Kategori</option>
            <option value="Makan">Makan</option>
            <option value="Transportasi">Transportasi</option>
            <option value="Langganan">Langganan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
          <button
            type="submit"
            className="col-span-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Tambah
          </button>
        </form>

        {outcomes.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded shadow p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">Daftar Pengeluaran</h2>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300">
                <tr>
                  <th className="text-left py-2">Deskripsi</th>
                  <th className="text-left py-2">Jumlah</th>
                  <th className="text-left py-2">Kategori</th>
                  <th className="text-left py-2">Tanggal</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-200">
                {outcomes.map((out, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2">{out.description}</td>
                    <td className="py-2">Rp {out.amount.toLocaleString("id-ID")}</td>
                    <td className="py-2">{out.category}</td>
                    <td className="py-2">
                      {new Date(out.createdAt?.toDate?.() ?? out.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutWithSidebar>
  )
}

export default OutcomePage
