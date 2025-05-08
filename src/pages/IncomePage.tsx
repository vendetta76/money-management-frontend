import { useState, useEffect } from "react";
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
import { Pencil, Trash } from "lucide-react";

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
}

const IncomePage = () => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [form, setForm] = useState({ wallet: "", description: "", amount: "", currency: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const unsubIncomes = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IncomeEntry[];
      setIncomes(data);
    });

    const walletRef = collection(db, "users", user.uid, "wallets");
    const unsubWallets = onSnapshot(walletRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WalletEntry[];
      setWallets(data);
    });

    return () => {
      unsubIncomes();
      unsubWallets();
    };
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
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
    if (!form.amount.trim() || parseFloat(form.amount) <= 0) newErrors.amount = "Nominal harus lebih dari 0.";
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
      const parsedAmount = parseFloat(form.amount);

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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <LayoutShell>
      <main className="min-h-screen w-full px-4 sm:px-6 md:px-8 xl:px-12 2xl:px-20 pt-4 max-w-screen-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{editingId ? "Edit Pemasukan" : "Tambah Pemasukan"}</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-300">
            ✅ {editingId ? "Pemasukan diperbarui!" : "Pemasukan disimpan!"}
          </div>
        )}

        {/* FORM PEMASUKAN */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 mb-6 max-w-xl w-full">
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Pilih Dompet</label>
            <select
              name="wallet"
              value={form.wallet}
              onChange={handleWalletChange}
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.wallet && "border-red-500"}`}
            >
              <option value="">-- Pilih Dompet --</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
            {errors.wallet && <p className="text-red-500 text-sm mt-1">{errors.wallet}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Deskripsi</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              type="text"
              placeholder="Tulis deskripsi"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.description && "border-red-500"}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Nominal</label>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none ${errors.amount && "border-red-500"}`}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium">Mata Uang</label>
            <input
              type="text"
              value={form.currency}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-200 text-gray-700"
            />
            {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
          </div>

          <div className="flex justify-between">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({ wallet: "", description: "", amount: "", currency: "" });
                  setEditingId(null);
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Batal Edit
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>

        {/* TRANSAKSI TERBARU */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Transaksi Terbaru</h2>
          {incomes.length === 0 ? (
            <p className="text-gray-500">Belum ada data pemasukan.</p>
          ) : (
            <div className="space-y-4">
              {incomes.map((entry) => (
                <div key={entry.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {entry.createdAt?.toDate ? new Date(entry.createdAt.toDate()).toLocaleString() : "-"}
                    </div>
                    <div className="text-gray-500 dark:text-gray-300">
                      {wallets.find((w) => w.id === entry.wallet)?.name || entry.wallet} &middot; {entry.currency}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatAmount(entry.amount, entry.currency)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-xs">{entry.description}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(entry.id!, entry.amount, entry.wallet)} className="text-red-600 hover:text-red-800">
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