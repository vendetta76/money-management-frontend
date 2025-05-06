
import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth"

const CopyFirebaseIdToken = () => {
  const [token, setToken] = useState("")
  const [status, setStatus] = useState("")

  const handleCopy = async () => {
    const user = getAuth().currentUser
    if (!user) {
      setStatus("❌ User belum login.")
      return
    }

    try {
      const idToken = await user.getIdToken()
      await navigator.clipboard.writeText(idToken)
      setToken(idToken)
      setStatus("✅ Token berhasil disalin ke clipboard!")
    } catch (err: any) {
      setStatus("❌ Gagal mengambil token: " + err.message)
    }
  }

  return (
    <div className="dark:text-white dark:bg-gray-900 p-6 max-w-xl mx-auto">
      <h2 className="dark:text-white dark:bg-gray-900 text-xl font-bold mb-4">📋 Salin Firebase ID Token</h2>
      <button
        onClick={handleCopy}
        className="dark:text-white dark:bg-gray-900 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Copy Token
      </button>
      <p className="dark:text-white dark:bg-gray-900 mt-4 text-sm text-gray-600 dark:text-gray-300">{status}</p>
      {token && (
        <textarea
          value={token}
          readOnly
          rows={6}
          className="dark:text-white dark:bg-gray-900 mt-4 w-full text-xs p-2 border rounded bg-gray-100"
        />
      )}
    </div>
  )
}

export default CopyFirebaseIdToken
