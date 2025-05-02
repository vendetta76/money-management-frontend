import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <input
          type="email"
          placeholder="Masukkan email kamu"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleReset}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
        >
          Kirim Link Reset
        </button>

        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  )
}
