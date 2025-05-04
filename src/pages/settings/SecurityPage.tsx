// /src/pages/settings/SecurityPage.tsx
import React from 'react'

const SecurityPage = () => {
  return (
    <div className="p-6 max-w-xl mx-auto sticky top-0">
      <h1 className="text-2xl font-bold mb-4">🔐 Keamanan</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kata Sandi Baru</label>
          <input
            type="password"
            placeholder="Minimal 6 karakter"
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Konfirmasi Kata Sandi</label>
          <input
            type="password"
            placeholder="Ulangi kata sandi"
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
          />
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
          Perbarui Kata Sandi
        </button>
      </form>
    </div>
  )
}

export default SecurityPage
