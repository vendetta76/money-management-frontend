// Final compact HistoryPage.tsx tanpa kolom kategori
import { useState, useEffect } from "react"
import LayoutWithSidebar from "../layouts/LayoutWithSidebar"
import { useAuth } from "../context/AuthContext"
import { db } from "../lib/firebaseClient"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion
} from "firebase/firestore"

interface EditEntry {
  description: string
  amount: number
  editedAt: any
}

interface HistoryEntry {
  id?: string
  type: "income" | "outcome"
  wallet: string
  currency: string
  description: string
  amount: number
  createdAt?: any
  editHistory?: EditEntry[]
}

interface WalletEntry {
  id?: string
  name: string
  currency: string
}

const HistoryPage = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [wallets, setWallets] = useState<WalletEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ description: "", amount: 0 })

  useEffect(() => {
    if (!user) return

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"))
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"))
    const walletQuery = collection(db, "users", user.uid, "wallets")

    const unsubIn = onSnapshot(incomeQuery, (snapshot) => {
      const incomes = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "income",
        ...doc.data(),
      })) as HistoryEntry[]

      setHistory((prev) => {
        const others = prev.filter((item) => item.type !== "income")
        return [...incomes, ...others].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      })
    })

    const unsubOut = onSnapshot(outcomeQuery, (snapshot) => {
      const outcomes = snapshot.docs.map((doc) => ({
        id: doc.id,
        type: "outcome",
        ...doc.data(),
      })) as HistoryEntry[]

      setHistory((prev) => {
        const others = prev.filter((item) => item.type !== "outcome")
        return [...others, ...outcomes].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      })
    })

    const unsubWallet = onSnapshot(walletQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletEntry[]
      setWallets(data)
    })

    return () => {
      unsubIn()
      unsubOut()
      unsubWallet()
    }
  }, [user])

  const filtered = history.filter((item) => {
    const matchSearch = item.description.toLowerCase().includes(search.toLowerCase())
    const matchDate = selectedDate
      ? new Date(item.createdAt?.toDate?.() ?? item.createdAt).toISOString().split("T")[0] === selectedDate
      : true
    return matchSearch && matchDate
  })

  const getWalletName = (walletId: string) => {
    return wallets.find((w) => w.id === walletId)?.name || walletId
  }

  const getWalletCurrency = (walletId: string) => {
    return wallets.find((w) => w.id === walletId)?.currency || ""
  }

  return (
    <LayoutWithSidebar>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-4">📜 Riwayat Transaksi</h1>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Cari deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-1/3 dark:bg-gray-800 dark:text-white"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-300">Tidak ada transaksi ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr className="text-left text-gray-500 border-b dark:border-gray-600">
                  <th className="py-2 px-3">Tipe</th>
                  <th className="py-2 px-3">Dompet</th>
                  <th className="py-2 px-3">Mata Uang</th>
                  <th className="py-2 px-3">Deskripsi</th>
                  <th className="py-2 px-3">Jumlah</th>
                  <th className="py-2 px-3">Tanggal</th>
                  <th className="py-2 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t dark:border-gray-700">
                    <td className="py-1.5 px-3 font-semibold">
                      {item.type === "income" ? "📥 Income" : "📤 Outcome"}
                    </td>
                    <td className="py-1.5 px-3">{getWalletName(item.wallet)}</td>
                    <td className="py-1.5 px-3">{getWalletCurrency(item.wallet)}</td>
                    <td className="py-1.5 px-3">
                      {editingId === item.id ? (
                        <input
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="border px-2 py-1 rounded text-sm w-full dark:bg-gray-800 dark:text-white"
                        />
                      ) : (
                        item.description
                      )}
                    </td>
                    <td className="py-1.5 px-3">
                      {editingId === item.id ? (
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: parseInt(e.target.value) })}
                          className="border px-2 py-1 rounded text-sm w-full dark:bg-gray-800 dark:text-white"
                        />
                      ) : (
                        `${item.type === "income" ? "+" : "-"} Rp ${item.amount.toLocaleString("id-ID")}`
                      )}
                    </td>
                    <td className="py-1.5 px-3">
                      {new Date(item.createdAt?.toDate?.() ?? item.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-1.5 px-3 space-x-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={async () => {
                              if (!user) return
                              const docRef = doc(db, "users", user.uid, item.type + "s", item.id!)
                              await updateDoc(docRef, {
                                description: editForm.description,
                                amount: editForm.amount,
                                editHistory: arrayUnion({
                                  description: item.description,
                                  amount: item.amount,
                                  editedAt: new Date(),
                                }),
                              })
                              setEditingId(null)
                            }}
                            className="text-green-600 text-sm hover:underline"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 text-sm hover:underline"
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditForm({
                                description: item.description,
                                amount: item.amount,
                              })
                              setEditingId(item.id!)
                            }}
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!user) return
                              await deleteDoc(doc(db, "users", user.uid, item.type + "s", item.id!))
                            }}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Hapus
                          </button>
                        </>
                      )}
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

export default HistoryPage