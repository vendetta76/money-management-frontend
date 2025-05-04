// /src/pages/settings/ProfilePage.tsx
import React from 'react'

const ProfilePage = () => {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👤 Profil Saya</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            disabled
            value="user@example.com"
            className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-600"
          />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Simpan Perubahan
        </button>
      </form>
    </div>
  )
}

export default ProfilePage
