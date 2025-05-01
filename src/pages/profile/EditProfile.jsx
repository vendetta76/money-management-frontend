import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import getCroppedImg from "../../utils/cropImage";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          toast.error("Gagal mengambil data profil");
        } else {
          setUsername(data?.username || "");
          setAvatar(data?.avatar_url || "");
        }
      }
    };

    fetchProfile();
  }, [user]);

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropAndUpload = async () => {
    try {
      const croppedImage = await getCroppedImg(selectedImage, croppedAreaPixels);

      const compressedFile = await imageCompression(croppedImage, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", "your_upload_preset");

      const res = await fetch("https://api.cloudinary.com/v1_1/dvbn6oqlp/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAvatar(data.secure_url);
      setSelectedImage(null);
      toast.success("Foto berhasil diupload!");
    } catch (err) {
      console.error("❌ Error Upload:", err.message);
      toast.error("Gagal upload foto");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ username, avatar_url: avatar })
      .eq("id", user.id);

    if (error) {
      toast.error("Gagal update profil");
    } else {
      toast.success("Profil berhasil diupdate");
      navigate("/profile");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-6">Edit Profil</h1>
      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Foto Profil</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border p-2 rounded"
            onChange={uploadImage}
          />

          {avatar && (
            <div className="mt-3 space-y-2">
              <img src={avatar} alt="Avatar Preview" className="w-20 h-20 rounded-full" />
              <button
                type="button"
                onClick={() => setAvatar("")}
                className="text-sm text-red-500 hover:underline"
              >
                Hapus Foto Profil
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      {/* Modal Cropper */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <Cropper
              image={selectedImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCropAndUpload}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
