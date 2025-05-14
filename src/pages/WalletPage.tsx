// src/pages/WalletPage.tsx
// ✅ Added page lock status with PageLockAnnouncement

import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebaseClient";
import LayoutShell from "../layouts/LayoutShell";
import { Plus, X, Eye, EyeOff, SquarePen, Lock } from "lucide-react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { usePinLock } from "../context/PinLockContext";
import { toast } from "react-hot-toast";
import { fixAllWalletBalances } from "../utils/fixWallet";
import WalletPopupHistory from "../components/WalletPopupHistory";
import { usePageLockStatus } from "../context/PageLockContext"; // Adjust path as needed
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement"; // Adjust path as needed

const allowedRecalcEmails = ["diorvendetta76@gmail.com", "joeverson.kamantha@gmail.com"];

interface WalletEntry {
  id?: string;
  name: string;
  balance: number;
  currency: string;
  createdAt?: any;
  colorStyle: "solid" | "gradient";
  colorValue: string | { start: string; end: string };
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { locked, unlock, lock, pin } = usePinLock();
  const { locked: pageLocked, message } = usePageLockStatus("dashboard", "GLOBAL_ADMIN_ID");
  const [pinLockVisible, setPinLockVisible] = useState(true);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [form, setForm] = useState({
    name: "",
    balance: "0",
    currency: "USD",
    colorStyle: "gradient" as "solid" | "gradient",
    colorValue: { start: "#9333ea", end: "#4f46e5" }, // Default gradient
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<{ id: string; name: string; style: React.CSSProperties } | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!locked) setPinLockVisible(false);
    if (pinLockVisible && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [locked, pinLockVisible]);

  const handleUnlock = () => {
    const ok = unlock(enteredPin);
    if (ok) {
      setEnteredPin("");
      setPinError("");
      setPinLockVisible(false);
      toast.success("PIN berhasil dibuka!");
    } else {
      setPinError("PIN salah!");
      toast.error("PIN salah!");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  const currencyOptions = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "JPY", label: "JPY" },
    { value: "IDR", label: "IDR" },
    { value: "MYR", label: "MYR" },
    { value: "SGD", label: "SGD" },
    { value: "THB", label: "THB" },
    { value: "KRW", label: "KRW" },
    { value: "CNY", label: "CNY" },
    { value: "AUD", label: "AUD" },
    { value: "CAD", label: "CAD" },
    { value: "CHF", label: "CHF" },
    { value: "GBP", label: "GBP" },
    { value: "PHP", label: "PHP" },
    { value: "VND", label: "VND" },
    { value: "INR", label: "INR" },
    { value: "HKD", label: "HKD" },
    { value: "NZD", label: "NZD" },
  ];

  const colorStyleOptions = [
    { value: "solid", label: "Solid" },
    { value: "gradient", label: "Gradient" },
  ];

  const totalsByCurrency = wallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "wallets"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setWallets(
        snap.docs.map((d) => {
          const data = d.data() as WalletEntry;
          return {
            id: d.id,
            name: data.name,
            balance: data.balance ?? 0,
            currency: data.currency,
            createdAt: data.createdAt,
            colorStyle: data.colorStyle || "gradient",
            colorValue: data.colorValue || { start: "#9333ea", end: "#4f46e5" },
          };
        })
      );
    });
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.currency) e.currency = "Pilih mata uang";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    try {
      const payload = {
        name: form.name,
        balance: parseFloat(form.balance.replace(/,/g, "")),
        currency: form.currency,
        createdAt: serverTimestamp(),
        colorStyle: form.colorStyle,
        colorValue: form.colorStyle === "solid"
          ? (form.colorValue as string)
          : (form.colorValue as { start: string; end: string }),
      };
      if (!editingId) {
        await addDoc(collection(db, "users", user!.uid, "wallets"), payload);
        toast.success("Wallet ditambahkan");
      } else {
        await updateDoc(
          doc(db, "users", user!.uid, "wallets", editingId),
          payload
        );
        toast.success("Wallet diperbarui");
      }
      setForm({
        name: "",
        balance: "0",
        currency: "USD",
        colorStyle: "gradient",
        colorValue: { start: "#9333ea", end: "#4f46e5" },
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      toast.error("Terjadi kesalahan saat menyimpan.");
      console.error("Error saving wallet:", err.message);
    }
  };

  const handleEdit = (w: WalletEntry) => {
    setForm({
      name: w.name,
      balance: w.balance.toString(),
      currency: w.currency,
      colorStyle: w.colorStyle || "gradient",
      colorValue: w.colorValue || { start: "#9333ea", end: "#4f46e5" },
    });
    setEditingId(w.id!);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!window.confirm("Yakin hapus wallet ini?")) return;
    await deleteDoc(doc(db, "users", user!.uid, "wallets", editingId));
    setEditingId(null);
    setShowForm(false);
    toast.success("Wallet dihapus");
  };

  return (
    <LayoutShell>
      <main className={`min-h-screen px-4 py-6 max-w-6xl mx-auto transition-all duration-300 ${pinLockVisible ? "blur-md" : ""}`}>
        <PageLockAnnouncement
          locked={pageLocked}
          message={message}
          currentUserEmail={user?.email || ""}
          currentUserRole={user?.role || ""}
          bypassFor={["Admin", "diorvendetta76@gmail.com"]}
        />

        {/* Total Saldo */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            💰 Total Saldo per Mata Uang
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <div
                key={currency}
                className="bg-white shadow-md rounded-lg p-4 border-t-4 border-indigo-500 hover:shadow-lg transition"
              >
                <div className="text-sm text-gray-500 font-medium mb-1">
                  {currency}
                </div>
                <div className="text-xl font-bold text-gray-900 tracking-tight">
                  {showBalance
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 0,
                      }).format(total)
                    : "••••••"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Daftar Wallet</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-sm flex items-center gap-1"
            >
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              {showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
            </button>

            {allowedRecalcEmails.includes(user?.email || "") && (
              <button
                onClick={() => user?.uid && fixAllWalletBalances(user.uid)}
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                🔁 Rekalkulasi Saldo
              </button>
            )}

            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              <Plus size={16} /> Tambah Wallet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {wallets.map((w) => {
            const defaultStyle = { backgroundColor: "#9333ea" };
            const cardStyle =
              w.colorStyle === "solid"
                ? { backgroundColor: typeof w.colorValue === "string" ? w.colorValue : "#9333ea" }
                : w.colorValue && typeof w.colorValue === "object" && "start" in w.colorValue && "end" in w.colorValue
                ? {
                    background: `linear-gradient(to bottom right, ${w.colorValue.start}, ${w.colorValue.end})`,
                  }
                : defaultStyle;

            return (
              <div
                key={w.id}
                className="p-5 rounded-2xl flex flex-col justify-between relative transition-transform duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/30 hover:ring-2 hover:ring-white/30 text-white"
                style={cardStyle}
                onClick={() => setSelectedWallet({ id: w.id!, name: w.name, style: cardStyle })}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from triggering
                    handleEdit(w);
                  }}
                  className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 p-1 rounded-md transition backdrop-blur-sm ring-1 ring-white/20"
                  title={`Edit ${w.name}`}
                >
                  <SquarePen size={16} />
                </button>
                <h3 className="text-lg font-semibold truncate">{w.name}</h3>
                <div
                  className="text-2xl font-bold mt-2 transition-all duration-300"
                  title={`Saldo ${w.name}`}
                >
                  {showBalance
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: w.currency,
                        maximumFractionDigits: 0,
                      }).format(w.balance)
                    : "••••••"}
                </div>
              </div>
            );
          })}
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            {success}
          </div>
        )}

        {/* Form Tambah/Edit */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-xl max-w-sm w-full relative"
            >
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="absolute top-3 right-3"
              >
                <X size={20} />
              </button>
              <h3 className="mb-4 font-semibold">
                {editingId ? "Edit Wallet" : "Tambah Wallet"}
              </h3>
              <div className="mb-3">
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Wallet"
                  className="w-full px-4 py-2 border rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  disabled
                  value={form.balance}
                  className="w-full px-4 py-2 border rounded bg-gray-100"
                />
              </div>
              <div className="mb-4">
                <Select
                  options={currencyOptions}
                  value={currencyOptions.find((o) => o.value === form.currency)}
                  onChange={(sel) =>
                    setForm({ ...form, currency: sel?.value || "" })
                  }
                  placeholder="Pilih mata uang"
                />
                {errors.currency && (
                  <p className="text-red-500 text-sm">{errors.currency}</p>
                )}
              </div>
              {/* Color Style Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Pilih Gaya Warna
                </label>
                <Select
                  options={colorStyleOptions}
                  value={colorStyleOptions.find((o) => o.value === form.colorStyle)}
                  onChange={(sel) =>
                    setForm({
                      ...form,
                      colorStyle: sel?.value as "solid" | "gradient",
                      colorValue:
                        sel?.value === "solid"
                          ? "#9333ea"
                          : { start: "#9333ea", end: "#4f46e5" },
                    })
                  }
                  placeholder="Pilih gaya warna"
                />
              </div>
              {/* Color Inputs */}
              <div className="mb-4">
                {form.colorStyle === "solid" ? (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pilih Warna
                    </label>
                    <input
                      type="color"
                      value={form.colorValue as string}
                      onChange={(e) =>
                        setForm({ ...form, colorValue: e.target.value })
                      }
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
                          value={(form.colorValue as { start: string; end: string }).start}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setForm({
                              ...form,
                              colorValue: {
                                ...(form.colorValue as { start: string; end: string }),
                                start: e.target.value,
                              },
                            })
                          }
                          className="w-full h-10 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Warna Akhir</label>
                        <input
                          type="color"
                          value={(form.colorValue as { start: string; end: string }).end}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setForm({
                              ...form,
                              colorValue: {
                                ...(form.colorValue as { start: string; end: string }),
                                end: e.target.value,
                              },
                            })
                          }
                          className="w-full h-10 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Color Preview */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Pratinjau Warna
                </label>
                <div
                  className="w-full h-12 rounded border"
                  style={
                    form.colorStyle === "solid"
                      ? { backgroundColor: form.colorValue as string }
                      : {
                          background: `linear-gradient(to bottom right, ${(form.colorValue as { start: string; end: string }).start}, ${(form.colorValue as { start: string; end: string }).end})`,
                        }
                  }
                />
              </div>
              <div className="flex justify-between items-center">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="text-red-600"
                  >
                    Hapus Wallet
                  </button>
                )}
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  {editingId ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedWallet && (
          <WalletPopupHistory
            walletId={selectedWallet.id}
            walletName={selectedWallet.name}
            cardStyle={selectedWallet.style}
            isOpen={!!selectedWallet}
            onClose={() => setSelectedWallet(null)}
          />
        )}
      </main>

      {pinLockVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 transition-all duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-80 text-center animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Masukkan PIN</h2>
            <div className="mb-4">
              <label htmlFor="pin-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PIN
              </label>
              <input
                id="pin-input"
                type="password"
                maxLength={6}
                className="border rounded-lg w-full px-4 py-2 text-center text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-400"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="••••••"
                aria-label="Enter your PIN"
                ref={pinInputRef}
              />
              {pinError && (
                <p className="text-red-500 text-sm mt-2">{pinError}</p>
              )}
            </div>
            <button
              onClick={handleUnlock}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Buka Kunci
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (!pin) {
            toast.error(
              "PIN belum diset. Silakan atur PIN terlebih dahulu di halaman Security."
            );
          } else {
            setEnteredPin("");
            setPinLockVisible(true);
            lock();
          }
        }}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-40 transition"
        title="Kunci Dompet"
      >
        <Lock />
      </button>
    </LayoutShell>
  );
};

export default WalletPage;