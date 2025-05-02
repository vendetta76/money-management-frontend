import { useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export const useBlockLandingIfLoggedIn = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user?.emailVerified) {
      toast((t) => (
        <div className="text-sm text-center">
          <p className="mb-2 font-semibold text-red-600">
            Oops, Kamu Tidak Bisa Pindah Ke Halaman Lain Selain Dashboard Demi Keamanan dan Privasi Kamu
          </p>
          <button
            onClick={() => {
              toast.dismiss(t.id)
              navigate("/dashboard")
            }}
            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            OK
          </button>
        </div>
      ), { duration: 10000 }) // tampil selama 10 detik max
    }
  }, [user, loading, navigate])
}
