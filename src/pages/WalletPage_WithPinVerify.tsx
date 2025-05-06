import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebaseClient"
import WalletPageContent from "./WalletPage"
import { useNavigate } from "react-router-dom"

const WalletPageWithPinVerify = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [verified, setVerified] = useState(false)
  const [enteredPin, setEnteredPin] = useState("")
  const [storedPin, setStoredPin] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPin = async () => {
      if (!user?.uid) return
      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists()) {
        const data = snap.data()
        setStoredPin(data.accessPin || "")
      }
      setLoading(false)
    }
    fetchPin()
  }, [user])

  useEffect(() => {
    const verifiedAt = Number(sessionStorage.getItem("walletPinVerifiedAt"))
    const now = Date.now()
    const maxSession = 5 * 60 * 1000 // 5 menit

    if (verifiedAt && now - verifiedAt < maxSession) {
      setVerified(true)
    }
  }, [])

  const handleSubmit = () => {
    if (enteredPin === storedPin) {
      sessionStorage.setItem("walletPinVerifiedAt", Date.now().toString())
      setVerified(true)
    } else {
      setError("PIN salah. Coba lagi.")
    }
  }

  if (loading) return <div className="dark:text-white dark:bg-gray-900 p-6 text-center">Loading...</div>
  if (!storedPin) return <WalletPageContent />

  if (!verified) {
    return (
      <div className="dark:text-white dark:bg-gray-900 min-h-screen flex items-center justify-center bg-gray-100">
        <div className="dark:text-white dark:bg-gray-900 w-full max-w-sm px-4 py-6 md:p-6 rounded-xl shadow bg-white dark:bg-gray-900 text-center">
          <h2 className="dark:text-white dark:bg-gray-900 text-xl font-bold mb-4">🔒 Verifikasi PIN</h2>
          <input
            type="password"
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Masukkan PIN Akses"
            maxLength={6}
            disabled={loading}
            className="dark:text-white dark:bg-gray-900 w-full px-3 py-2 border rounded-lg bg-gray-100 mb-3 text-center text-sm"
          />
          {error && <p className="dark:text-white dark:bg-gray-900 text-red-600 text-sm mb-2">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="dark:text-white dark:bg-gray-900 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </button>
          <button
            onClick={() => navigate("/settings/security")}
            className="dark:text-white dark:bg-gray-900 mt-3 text-sm text-gray-500 dark:text-gray-300 hover:underline"
          >
            Lupa PIN?
          </button>
        </div>
      </div>
    )
  }

  return <WalletPageContent />
}

export default WalletPageWithPinVerify