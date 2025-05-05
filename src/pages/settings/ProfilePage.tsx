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
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    )

    try {
      if (!user?.uid) throw new Error("User belum login")
      setLoading(true)

      const token = await getAuth().currentUser?.getIdToken()

      // 🔥 Ganti URL berikut dengan domain backend Render lu
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
        throw new Error("Upload gagal ke Cloudinary")
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
          <img
            src={avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-28 h-28 rounded-full mx-auto mb-2 object-cover border"
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
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
                className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
              >
                {loading ? "Mengunggah..." : "Upload Avatar"}
              </button>
            </div>
          )}
        </div>

        <div className="mb-6 text-sm text-gray-600">
          <p><strong>Role:</strong> {userMeta?.role || "Regular"}</p>
          <p><strong>Status:</strong> {userMeta?.premiumEndDate ? "Premium" : "Regular"}</p>
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
