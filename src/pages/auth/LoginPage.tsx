import { logActivity } from "../../utils/logActivity"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/profile')
    } catch (err: any) {
      setError('Login gagal: ' + err.message)
    }

    setLoading(false)
  }

  if (user) {
    navigate('/profile')
    return null
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="dark:text-white font-bold mb-4 text-2xl">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border px-3 py-2 rounded w-full"
          required
        />
        {error && <p className="dark:text-white text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 dark:bg-gray-900 py-2 rounded text-white w-full"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
