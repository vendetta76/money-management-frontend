import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="p-4">
      <h1 className="dark:text-white font-bold mb-4 text-2xl">Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <button
        className="bg-red-500 dark:bg-gray-900 mt-4 px-4 py-2 rounded text-white"
        onClick={async () => {
          await signOut()
          navigate('/login')
        }}
      >
        Logout
      </button>
    </div>
  )
}

export default ProfilePage
