import { useState, useEffect } from "react";
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
import LayoutShell from "../layouts/LayoutShell";
import { Pencil, Trash, Loader2 } from "lucide-react";

interface OutcomeEntry {
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

const OutcomePage = () => {
  const { user } = useAuth();
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([]);
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [form, setForm] = useState({ wallet: "", description: "", amount: "", currency: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"));
    const unsubOutcomes = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OutcomeEntry[];
      setOutcomes(data);
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
      unsubOutcomes();
      unsubWallets();
    };
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "amount") {
      const rawValue = value.replace(/[^0-9]/g, "");
      const formattedValue = rawValue
        ? parseInt(rawValue).toLocaleString("id-ID")
        : "";
      setForm({ ...form, [name]: formattedValue });
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
      const parsedAmount = parseFloat(form.amount.replace(/\./g, ""));

      if (!editingId) {
        const selectedWallet = wallets.find((w) => w.id === form.wallet);
        if (selectedWallet && selectedWallet.balance < parsedAmount) {
          alert("Saldo wallet tidak mencukupi.");
          setLoading(false);
          return;
        }

        await addDoc(collection(db, "users", user.uid, "outcomes"), {
          ...form,
          amount: parsedAmount,
          createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(-parsedAmount),
        });
      } else {
        const old = outcomes.find((i) => i.id === editingId);
        if (!old) return;

        const diff = parsedAmount - old.amount;
        const selectedWallet = wallets.find((w) => w.id === form.wallet);
        if (selectedWallet && selectedWallet.balance + old.amount < parsedAmount) {
          alert("Saldo wallet tidak mencukupi.");
          setLoading(false);
          return;
        }

        await updateDoc(doc(db, "users", user.uid, "outcomes", editingId), {
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

        await updateDoc(doc(db, "users", user.uid, "wallets", form.wallet), {
          balance: increment(-diff),
        });
      }

      setForm({ wallet: "", description: "", amount: "", currency: "" });
      setEditingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error("Gagal menyimpan pengeluaran:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: OutcomeEntry) => {
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
    await deleteDoc(doc(db, "users", user.uid, "outcomes", id));
    await updateDoc(doc(db, "users", user.uid, "wallets", wallet), {
      balance: increment(amount),
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
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
        </h1>

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg border border-green-300 dark:border-green-700 animate-in fade-in duration-300">
            ✅ {editingId ? "Pengeluaran diperbarui!" : "Pengeluaran disimpan!"}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 mb-6 max-w-xl w-full"
        >
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Pilih Dompet
            </label>
            <select
              name="wallet"
              value={form.wallet}
              onChange={handleWalletChange}
              className={`w-full px-4 py-2 border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.wallet && "border-red-500 dark:border-red-400"
              }`}
            >
              <option value="" className="dark:bg-gray-800 dark:text-white">
                -- Pilih Dompet --
              </option>
              {wallets.map((wallet) => (
                <option
                  key={wallet.id}
                  value={wallet.id}
                  className="dark:bg-gray-800 dark:text-white"
                >
                  {wallet.name}
                </option>
              ))}
            </select>
            {errors.wallet && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.wallet}
              </p>
            )}
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`peer w-full border bg-transparent px-3 pt-5 pb-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  errors.description && "border-red-500 dark:border-red-400"
                }`}
                placeholder=" "
              />
              <label
                className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-xs peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-500 transition-all`}
              >
                Deskripsi
              </label>
            </div>
            {errors.description && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.description}
              </p>
            )}
          </div>

          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className={`px-4 py-2 w-full border rounded-lg bg-transparent focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                  errors.amount && "border-red-500 dark:border-red-400"
                }`}
                placeholder=""
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.amount}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
              Mata Uang
            </label>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
              {form.currency || "Mata uang otomatis"}
            </div>
            {errors.currency && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.currency}
              </p>
            )}
          </div>

          <div className="flex justify-between">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setForm({
                    wallet: "",
                    description: "",
                    amount: "",
                    currency: "",
                  });
                  setEditingId(null);
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                Batal Edit
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Menyimpan..." : editingId ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>

        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Transaksi Terbaru
          </h2>
          {outcomes.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada data pengeluaran.
            </p>
          ) : (
            <div className="space-y-4">
              {outcomes.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="text-sm">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {entry.createdAt?.toDate
                        ? new Date(entry.createdAt.toDate()).toLocaleString()
                        : "-"}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {wallets.find((w) => w.id === entry.wallet)?.name ||
                        entry.wallet}{" "}
                      · {entry.currency}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatAmount(entry.amount, entry.currency)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-xs">
                      {entry.description}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(entry.id!, entry.amount, entry.wallet)
                      }
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

export default OutcomePage;