
import React, { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../lib/firebaseClient"
import { useAuth } from "../../context/AuthContext"
import LayoutWithSidebar from "../../layouts/LayoutWithSidebar"

const SecurityPage = () => {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [currentPin, setCurrentPin] = useState("")
  const [storedPin, setStoredPin] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.email) setEmail(user.email)
    if (!user?.uid) return

    const loadPin = async () => {
      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists()) {
        const data = snap.data()
        setStoredPin(data.accessPin || "")
      }
    }

    loadPin()
  }, [user])

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (storedPin && currentPin !== storedPin) {
      setError("PIN lama salah.")
      return
    }

    if (pin.length < 4 || pin.length > 6) {
      setError("PIN baru harus 4–6 digit.")
      return
    }

    if (pin !== confirmPin) {
      setError("Konfirmasi PIN tidak cocok.")
      return
    }

    try {
      if (!user?.uid) throw new Error("User tidak ditemukan.")
      setLoading(true)
      await updateDoc(doc(db, "users", user.uid), { accessPin: pin })
      setSuccess("✅ PIN berhasil diperbarui!")
      setPin("")
      setConfirmPin("")
      setCurrentPin("")
    } catch (err) {
      console.error(err)
      setError("❌ Gagal menyimpan PIN.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPin = async () => {
    if (!window.confirm("Apakah kamu yakin ingin menghapus PIN?")) return
    try {
      await updateDoc(doc(db, "users", user!.uid), { accessPin: "" })
      setStoredPin("")
      setSuccess("✅ PIN berhasil dihapus.")
    } catch (err) {
      console.error(err)
      setError("❌ Gagal menghapus PIN.")
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🔐 Keamanan</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            disabled
            value={email}
            className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-600"
          />
        </div>

        <form className="space-y-4" onSubmit={handleSetPin}>
          {storedPin && (
            <div>
              <label className="block text-sm font-medium mb-1">PIN Lama</label>
              <input
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                placeholder="PIN saat ini"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">PIN Baru</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              placeholder="4–6 digit"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi PIN</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              placeholder="Ulangi PIN"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : storedPin ? "Ubah PIN" : "Setel PIN"}
            </button>
            {storedPin && (
              <button
                type="button"
                onClick={handleResetPin}
                className="text-sm text-gray-500 hover:underline"
              >
                Lupa PIN? Hapus PIN
              </button>
            )}
          </div>
        </form>
      </div>
    </LayoutWithSidebar>
  )
}

export default SecurityPage
