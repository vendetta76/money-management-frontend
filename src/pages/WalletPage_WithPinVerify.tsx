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

  if (loading) return <div className="dark:text-white p-6 text-center">Loading...</div>
  if (!storedPin) return <WalletPageContent />

  if (!verified) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-900 dark:text-white max-w-sm md:p-6 px-4 py-6 rounded-xl shadow text-center w-full">
          <h2 className="dark:text-white font-bold mb-4 text-xl">🔒 Verifikasi PIN</h2>
          <input
            type="password"
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Masukkan PIN Akses"
            maxLength={6}
            disabled={loading}
            className="bg-gray-100 border dark:bg-gray-900 dark:text-white mb-3 px-3 py-2 rounded-lg text-center text-sm w-full"
          />
          {error && <p className="dark:text-white mb-2 text-red-600 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-600 dark:bg-gray-900 dark:text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm text-white w-full"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </button>
          <button
            onClick={() => navigate("/settings/security")}
            className="dark:text-white hover:underline mt-3 text-gray-500 text-sm"
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