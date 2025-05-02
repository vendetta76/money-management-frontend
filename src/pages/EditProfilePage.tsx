import { doc, updateDoc } from "firebase/firestore"
import { db } from "../lib/firebaseClient"
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const EditProfilePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.displayName || '')

  const handleUpdate = async () => {
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { fullName: name })
      navigate('/profile')
    } catch (err) {
      console.error("Gagal update profil:", err)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <input
        className="border px-3 py-2 rounded w-full mb-4"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleUpdate}
      >
        Save
      </button>
    </div>
  )
}

export default EditProfilePage
