// /src/pages/settings/ProfilePage.tsx
import React, { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebaseClient'
import { useAuth } from '../../context/AuthContext'

const ProfilePage = () => {
  const { user } = useAuth()
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!user?.uid) throw new Error("User belum login")

      await updateDoc(doc(db, "users", user.uid), {
        name,
      })

      alert("✅ Profil berhasil diperbarui!")
    } catch (err) {
      console.error(err)
      alert("❌ Gagal menyimpan profil.")
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto sticky top-0">
      <h1 className="text-2xl font-bold mb-4">👤 Profil Saya</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-600"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Simpan Perubahan
        </button>
      </form>
    </div>
  )
}

export default ProfilePage