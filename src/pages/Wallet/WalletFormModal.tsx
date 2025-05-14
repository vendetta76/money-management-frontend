import React, { useState } from "react";
import { X } from "lucide-react";
import Select from "react-select";

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    currency: string;
    colorStyle: "solid" | "gradient";
    colorValue: string | { start: string; end: string };
  }) => void;
  editingData?: any;
}

const currencyOptions = [
  { value: "IDR", label: "IDR - Rupiah" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "JPY", label: "JPY - Yen" },
  { value: "THB", label: "THB - Baht" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "GBP", label: "GBP - Pound Sterling" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CNY", label: "CNY - Yuan" },
  { value: "VND", label: "VND - Dong" },
  { value: "PHP", label: "PHP - Peso" },
  { value: "MYR", label: "MYR - Ringgit" },
  { value: "KRW", label: "KRW - Won" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
];

const colorStyleOptions = [
  { value: "solid", label: "Solid" },
  { value: "gradient", label: "Gradient" },
];

const WalletFormModal: React.FC<WalletFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingData,
}) => {
  const [form, setForm] = useState({
    name: editingData?.name || "",
    currency: editingData?.currency || "",
    colorStyle: editingData?.colorStyle || "gradient",
    colorValue: editingData?.colorValue || {
      start: "#9333ea",
      end: "#4f46e5",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama wallet wajib diisi";
    if (!form.currency) newErrors.currency = "Pilih mata uang";

    if (Object.keys(newErrors).length) return setErrors(newErrors);

    onSubmit(form);
    setForm({
      name: "",
      currency: "",
      colorStyle: "gradient",
      colorValue: { start: "#9333ea", end: "#4f46e5" },
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 pointer-events-auto">
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

        <h3 className="mb-4 font-semibold">Tambah Wallet</h3>

        <div className="mb-3">
          <input
            name="name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nama Wallet"
            className="w-full px-4 py-2 border rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <Select
            options={currencyOptions}
            value={currencyOptions.find((o) => o.value === form.currency)}
            onChange={(sel) =>
              handleChange("currency", sel?.value || "")
            }
            placeholder="Pilih mata uang"
          />
          {errors.currency && (
            <p className="text-red-500 text-sm">{errors.currency}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Pilih Gaya Warna
          </label>
          <Select
            options={colorStyleOptions}
            value={colorStyleOptions.find(
              (o) => o.value === form.colorStyle
            )}
            onChange={(sel) =>
              handleChange("colorStyle", sel?.value || "gradient")
            }
            placeholder="Pilih gaya warna"
          />
        </div>

        {form.colorStyle === "solid" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Pilih Warna
            </label>
            <input
              type="color"
              value={
                typeof form.colorValue === "string"
                  ? form.colorValue
                  : "#9333ea"
              }
              onChange={(e) =>
                handleChange("colorValue", e.target.value)
              }
              className="w-full h-10 border rounded"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Pilih Warna Gradient
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(form.colorValue as any)?.start ?? "#9333ea"}
                onChange={(e) =>
                  handleChange("colorValue", {
                    ...(form.colorValue as any),
                    start: e.target.value,
                  })
                }
                className="h-10 w-full border rounded"
              />
              <input
                type="color"
                value={(form.colorValue as any)?.end ?? "#4f46e5"}
                onChange={(e) =>
                  handleChange("colorValue", {
                    ...(form.colorValue as any),
                    end: e.target.value,
                  })
                }
                className="h-10 w-full border rounded"
              />
            </div>
          </div>
        )}

        {/* Preview Warna */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Pratinjau Warna
          </label>
          <div
            className="w-full h-12 rounded border"
            style={
              form.colorStyle === "solid"
                ? {
                    backgroundColor:
                      typeof form.colorValue === "string"
                        ? form.colorValue
                        : "#9333ea",
                  }
                : {
                    background: `linear-gradient(to bottom right, ${
                      (form.colorValue as any)?.start ?? "#9333ea"
                    }, ${(form.colorValue as any)?.end ?? "#4f46e5"})`,
                  }
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Simpan
        </button>
      </form>
    </div>
  );
};

export default WalletFormModal;