import React from "react";
import { X } from "lucide-react";
import Select from "react-select";

interface WalletFormModalProps {
  isOpen: boolean;
  form: {
    name: string;
    balance: string;
    currency: string;
    colorStyle: "solid" | "gradient";
    colorValue: string | { start: string; end: string };
  };
  errors: Record<string, string>;
  onClose: () => void;
  onChange: (field: string, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  editing: boolean;
  currencyOptions: { value: string; label: string }[];
  colorStyleOptions: { value: "solid" | "gradient"; label: string }[];
}

const WalletFormModal: React.FC<WalletFormModalProps> = ({
  isOpen,
  form,
  errors,
  onClose,
  onChange,
  onSubmit,
  onDelete,
  editing,
  currencyOptions,
  colorStyleOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 pointer-events-auto">
      <form
        onSubmit={onSubmit}
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
          {editing ? "Edit Wallet" : "Tambah Wallet"}
        </h3>

        {/* Nama Wallet */}
        <div className="mb-3">
          <input
            name="name"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Nama Wallet"
            className="w-full px-4 py-2 border rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name}</p>
          )}
        </div>

        {/* Pilih Mata Uang */}
        <div className="mb-4">
          <Select
            options={currencyOptions}
            value={currencyOptions.find((o) => o.value === form.currency)}
            onChange={(sel) => onChange("currency", sel?.value || "")}
            placeholder="Pilih mata uang"
          />
          {errors.currency && (
            <p className="text-red-500 text-sm">{errors.currency}</p>
          )}
        </div>

        {/* Pilih Gaya Warna */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Pilih Gaya Warna
          </label>
          <Select
            options={colorStyleOptions}
            value={colorStyleOptions.find((o) => o.value === form.colorStyle)}
            onChange={(sel) =>
              onChange("colorStyle", sel?.value || "gradient")
            }
            placeholder="Pilih gaya warna"
          />
        </div>

        {/* Input Warna */}
        <div className="mb-4">
          {form.colorStyle === "solid" ? (
            <div>
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
                onChange={(e) => onChange("colorValue", e.target.value)}
                className="w-full h-10 border rounded"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">
                Pilih Warna Gradient
              </label>
              <div className="flex space-x-2">
                <div>
                  <label className="text-sm">Warna Awal</label>
                  <input
                    type="color"
                    value={(form.colorValue as any)?.start ?? "#9333ea"}
                    onChange={(e) =>
                      onChange("colorValue", {
                        ...(form.colorValue as any),
                        start: e.target.value,
                      })
                    }
                    className="w-full h-10 border rounded"
                  />
                </div>
                <div>
                  <label className="text-sm">Warna Akhir</label>
                  <input
                    type="color"
                    value={(form.colorValue as any)?.end ?? "#4f46e5"}
                    onChange={(e) =>
                      onChange("colorValue", {
                        ...(form.colorValue as any),
                        end: e.target.value,
                      })
                    }
                    className="w-full h-10 border rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

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

        {/* Tombol Aksi */}
        <div className="flex justify-between items-center">
          {editing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-red-600"
            >
              Hapus Wallet
            </button>
          )}
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            {editing ? "Simpan" : "Tambah"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WalletFormModal;