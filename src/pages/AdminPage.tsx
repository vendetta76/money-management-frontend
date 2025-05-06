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
      <main className="flex-1 md:ml-64 p-6">
        <h1 className="font-bold mb-4 text-2xl text-purple-700">Admin Panel 👑</h1>

        <div className="mb-4">
          <label className="block font-medium mb-1">Cari User via Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border dark:border-gray-700 px-3 py-2 rounded shadow w-full"
            placeholder="contoh@email.com"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 mt-2 px-4 py-2 rounded text-white"
            disabled={loading}
          >
            Cari User
          </button>
        </div>

        {userData && (
          <div className="bg-white border dark:bg-gray-800 dark:bg-gray-900 dark:border-gray-700 p-4 rounded shadow space-y-4">
            <div>
              <label className="block font-medium">Role</label>
              <select
                value={userData.role}
                onChange={(e) => updateField("role", e.target.value)}
                className="border dark:border-gray-700 px-3 py-2 rounded w-full"
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
                className="border dark:border-gray-700 px-3 py-2 rounded w-full"
              />
            </div>

            <div>
              <label className="block font-medium">Tanggal Akhir Premium</label>
              <input
                type="date"
                value={userData.premiumEndDate || ""}
                onChange={(e) => updateField("premiumEndDate", e.target.value)}
                className="border dark:border-gray-700 px-3 py-2 rounded w-full"
              />
            </div>

            <button
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
              disabled={loading}
            >
              Simpan Perubahan
            </button>
          </div>
        )}

        {status && <p className="dark:text-gray-300 dark:text-white mt-4 text-gray-600 text-sm">{status}</p>}
      </main>
    </div>
  )
}

export default AdminPage
