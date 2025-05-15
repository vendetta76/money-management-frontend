import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { db } from "../../lib/firebaseClient";
import {
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingData?: any;
}

const currencyOptions = [
  { value: "IDR", label: "IDR - Indonesian Rupiah" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "THB", label: "THB - Thailand Baht" },
];

const colorStyleOptions = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

const WalletFormModal: React.FC<WalletFormModalProps> = ({
  isOpen,
  onClose,
  editingData,
}) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    currency: "",
    colorStyle: "gradient",
    colorValue: { start: "#9333ea", end: "#4f46e5" },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingData) {
      setForm({
        name: editingData.name || "",
        currency: editingData.currency || "",
        colorStyle: editingData.colorStyle || "gradient",
        colorValue:
          editingData.colorValue || { start: "#9333ea", end: "#4f46e5" },
      });
    } else {
      setForm({
        name: "",
        currency: "",
        colorStyle: "gradient",
        colorValue: { start: "#9333ea", end: "#4f46e5" },
      });
    }
  }, [editingData]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama wallet wajib diisi";
    if (!form.currency) newErrors.currency = "Pilih mata uang";
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    try {
      const payload = {
        name: form.name,
        currency: form.currency,
        colorStyle: form.colorStyle,
        colorValue: form.colorValue,
        balance: editingData?.balance ?? 0,
        createdAt: editingData?.createdAt ?? serverTimestamp(),
      };

      if (editingData?.id) {
        await updateDoc(
          doc(db, "users", user!.uid, "wallets", editingData.id),
          payload
        );
        toast.success("Wallet diperbarui");
      } else {
        await addDoc(collection(db, "users", user!.uid, "wallets"), payload);
        toast.success("Wallet ditambahkan");
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data");
    }
  };

  const handleDelete = async () => {
    if (!editingData?.id) return;
    const confirm = window.confirm("Yakin ingin menghapus wallet ini?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "users", user!.uid, "wallets", editingData.id));
      toast.success("Wallet berhasil dihapus");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus wallet");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[9999]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl max-w-sm w-full relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3"
        >
          <X size={20} />
        </button>
        <h3 className="mb-4 font-semibold">
          {editingData ? "Edit Wallet" : "Tambah Wallet"}
        </h3>
        <div className="mb-3">
          <input
            name="name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nama Wallet"
            className="w-full px-4 py-2 border rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="mb-4">
          <Select
            options={currencyOptions}
            value={currencyOptions.find((o) => o.value === form.currency)}
            onChange={(sel) => handleChange("currency", sel?.value || "")}
            placeholder="Pilih mata uang"
          />
          {errors.currency && (
            <p className="text-red-500 text-sm">{errors.currency}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Pilih Gaya Warna</label>
          <Select
            options={colorStyleOptions}
            value={colorStyleOptions.find(
              (o) => o.value === form.colorStyle
            )}
            onChange={(sel) =>
              handleChange("colorStyle", sel?.value || "gradient")
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Pratinjau Warna</label>
          <div
            className="w-full h-12 rounded border"
            style={
              form.colorStyle === "solid"
                ? { backgroundColor: form.colorValue as string }
                : {
                    background: `linear-gradient(to bottom right, ${(form.colorValue as any)?.start}, ${(form.colorValue as any)?.end})`,
                  }
            }
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {editingData ? "Simpan Perubahan" : "Tambah Wallet"}
        </button>
        {editingData?.id && (
          <button
            type="button"
            onClick={handleDelete}
            className="mt-4 w-full text-red-600 hover:text-red-800 text-sm underline"
          >
            🗑 Hapus Wallet Ini
          </button>
        )}
      </form>
    </div>
  );
};

export default WalletFormModal;


<WalletFormModal
  isOpen={showForm || !!editingWallet}
  editingData={editingWallet}
  onClose={() => {
    setShowForm(false);
    setEditingWallet(null);
    setSelectedWallet(null);
  }}
/>