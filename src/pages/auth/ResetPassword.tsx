import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = await updatePassword(authUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Password berhasil diubah. Silakan login ulang.')
      setTimeout(() => navigate('/login'), 3000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form
        onSubmit={handleResetPassword}
        className="max-w-md w-full bg-gray-50 shadow-md rounded-lg p-6 space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Reset Password</h2>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <input
          type="password"
          placeholder="Password Baru"
          className="w-full px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded"
          disabled={loading}
        >
          {loading ? 'Mengubah...' : 'Ubah Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
