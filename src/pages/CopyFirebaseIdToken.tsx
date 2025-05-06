
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
    <div className="max-w-xl mx-auto p-6">
      <h2 className="font-bold mb-4 text-xl">📋 Salin Firebase ID Token</h2>
      <button
        onClick={handleCopy}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white"
      >
        Copy Token
      </button>
      <p className="dark:text-white mt-4 text-gray-600 text-sm">{status}</p>
      {token && (
        <textarea
          value={token}
          readOnly
          rows={6}
          className="bg-gray-100 border dark:border-gray-700 mt-4 p-2 rounded text-xs w-full"
        />
      )}
    </div>
  )
}

export default CopyFirebaseIdToken
