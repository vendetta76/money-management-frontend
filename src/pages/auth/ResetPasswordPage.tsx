// src/pages/auth/ResetPasswordPage.tsx
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleResetPassword = async () => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center">Buat Password Baru</h2>
        <input
          type="password"
          placeholder="Password Baru"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleResetPassword}
          className="w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded"
        >
          Ganti Password
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  )
}
