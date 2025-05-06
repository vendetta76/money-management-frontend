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
      <main className="2xl:px-20 max-w-screen-md md:ml-64 md:px-8 min-h-screen mx-auto pt-4 px-4 sm:px-6 w-full xl:px-12">
        <h1 className="dark:text-white font-bold mb-6 text-2xl">🔐 Keamanan</h1>

        <div className="mb-6">
          <label className="block dark:text-white font-medium mb-1 text-sm">Email</label>
          <input
            type="email"
            disabled
            value={email}
            className="bg-gray-200 border dark:bg-gray-900 dark:text-white px-4 py-2 rounded-lg text-gray-600 w-full"
          />
        </div>

        <form className="mb-10 space-y-4" onSubmit={handleSetPin}>
          <h2 className="dark:text-white font-semibold text-lg">Ganti PIN Akses</h2>
          <p className="dark:text-white flex gap-2 items-center mb-2 text-sm text-yellow-600">
            🔒 Fitur PIN hanya tersedia untuk pengguna <strong>Premium</strong>.
          </p>

          {storedPin && (
            <div>
              <label className="block dark:text-white font-medium mb-1 text-sm">PIN Lama</label>
              <input
                type="password"
                disabled={!isPremium}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="bg-gray-100 border dark:bg-gray-900 px-4 py-2 rounded-lg w-full"
                placeholder="PIN saat ini"
              />
            </div>
          )}
          <div>
            <label className="block dark:text-white font-medium mb-1 text-sm">PIN Baru</label>
            <input
              type="password"
              disabled={!isPremium}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="bg-gray-100 border dark:bg-gray-900 px-4 py-2 rounded-lg w-full"
              placeholder="4–6 digit"
            />
          </div>
          <div>
            <label className="block dark:text-white font-medium mb-1 text-sm">Konfirmasi PIN</label>
            <input
              type="password"
              disabled={!isPremium}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="bg-gray-100 border dark:bg-gray-900 px-4 py-2 rounded-lg w-full"
              placeholder="Ulangi PIN"
            />
          </div>

          {error && <p className="dark:text-white text-red-600 text-sm">{error}</p>}
          {success && <p className="dark:text-white text-green-600 text-sm">{success}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading || !isPremium}
              className="bg-red-600 dark:bg-gray-900 disabled:opacity-50 hover:bg-red-700 px-6 py-2 rounded-lg text-white"
            >
              {loading ? "Menyimpan..." : storedPin ? "Ubah PIN" : "Setel PIN"}
            </button>
            {storedPin && (
              <button
                type="button"
                disabled={!isPremium}
                onClick={handleResetPin}
                className="dark:text-white hover:underline text-gray-500 text-sm"
              >
                Lupa PIN? Hapus PIN
              </button>
            )}
          </div>
        </form>

        <form className="space-y-4" onSubmit={handleChangePassword}>
          <h2 className="dark:text-white font-semibold text-lg">Ganti Password</h2>

          <div>
            <label className="block dark:text-white font-medium mb-1 text-sm">Password Lama</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-gray-100 border dark:bg-gray-900 px-4 py-2 rounded-lg w-full"
              placeholder="Password lama"
            />
          </div>

          <div>
            <label className="block dark:text-white font-medium mb-1 text-sm">Password Baru</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-100 border dark:bg-gray-900 px-4 py-2 rounded-lg w-full"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <div>
            <label className="block dark:text-white font-medium mb-1 text-sm">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-100 border dark:bg-gray-900 px-4 py-2 rounded-lg w-full"
              placeholder="Ulangi password"
            />
          </div>

          {error && <p className="dark:text-white text-red-600 text-sm">{error}</p>}
          {success && <p className="dark:text-white text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 dark:bg-gray-900 disabled:opacity-50 hover:bg-blue-700 px-6 py-2 rounded-lg text-white"
          >
            {loading ? "Menyimpan..." : "Ubah Password"}
          </button>
        </form>
      </main>
    </LayoutShell>
  )
}

export default SecurityPage
