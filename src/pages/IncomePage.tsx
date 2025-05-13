// FINAL: src/pages/income/IncomePage.tsx
// ✅ Preview wallet hanya untuk dompet yang dipilih
// ✅ Updated button section with "Simpan & Lanjut" functionality
// ✅ Added ref for description input with auto-focus and Enter key shortcut

import { useState, useEffect, useRef } from "react";
import LayoutShell from "../layouts/LayoutShell";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebaseClient";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { Pencil, Trash, Loader2 } from "lucide-react";

interface IncomeEntry {
  id?: string;
  wallet: string;
  description: string;
  amount: number;
  currency: string;
  createdAt?: any;
  editHistory?: any[];
}

interface WalletEntry {
  id?: string;
  name: string;
  balance: number;
  currency: string;
  createdAt?: any;
  colorStyle?: "solid" | "gradient";
  colorValue?: string | { start: string; end: string };
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper untuk getCardStyle
const getCardStyle = (wallet: WalletEntry): React.CSSProperties => {
  if (wallet.colorStyle === "solid") {
    return {
      backgroundColor: typeof wallet.colorValue === "string" ? wallet.colorValue : "#9333ea",
    };
  }
  if (wallet.colorStyle === "gradient" && typeof wallet.colorValue === "object") {
    return {
      background: `linear-gradient(to bottom right, ${wallet.colorValue.start}, ${wallet.colorValue.end})`,
    };
  }
  return { backgroundColor: "#9333ea" };
};

const IncomePage = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [form, setForm] = useState({ wallet: "", description: "", amount: "", currency: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const descriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const unsubIncomes = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as IncomeEntry[];
      setIncomes(data);
    });

    const walletRef = collection(db, "users", user.uid, "wallets");
    const unsubWallets = onSnapshot(walletRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as WalletEntry[];
      setWallets(data);
    });

    return () => {
      unsubIncomes();
      unsubWallets();
    };
  }, [user]);

  // Global shortcut ENTER → Simpan (hanya jika form valid)
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !editingId && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        const valid = validate();
        if (Object.keys(valid).length === 0) {
          (document.activeElement as HTMLElement)?.blur();
          descriptionRef.current?.form?.requestSubmit();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [form, editingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const numeric = value.replace(/\D/g, "");
      const formatted = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      setForm({ ...form, amount: formatted });
    } else {
      setForm({ ...form, [name]: value });
    }
    setErrors({ ...errors, [name]: "" });
  };

  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWallet = wallets.find((w) => w.id === e.target.value);
    setForm({
      ...form,
      wallet: e.target.value,
      currency: selectedWallet?.currency || "",
    });
    setErrors({ ...errors, wallet: "", currency: "" });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.wallet.trim()) newErrors.wallet = "Dompet wajib dipilih.";
    if (!form.description.trim()) newErrors.description = "Deskripsi wajib diisi.";
    if (!form.amount.trim() || parseFloat(form.amount.replace(/\./g, "")) <= 0)
      newErrors.amount = "Nominal harus lebih dari 0.";
    if (!form.currency.trim()) newErrors.currency = "Mata uang wajib dipilih.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    if (!user) return;
    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setLoading(false);
        return;
      }

      if (!editingId) {
        await addDoc(collection(db, "users", user.uid, "incomes"), {
          ...form,
          amount: parsedAmount,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(parsedAmount),
        });
      } else {
        const old = incomes.find((i) => i.id === editingId);
        if (!old) return;

        await updateDoc(doc(db, "users", user.uid, "incomes", editingId), {
          description: form.description,
          amount: parsedAmount,
          wallet: form.wallet,
          currency: form.currency,
          editHistory: arrayUnion({
            description: old.description,
            amount: old.amount,
            editedAt: new Date(),
          }),
        });

        const diff = parsedAmount - old.amount;
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(diff),
        });
      }

      setForm({ wallet: "", description: "", amount: "", currency: "" });
      setEditingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("Gagal menyimpan pemasukan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: IncomeEntry) => {
    setForm({
      wallet: item.wallet,
      description: item.description,
      amount: item.amount.toString(),
      currency: item.currency,
    });
    setEditingId(item.id || null);
  };

  const handleDelete = async (id: string, amount: number, wallet: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "incomes", id));
    await updateDoc(doc(db, "users", user.uid, "wallets", wallet), {
      balance: increment(-amount),
    });
  };

  const getWalletName = (id: string) => wallets.find((w) => w.id === id)?.name || "Dompet tidak ditemukan";
  const getWalletBalance = (id: string) => wallets.find((w) => w.id === id)?.balance || 0;

  return (
    <LayoutShell>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {editingId ? "Edit Pemasukan" : "Tambah Pemasukan"}
        </h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg border border-green-300 dark:border-green-700 animate-in fade-in duration-300">
            ✅ {editingId ? "Pemasukan diperbarui!" : "Pemasukan disimpan!"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
          <div>
            <label className="block mb-1 text-sm font-medium">Pilih Dompet</label>
            <select
              name="wallet"
              value={form.wallet}
              onChange={handleWalletChange}
              className={`w-full rounded border px-4 py-2 dark:bg-gray-800 dark:text-white ${
                errors.wallet && "border-red-500"
              }`}
            >
              <option value="">-- Pilih Dompet --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.wallet && <p className="text-red-500 text-sm mt-1">{errors.wallet}</p>}

            {form.wallet && (
              <div
                className="mt-4 rounded-xl text-white p-4 shadow w-full"
                style={getCardStyle(wallets.find((w) => w.id === form.wallet)!)}
              >
                <h3 className="text-sm font-semibold truncate">
                  {getWalletName(form.wallet)}
                </h3>
                <p className="text-lg font-bold mt-1">
                  {formatCurrency(getWalletBalance(form.wallet), form.currency)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Deskripsi</label>
            <input
              ref={descriptionRef}
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`w-full rounded border px-4 py-2 dark:bg-gray-800 dark:text-white ${
                errors.description && "border-red-500"
              }`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Nominal</label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className={`w-full rounded border px-4 py-2 dark:bg-gray-800 dark:text-white ${
                errors.amount && "border-red-500"
              }`}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Mata Uang</label>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded text-gray-700 dark:text-white">
              {form.currency || "Mata uang otomatis"}
            </div>
            {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
          </div>

          <div className="flex justify-between items-center">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ wallet: "", description: "", amount: "", currency: "" });
                  setEditingId(null);
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Batal Edit
              </button>
            )}

            <div className="flex gap-2">
              {/* Tombol Simpan (submit form) */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
              </button>

              {/* Tombol Simpan & Lanjut (hanya saat TAMBAH, bukan saat edit) */}
              {!editingId && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    const validation = validate();
                    const { wallet, currency } = form;

                    if (!wallet || !currency) {
                      setErrors((prev) => ({
                        ...prev,
                        wallet: wallet ? "" : "Dompet wajib dipilih.",
                        currency: currency ? "" : "Mata uang wajib dipilih.",
                      }));
                      return;
                    }

                    if (!form.description.trim() || !form.amount.trim()) {
                      setErrors({
                        description: !form.description.trim() ? "Deskripsi wajib diisi." : "",
                        amount:
                          !form.amount.trim() || parseFloat(form.amount.replace(/\./g, "")) <= 0
                            ? "Nominal harus lebih dari 0."
                            : "",
                      });
                      return;
                    }

                    if (!user) return;
                    setLoading(true);

                    try {
                      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
                      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
                        setLoading(false);
                        return;
                      }

                      await addDoc(collection(db, "users", user.uid, "incomes"), {
                        wallet,
                        currency,
                        description: form.description,
                        amount: parsedAmount,
                        createdAt: serverTimestamp(),
                      });

                      await updateDoc(doc(db, "users", user.uid, "wallets", wallet), {
                        balance: increment(parsedAmount),
                      });

                      // Reset hanya deskripsi dan nominal, lalu fokus ke deskripsi
                      setForm({ wallet, currency, description: "", amount: "" });
                      setTimeout(() => descriptionRef.current?.focus(), 50);
                    } catch (err) {
                      console.error("❌ Gagal simpan & lanjut:", err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  Simpan & Lanjut
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Transaksi Terbaru</h2>
          {incomes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Belum ada pemasukan.</p>
          ) : (
            <div className="space-y-4">
              {incomes.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {entry.createdAt?.toDate
                        ? new Date(entry.createdAt.toDate()).toLocaleString("id-ID")
                        : "-"}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {getWalletName(entry.wallet)} · {entry.currency}
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(entry.amount, entry.currency)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-xs">
                      {entry.description}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id!, entry.amount, entry.wallet)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </LayoutShell>
  );
};

export default IncomePage;