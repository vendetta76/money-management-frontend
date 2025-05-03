import { useState } from "react"
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth"
import { auth } from "../../firebase"

const ResetPasswordPanel = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleReset = async () => {
    setMessage("")
    setError("")

    const user = auth.currentUser
    if (!user || !user.email) {
      setError("Tidak ada pengguna yang login.")
      return
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, newPassword)
      setMessage("Password berhasil diperbarui.")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Reset Password Admin
      </h2>
      {message && <p className="text-green-600 mb-2">{message}</p>}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="mb-4">
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Password Saat Ini
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
          Password Baru
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
        />
      </div>
      <button
        onClick={handleReset}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Reset Password
      </button>
    </div>
  )
}

export default ResetPasswordPanel
