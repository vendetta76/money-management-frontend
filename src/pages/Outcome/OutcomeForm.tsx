import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebaseClient";
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  onSnapshot,
  query,
  orderBy,
  doc,
} from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "./helpers/formatCurrency";
import { getCardStyle } from "./helpers/getCardStyle";
import { WalletEntry, OutcomeEntry } from "./types";

interface OutcomeFormProps {
  presetWalletId?: string; // Prop untuk WalletPopupHistory
  onClose?: () => void; // Prop untuk menutup form dari WalletPopupHistory
}

const OutcomeForm: React.FC<OutcomeFormProps> = ({ presetWalletId, onClose }) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([]);
  const [form, setForm] = useState({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const descriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const walletRef = collection(db, "users", user.uid, "wallets");
    const unsubWallets = onSnapshot(walletRef, (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WalletEntry[]);
    });
    const outcomeRef = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"));
    const unsubOutcomes = onSnapshot(outcomeRef, (snap) => {
      setOutcomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as OutcomeEntry[]);
    });
    return () => {
      unsubWallets();
      unsubOutcomes();
    };
  }, [user]);

  useEffect(() => {
    if (presetWalletId) {
      const selected = wallets.find((w) => w.id === presetWalletId);
      setForm((prev) => ({
        ...prev,
        wallet: presetWalletId,
        currency: selected?.currency || "",
      }));
    }
  }, [presetWalletId, wallets]);

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
      if (e.key === "Escape") {
        setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
        setEditingId(null);
        setErrors({});
        if (onClose) onClose();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [form, editingId, presetWalletId, onClose]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.wallet.trim()) e.wallet = "Dompet wajib dipilih.";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi.";
    if (!form.amount.trim() || parseFloat(form.amount.replace(/\./g, "")) <= 0)
      e.amount = "Nominal harus lebih dari 0.";
    if (!form.currency.trim()) e.currency = "Mata uang wajib dipilih.";
    return e;
  };

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
    const selected = wallets.find((w) => w.id === e.target.value);
    setForm({
      ...form,
      wallet: e.target.value,
      currency: selected?.currency || "",
    });
    setErrors({ ...errors, wallet: "", currency: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;
    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      const selectedWallet = wallets.find((w) => w.id === form.wallet);
      if (selectedWallet && selectedWallet.balance < parsedAmount) {
        alert("Saldo tidak cukup.");
        setLoading(false);
        return;
      }

      if (!editingId) {
        // Menggunakan logika dari handleAddOutcome
        const outcomeData = {
          amount: parsedAmount,
          description: form.description,
          wallet: form.wallet,
          currency: form.currency,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "users", user.uid, "outcomes"), outcomeData);
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(-parsedAmount),
        });
      } else {
        // Logika edit dari versi lengkap
        const old = outcomes.find((o) => o.id === editingId);
        if (!old) return;
        await updateDoc(doc(db, "users", user.uid, "outcomes", editingId), {
          description: form.description,
          amount: parsedAmount,
          wallet: form.wallet,
          currency: form.currency,
        });
        const diff = parsedAmount - old.amount;
        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(-diff),
        });
      }

      setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: form.currency });
      setEditingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      if (onClose) onClose();
    } catch (err) {
      console.error("❌ Gagal simpan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSubmit = async () => {
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;
    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      const selectedWallet = wallets.find((w) => w.id === form.wallet);
      if (selectedWallet && selectedWallet.balance < parsedAmount) {
        alert("Saldo tidak cukup.");
        setLoading(false);
        return;
      }

      // Menggunakan logika dari handleAddOutcome
      const outcomeData = {
        amount: parsedAmount,
        description: form.description,
        wallet: form.wallet,
        currency: form.currency,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", user.uid, "outcomes"), outcomeData);
      await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
        balance: increment(-parsedAmount),
      });

      setForm({ wallet: form.wallet, description: "", amount: "", currency: form.currency });
      setTimeout(() => descriptionRef.current?.focus(), 50);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("❌ Gagal simpan & lanjut:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
    setEditingId(null);
    setErrors({});
    if (onClose) onClose();
  };

  const getWalletName = (id: string) => wallets.find((w) => w.id === id)?.name || "Dompet tidak ditemukan";
  const getWalletBalance = (id: string) => wallets.find((w) => w.id === id)?.balance || 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
      </h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg border border-green-300 dark:border-green-700 animate-in fade-in duration-300">
          ✅ {editingId ? "Pengeluaran diperbarui!" : "Pengeluaran disimpan!"}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl shadow w-full">
        <div>
          <label className="block mb-1 text-sm font-medium">Pilih Dompet</label>
          <select
            name="wallet"
            value={form.wallet}
            onChange={handleWalletChange}
            disabled={!!presetWalletId} // Nonaktifkan jika presetWalletId ada
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
              <h3 className="text-sm font-semibold truncate">{getWalletName(form.wallet)}</h3>
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
              onClick={resetForm}
              className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              Batal Edit
            </button>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
            </button>

            {!editingId && (
              <button
                type="button"
                disabled={loading}
                onClick={handleQuickSubmit}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                Simpan & Lanjut
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default OutcomeForm;