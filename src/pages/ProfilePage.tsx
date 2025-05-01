import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
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
