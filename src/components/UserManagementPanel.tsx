import { useEffect, useState } from "react"
import { db } from "../../firebase" // pastikan path firebase config lo bener
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore"

const UserManagementPanel = () => {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    const querySnapshot = await getDocs(collection(db, "users"))
    const usersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    setUsers(usersList)
    setLoading(false)
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    await updateDoc(doc(db, "users", id), { role: newRole })
    fetchUsers()
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "users", id))
    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        User Management
      </h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-700 dark:text-gray-300">
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-300 dark:border-gray-700">
                <td className="py-2">{user.email}</td>
                <td className="py-2">{user.role}</td>
                <td className="py-2 space-x-2">
                  <button
                    onClick={() => handleRoleChange(user.id, user.role === "Admin" ? "Regular" : "Admin")}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Ganti Role
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default UserManagementPanel
