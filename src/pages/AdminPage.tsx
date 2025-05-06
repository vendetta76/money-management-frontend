import { useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { format } from "date-fns"
import AdminSidebar from "../components/AdminSidebar"

const AdminPage = () => {
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [userData, setUserData] = useState<any>(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setStatus("Mencari user...")
    setLoading(true)
    try {
      const querySnapshot = await db.collection("users").get()
      const userDoc = querySnapshot.docs.find((doc) => doc.data().email === email)

      if (userDoc) {
        setUserId(userDoc.id)
        setUserData(userDoc.data())
        setStatus("User ditemukan")
      } else {
        setUserId("")
        setUserData(null)
        setStatus("User tidak ditemukan")
      }
    } catch (err) {
      console.error(err)
      setStatus("Error saat mencari user")
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    if (!userId) return
    setLoading(true)
    setStatus("Menyimpan perubahan...")

    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        role: userData.role,
        premiumStartDate: userData.premiumStartDate || null,
        premiumEndDate: userData.premiumEndDate || null,
      })
      setStatus("Berhasil disimpan!")
    } catch (err) {
      console.error(err)
      setStatus("Gagal menyimpan perubahan")
    }

    setLoading(false)
  }

  const updateField = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value })
  }

  return (
    <div className="flex">
      <AdminSidebar isOpen={true} />
      <main className=" flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4 text-purple-700">Admin Panel 👑</h1>

        <div className="mb-4">
          <label className="block font-medium mb-1">Cari User via Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow"
            placeholder="contoh@email.com"
          />
          <button
            onClick={handleSearch}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            Cari User
          </button>
        </div>

        {userData && (
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 space-y-4 border dark:border-gray-700">
            <div>
              <label className="block font-medium">Role</label>
              <select
                value={userData.role}
                onChange={(e) => updateField("role", e.target.value)}
                className="border px-3 py-2 rounded w-full"
              >
                <option value="user">User</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block font-medium">Tanggal Mulai Premium</label>
              <input
                type="date"
                value={userData.premiumStartDate || ""}
                onChange={(e) => updateField("premiumStartDate", e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block font-medium">Tanggal Akhir Premium</label>
              <input
                type="date"
                value={userData.premiumEndDate || ""}
                onChange={(e) => updateField("premiumEndDate", e.target.value)}
                className="border px-3 py-2 rounded w-full"
              />
            </div>

            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={loading}
            >
              Simpan Perubahan
            </button>
          </div>
        )}

        {status && <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{status}</p>}
      </main>
    </div>
  )
}

export default AdminPage
