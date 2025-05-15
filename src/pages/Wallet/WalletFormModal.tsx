import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { db } from "../../lib/firebaseClient";
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { archiveWallet } from "@/lib/archiveWallet";

interface WalletEntry {
  id: string;
  name: string;
  balance: number;
  currency: string;
  colorStyle: "solid" | "gradient";
  colorValue: string | { start: string; end: string };
  status?: string;
}

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingData?: WalletEntry;
  wallets?: WalletEntry[];
}

const currencyOptions = [
  { value: "IDR", label: "IDR - Indonesian Rupiah" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "TWD", label: "TWD - Taiwan Dollar" },
  { value: "THB", label: "THB - Thai Baht" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "MYR", label: "MYR - Malaysian Ringgit" },
  { value: "KRW", label: "KRW - South Korean Won" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "PHP", label: "PHP - Philippine Peso" },
  { value: "VND", label: "VND - Vietnamese Dong" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "RUB", label: "RUB - Russian Ruble" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "TRY", label: "TRY - Turkish Lira" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "EGP", label: "EGP - Egyptian Pound" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "PLN", label: "PLN - Polish Zloty" },
  { value: "CZK", label: "CZK - Czech Koruna" },
  { value: "HUF", label: "HUF - Hungarian Forint" },
  { value: "ILS", label: "ILS - Israeli Shekel" },
  { value: "NGN", label: "NGN - Nigerian Naira" },
  { value: "ARS", label: "ARS - Argentine Peso" },
  { value: "CLP", label: "CLP - Chilean Peso" },
  { value: "COP", label: "COP - Colombian Peso" },
];

const colorStyleOptions = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

const WalletFormModal: React.FC<WalletFormModalProps> = ({
  isOpen,
  onClose,
  editingData,
  wallets = [],
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
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleColorChange = (field: string, value: string) => {
    if (form.colorStyle === "solid") {
      setForm((prev) => ({ ...prev, colorValue: value }));
    } else {
      setForm((prev) => ({
        ...prev,
        colorValue: { ...prev.colorValue, [field]: value },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama wallet wajib diisi";
    if (!form.currency) newErrors.currency = "Pilih mata uang";

    const isDuplicate = wallets.some(
      (w) =>
        w.name.toLowerCase() === form.name.toLowerCase() &&
        w.status !== "archived" &&
        (!editingData || w.id !== editingData.id)
    );
    if (isDuplicate) newErrors.name = "Nama dompet sudah digunakan";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

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

    if (editingData.balance !== 0) {
      toast.error("Saldo wallet masih ada. Kosongkan dulu sebelum menghapus.");
      return;
    }

    const confirm = window.confirm("Yakin ingin menghapus wallet ini?");
    if (!confirm) return;

    try {
      await archiveWallet(user!.uid, editingData.id);
      toast.success("Wallet berhasil dihapus.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus wallet.");
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
        {form.colorStyle === "solid" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Warna Solid</label>
            <input
              type="color"
              value={form.colorValue as string}
              onChange={(e) => handleColorChange("", e.target.value)}
              className="w-full h-10 p-0 border rounded cursor-pointer"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Gradasi Warna</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(form.colorValue as any)?.start}
                onChange={(e) => handleColorChange("start", e.target.value)}
                className="w-full h-10 border rounded cursor-pointer"
              />
              <input
                type="color"
                value={(form.colorValue as any)?.end}
                onChange={(e) => handleColorChange("end", e.target.value)}
                className="w-full h-10 border rounded cursor-pointer"
              />
            </div>
          </div>
        )}
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
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            {editingData ? "Simpan" : "Tambah"}
          </button>
        </div>
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