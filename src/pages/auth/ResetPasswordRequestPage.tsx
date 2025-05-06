import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
// src/pages/auth/ResetPasswordRequestPage.tsx
import { useState } from 'react'

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleReset = async () => {
    const { error } = await firebase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setError(error.message)
    else setMessage('Link reset password telah dikirim ke email kamu.')
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white dark:bg-gray-900 max-w-md p-6 rounded shadow space-y-6 w-full">
        <h2 className="font-bold text-2xl text-center">Reset Password</h2>
        <input
          type="email"
          placeholder="Masukkan email kamu"
          className="border dark:border-gray-700 p-2 rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleReset}
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-white w-full"
        >
          Kirim Link Reset
        </button>

        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  )
}
