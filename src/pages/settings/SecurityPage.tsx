import React, { useEffect, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { db } from "../../lib/firebaseClient"
import { useAuth } from "../../context/AuthContext"
import LayoutShell from "../../layouts/LayoutShell"

const SecurityPage = () => {
  const { user } = useAuth()
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [currentPin, setCurrentPin] = useState("")
  const [storedPin, setStoredPin] = useState("")
  const [isPremium, setIsPremium] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.email) setEmail(user.email)
    if (!user?.uid) return

    const loadUserData = async () => {
      const snap = await getDoc(doc(db, "users", user.uid))
      if (snap.exists()) {
        const data = snap.data()
        setStoredPin(data.accessPin || "")
        setIsPremium(!!data.isPremium)
      }
    }

    loadUserData()
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword.length < 6) {
      setError("Password baru harus minimal 6 karakter.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.")
      return
    }

    try {
      setLoading(true)
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword)
      await reauthenticateWithCredential(user!, credential)
      await updatePassword(user!, newPassword)
      setSuccess("✅ Password berhasil diperbarui!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error(err)
      setError("❌ Gagal memperbarui password. Pastikan password lama benar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 pt-4  max-w-screen-md mx-auto">
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

        <form className="space-y-4 mb-10" onSubmit={handleSetPin}>
          <h2 className="text-lg font-semibold">Ganti PIN Akses</h2>
          <p className="text-sm text-yellow-600 flex items-center gap-2 mb-2">
            🔒 Fitur PIN hanya tersedia untuk pengguna <strong>Premium</strong>.
          </p>

          {storedPin && (
            <div>
              <label className="block text-sm font-medium mb-1">PIN Lama</label>
              <input
                type="password"
                disabled={!isPremium}
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
              disabled={!isPremium}
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
              disabled={!isPremium}
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
              disabled={loading || !isPremium}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : storedPin ? "Ubah PIN" : "Setel PIN"}
            </button>
            {storedPin && (
              <button
                type="button"
                disabled={!isPremium}
                onClick={handleResetPin}
                className="text-sm text-gray-500 hover:underline"
              >
                Lupa PIN? Hapus PIN
              </button>
            )}
          </div>
        </form>

        <form className="space-y-4" onSubmit={handleChangePassword}>
          <h2 className="text-lg font-semibold">Ganti Password</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Password Lama</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              placeholder="Password lama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              placeholder="Ulangi password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </main>
    </LayoutShell>
  )
}

export default SecurityPage
