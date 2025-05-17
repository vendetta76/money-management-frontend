import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebaseClient";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "../helpers/formatCurrency";
import { getCardStyle } from "../helpers/getCardStyle";
import { WalletEntry, IncomeEntry } from "../helpers/types";
import { toast } from "react-toastify"; // Added for toast notifications

interface IncomeFormProps {
  hideCardPreview?: boolean;
  presetWalletId?: string;
  onClose?: () => void;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ presetWalletId, onClose, hideCardPreview }) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
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
    const incomeRef = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const unsubIncomes = onSnapshot(incomeRef, (snap) => {
      setIncomes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as IncomeEntry[]);
    });
    return () => {
      unsubWallets();
      unsubIncomes();
    };
  }, [user]);

  useEffect(() => {
    if (!presetWalletId || wallets.length === 0) return;
    const selected = wallets.find((w) => w.id === presetWalletId && w.status !== "archived");
    if (selected) {
      setForm((prev) => ({
        ...prev,
        wallet: presetWalletId,
        currency: selected.currency,
      }));
    }
  }, [presetWalletId, wallets.length]);

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
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!loading && descriptionRef.current?.form) {
          descriptionRef.current.form.requestSubmit();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, 


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // izinkan angka, titik, dan koma
      let cleaned = value.replace(/[^0-9.,]/g, "");

      // normalize multiple comma
      const parts = cleaned.split(",");
      if (parts.length > 2) {
        cleaned = parts[0] + "," + parts.slice(1).join("").replace(/,/g, "");
      }

      setForm({ ...form, amount: cleaned });
    } else {
      setForm({ ...form, [name]: value });
    }

    setErrors({ ...errors, [name]: "" });
  };
[form, editingId, loading, presetWalletId, onClose]);

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

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.wallet.trim()) e.wallet = "Dompet wajib dipilih.";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi.";
    if (!form.amount.trim() || parseFloat(form.amount.replace(/\./g, "")) <= 0) e.amount = "Nominal harus lebih dari 0.";
    if (!form.currency.trim()) e.currency = "Mata uang wajib dipilih.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;

    const selectedWallet = wallets.find(w => w.id === form.wallet && w.status !== "archived");
    if (!selectedWallet) {
      toast.error("Dompet sudah dihapus atau diarsipkan.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      if (!editingId) {
        const incomeData = {
          amount: parsedAmount,
          description: form.description,
          wallet: form.wallet,
          currency: form.currency,
          createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "users", user.uid, "incomes"), incomeData);
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

  const handleAddAndContinue = async () => {
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!user) return;

    const selectedWallet = wallets.find(w => w.id === form.wallet && w.status !== "archived");
    if (!selectedWallet) {
      toast.error("Dompet sudah dihapus atau diarsipkan.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const parsedAmount = Number(form.amount.replace(/\./g, "").replace(",", "."));
      if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: "Nominal harus lebih dari 0." });
        setLoading(false);
        return;
      }

      const incomeData = {
        amount: parsedAmount,
        description: form.description,
        wallet: form.wallet,
        currency: form.currency,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", user.uid, "incomes"), incomeData);
      await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
        balance: increment(parsedAmount),
      });

      setForm({ wallet: form.wallet, description: "", amount: "", currency: form.currency });
      setTimeout(() => descriptionRef.current?.focus(), 50);
    } catch (err) {
      console.error("❌ Gagal simpan & lanjut:", err);
    } finally {
      setLoading(false);
    }
  };

  const getWalletName = (id: string) => wallets.find((w) => w.id === id)?.name || "Dompet tidak ditemukan";
  const getWalletBalance = (id: string) => wallets.find((w) => w.id === id)?.balance || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
      <div>
        <label className="block mb-1 text-sm font-medium">Pilih Dompet</label>
        <select
          name="wallet"
          value={form.wallet}
          onChange={handleWalletChange}
          disabled={!!presetWalletId}
          className={`w-full rounded border px-4 py-2 dark:bg-gray-800 dark:text-white ${errors.wallet && "border-red-500"}`}
        >
          <option value="">-- Pilih Dompet --</option>
          {wallets
            .filter(w => w.status !== "archived")
            .map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
        </select>
        {errors.wallet && <p className="text-red-500 text-sm mt-1">{errors.wallet}</p>}

        {form.wallet && !hideCardPreview && (
          (() => {
            const selectedWallet = wallets.find((w) => w.id === form.wallet && w.status !== "archived");
            return selectedWallet ? (
              <div
                className="mt-4 rounded-xl text-white p-4 shadow w-full"
                style={getCardStyle(selectedWallet)}
              >
                <h3 className="text-sm font-semibold truncate">{getWalletName(form.wallet)}</h3>
                <p className="text-lg font-bold mt-1">
                  {formatCurrency(getWalletBalance(form.wallet), form.currency)}
                </p>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-400 my-6 animate-pulse">
                Memuat dompet...
              </div>
            );
          })()
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Deskripsi</label>
        <input
          ref={descriptionRef}
          name="description"
          value={form.description}
          onChange={handleChange}
          className={`w-full rounded border px-4 py-2 dark:bg-gray-800 dark:text-white ${errors.description && "border-red-500"}`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">Nominal</label>
        <input
          name="amount"
          value={form.amount}
          onChange={handleChange}
          className={`w-full rounded border px-4 py-2 dark:bg-gray-800 dark:text-white ${errors.amount && "border-red-500"}`}
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
              setForm({ wallet: presetWalletId || "", description: "", amount: "", currency: "" });
              setEditingId(null);
              if (onClose) onClose();
            }}
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
              onClick={handleAddAndContinue}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Simpan & Lanjut
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default IncomeForm;