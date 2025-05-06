import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const Register = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, 'profiles', user.uid), {
        full_name: fullName,
        created_at: new Date(),
      })

      setSuccess('Berhasil daftar! Silakan login.')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err: any) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <div className="dark:text-white dark:bg-gray-900 p-4 max-w-md mx-auto">
      <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleRegister} className="dark:text-white dark:bg-gray-900 space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="dark:text-white dark:bg-gray-900 w-full px-3 py-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="dark:text-white dark:bg-gray-900 w-full px-3 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="dark:text-white dark:bg-gray-900 w-full px-3 py-2 border rounded"
          required
        />
        {error && <p className="dark:text-white dark:bg-gray-900 text-red-500 text-sm">{error}</p>}
        {success && <p className="dark:text-white dark:bg-gray-900 text-green-600 text-sm">{success}</p>}
        <button
          type="submit"
          className="dark:text-white dark:bg-gray-900 w-full bg-purple-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register
