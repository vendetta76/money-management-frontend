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
    <div className="dark:text-white dark:bg-gray-900 p-4 max-w-md mx-auto">
      <h1 className="dark:text-white dark:bg-gray-900 text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="dark:text-white dark:bg-gray-900 space-y-4">
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
        <button
          type="submit"
          className="dark:text-white dark:bg-gray-900 w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
