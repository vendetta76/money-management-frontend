import React, { useEffect, useRef, useState } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "../../lib/firebaseClient"
import { useAuth } from "../../context/AuthContext"
import LayoutShell from "../../layouts/LayoutShell"
import toast from "react-hot-toast"
import Cropper from "react-cropper"
import "cropperjs/dist/cropper.css"

const ProfilePage = () => {
  const { user, userMeta } = useAuth()
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [previewImage, setPreviewImage] = useState("")
  const [loading, setLoading] = useState(false)
  const cropperRef = useRef<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return
      const snapshot = await getDoc(doc(db, "users", user.uid))
      if (snapshot.exists()) {
        const data = snapshot.data()
        setName(data.name || "")
        setAvatar(data.avatar || "")
      }
    }
    fetchProfile()
  }, [user])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPreviewImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const uploadCroppedImage = async () => {
    if (!cropperRef.current) return
    const cropper = cropperRef.current.cropper
    const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 })
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.8)
    )

    try {
      if (!user?.uid) throw new Error("User belum login")
      setLoading(true)

      const token = await getAuth().currentUser?.getIdToken()
      const signRes = await fetch("https://money-management-backend-f6dg.onrender.com/api/cloudinary/cloudinary-sign", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      const { signature, timestamp, apiKey, cloudName, folder, uploadPreset } = await signRes.json()

      const formData = new FormData()
      formData.append("file", blob!)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp)
      formData.append("signature", signature)
      formData.append("upload_preset", uploadPreset)
      formData.append("folder", folder)

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      })

      const data = await cloudRes.json()
      if (data.secure_url) {
        await updateDoc(doc(db, "users", user.uid), { avatar: data.secure_url })
        setAvatar(data.secure_url)
        toast.success("✅ Avatar berhasil diunggah!")
        setPreviewImage("")
      } else {
        console.error("🛑 Cloudinary Response Error:", data)
        toast.error(data?.error?.message || "❌ Upload gagal ke Cloudinary")
        throw new Error(data?.error?.message || "Upload gagal ke Cloudinary")
      }
    } catch (err) {
      console.error(err)
      toast.error("❌ Upload gagal")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!user?.uid) throw new Error("User belum login")
      setLoading(true)
      await updateDoc(doc(db, "users", user.uid), { name })
      toast.success("✅ Profil berhasil diperbarui!")
    } catch (err) {
      console.error(err)
      toast.error("❌ Gagal menyimpan profil.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 pt-4 md:ml-64 max-w-screen-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-purple-700 flex items-center gap-2">👤 Profil Saya</h1>

        <div className="mb-6 text-center">
          <div className="relative w-fit mx-auto mb-4">
            <img
              src={(avatar?.replace("/upload/", "/upload/f_auto/")) || "/default-avatar.png"}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border shadow"
            />
            {previewImage && (
              <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow">
                Preview
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <label
              htmlFor="avatarInput"
              className="cursor-pointer inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow transition duration-200"
            >
              Pilih Foto
            </label>
            <input
              id="avatarInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {previewImage && (
            <div className="mt-4">
              <Cropper
                src={previewImage}
                style={{ height: 300, width: "100%" }}
                aspectRatio={1}
                guides={false}
                ref={cropperRef}
                viewMode={1}
              />
              <button
                onClick={uploadCroppedImage}
                disabled={loading}
                className="mt-3 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 text-sm transition duration-200"
              >
                {loading ? "Mengunggah..." : "Unggah Avatar"}
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 text-sm text-gray-600 space-y-1">
          <p><strong>Status:</strong> {userMeta?.role || "Regular"}</p>
          <p><strong>Login terakhir:</strong> {user?.metadata?.lastSignInTime
            ? new Date(user.metadata.lastSignInTime).toLocaleString("id-ID")
            : "Tidak tersedia"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </main>
    </LayoutShell>
  )
}

export default ProfilePage
