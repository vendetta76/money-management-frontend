import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
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
    <div className="bg-white dark:bg-gray-900 flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleResetPassword}
        className="bg-gray-50 dark:bg-gray-900 max-w-md p-6 rounded-lg shadow-md space-y-4 w-full"
      >
        <h2 className="dark:text-white font-bold text-center text-xl">Reset Password</h2>

        {error && <div className="dark:text-white text-red-500 text-sm">{error}</div>}
        {success && <div className="dark:text-white text-green-600 text-sm">{success}</div>}

        <input
          type="password"
          placeholder="Password Baru"
          className="border px-4 py-2 rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-purple-600 dark:bg-gray-900 font-semibold hover:bg-purple-700 py-2 rounded text-white w-full"
          disabled={loading}
        >
          {loading ? 'Mengubah...' : 'Ubah Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPassword
