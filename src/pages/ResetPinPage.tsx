import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const ResetPinPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pin !== confirmPin) {
      setError("PIN tidak cocok.")
      return
    }
    if (pin.length < 4 || pin.length > 6) {
      setError("PIN harus 4–6 digit.")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("https://money-management-backend-f6dg.onrender.com/api/reset-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, pin })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Reset PIN gagal")

      toast.success("✅ PIN berhasil diatur ulang")
      navigate("/login")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white dark:bg-gray-900 max-w-sm p-6 rounded-xl shadow w-full">
        <h1 className="font-bold mb-4 text-center text-purple-700 text-xl">🔐 Atur Ulang PIN</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="PIN Baru"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-gray-100 border dark:border-gray-700 px-4 py-2 rounded w-full"
          />
          <input
            type="password"
            placeholder="Konfirmasi PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="bg-gray-100 border dark:border-gray-700 px-4 py-2 rounded w-full"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 font-semibold hover:bg-purple-700 py-2 rounded text-white w-full"
          >
            {loading ? "Memproses..." : "Reset PIN"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPinPage