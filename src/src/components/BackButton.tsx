import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react" // pakai lucide icon biar clean

const BackButton = () => {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate("/")}
      className="flex items-center gap-2 text-purple-600 font-medium hover:underline hover:text-purple-800 transition"
    >
      <ArrowLeft className="w-5 h-5" />
      Kembali ke Beranda
    </button>
  )
}

export default BackButton
