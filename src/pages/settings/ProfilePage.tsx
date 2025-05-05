
import React, { useEffect, useRef, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../../lib/firebaseClient'
import { useAuth } from '../../context/AuthContext'
import LayoutWithSidebar from '../../layouts/LayoutWithSidebar'
import toast from 'react-hot-toast'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'

const ProfilePage = () => {
  const { user, userMeta } = useAuth()
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState("")
  const [previewImage, setPreviewImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [useProxy, setUseProxy] = useState(true)
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
      const token = await getAuth().currentUser?.getIdToken()
      setLoading(true)

      if (useProxy) {
        // Upload via backend proxy
        const formData = new FormData()
        formData.append("file", blob!)

        const uploadRes = await fetch("https://moniq-api.onrender.com/api/upload-avatar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        })

        const data = await uploadRes.json()
        if (data.url) {
          setAvatar(data.url)
          toast.success("✅ Avatar berhasil diunggah lewat proxy!")
          setPreviewImage("")
        } else {
          throw new Error("Upload gagal (proxy)")
        }
      } else {
        // Upload via signed Cloudinary
        const signRes = await fetch("https://moniq-api.onrender.com/api/cloudinary/cloudinary-sign", {
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
          setAvatar(data.secure_url)
          toast.success("✅ Avatar berhasil diunggah via signed method!")
          setPreviewImage("")
        }
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
      await updateDoc(doc(db, "users", user.uid), { name, avatar })
      toast.success("✅ Profil berhasil diperbarui!")
    } catch (err) {
      console.error(err)
      toast.error("❌ Gagal menyimpan profil.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LayoutWithSidebar>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">👤 Profil Saya</h1>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Mode Upload:</span>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={() => setUseProxy(!useProxy)}
            />
            {useProxy ? "Proxy Backend" : "Signed Direct"}
          </label>
        </div>

        <div className="mb-6 text-center">
          <img
            src={avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border"
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
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </LayoutWithSidebar>
  )
}

export default ProfilePage
