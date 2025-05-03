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
  category: string
  editedAt: any
}

interface HistoryEntry {
  id?: string
  type: "income" | "outcome"
  description: string
  amount: number
  category: string
  createdAt?: any
  editHistory?: EditEntry[]
}

const HistoryPage = () => {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ description: "", amount: 0, category: "" })
  const [openCollapseId, setOpenCollapseId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"))
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"))

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

    return () => {
      unsubIn()
      unsubOut()
    }
  }, [user])

  const filtered = history.filter((item) => {
    const matchSearch = item.description.toLowerCase().includes(search.toLowerCase())
    const matchDate = selectedDate
      ? new Date(item.createdAt?.toDate?.() ?? item.createdAt).toISOString().split("T")[0] === selectedDate
      : true
    return matchSearch && matchDate
  })

  return (
    <LayoutWithSidebar>
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-4">📜 Riwayat Transaksi</h1>

        {/* Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
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

        {/* Table */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-300">Tidak ada transaksi ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm bg-white dark:bg-gray-800 rounded shadow">
              <thead>
                <tr className="text-left text-gray-500 border-b dark:border-gray-600">
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Jumlah</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="border-t dark:border-gray-700">
                    <td className="py-2 px-4 font-semibold">
                      {item.type === "income" ? "📥 Income" : "📤 Outcome"}
                    </td>
                    <td className="py-2 px-4">
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
                    <td className="py-2 px-4">
                      {editingId === item.id ? (
                        <input
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="border px-2 py-1 rounded text-sm w-full dark:bg-gray-800 dark:text-white"
                        />
                      ) : (
                        item.category
                      )}
                    </td>
                    <td className="py-2 px-4">
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
                    <td className="py-2 px-4">
                      {new Date(item.createdAt?.toDate?.() ?? item.createdAt).toLocaleDateString("id-ID")}
                      {item.editHistory && item.editHistory.length > 0 && (
                        <button
                          onClick={() =>
                            setOpenCollapseId((prev) => (prev === item.id ? null : item.id!))
                          }
                          className="ml-2 text-xs text-blue-500 hover:underline"
                        >
                          (edited)
                        </button>
                      )}
                    </td>
                    <td className="py-2 px-4 space-x-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={async () => {
                              if (!user) return
                              const docRef = doc(db, "users", user.uid, item.type + "s", item.id!)
                              await updateDoc(docRef, {
                                description: editForm.description,
                                category: editForm.category,
                                amount: editForm.amount,
                                editHistory: arrayUnion({
                                  description: item.description,
                                  category: item.category,
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
                                category: item.category,
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

            {/* Collapse Section */}
            {filtered.map(
              (item) =>
                openCollapseId === item.id &&
                item.editHistory && (
                  <div
                    key={`edit-${item.id}`}
                    className="bg-gray-50 dark:bg-gray-900 text-xs p-4 border-t border-purple-200 dark:border-purple-800"
                  >
                    <p className="font-semibold mb-2 text-purple-700 dark:text-purple-300">
                      Histori Edit:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-300">
                      {item.editHistory.map((edit, idx) => (
                        <li key={idx}>
                          <span className="font-medium">
                            {new Date(edit.editedAt?.toDate?.() ?? edit.editedAt).toLocaleString("id-ID")}:
                          </span>{" "}
                          <span>{edit.description}</span> - {edit.category} - Rp{" "}
                          {edit.amount.toLocaleString("id-ID")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </LayoutWithSidebar>
  )
}

export default HistoryPage
