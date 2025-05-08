import React, { useEffect, useState } from "react";
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

interface WalletEntry {
  id?: string;
  name: string;
  balance: number;
  currency: string;
  createdAt?: any;
  colorType?: "solid" | "gradient";
  colorSolid?: string;
  colorGradient?: [string, string];
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { locked, unlock, lock, pin } = usePinLock();
  const [pinLockVisible, setPinLockVisible] = useState(true);
  const [enteredPin, setEnteredPin] = useState("");
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [form, setForm] = useState({ name: "", balance: "0", currency: "USD" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const [colorType, setColorType] = useState<"solid" | "gradient">("gradient");
  const [colorSolid, setColorSolid] = useState("#6366f1");
  const [colorGradient, setColorGradient] = useState<[string, string]>(["#9333ea", "#4f46e5"]);

  useEffect(() => {
    if (!locked) setPinLockVisible(false);
  }, [locked]);

  const handleUnlock = () => {
    const ok = unlock(enteredPin);
    if (ok) {
      setEnteredPin("");
      setPinLockVisible(false);
      toast.success("PIN berhasil dibuka!");
    } else {
      toast.error("PIN salah!");
    }
  };

  const currencyOptions = [
    "USD","EUR","JPY","IDR","MYR","SGD","THB","KRW","CNY","AUD","CAD","CHF","GBP","PHP","VND","INR","HKD","NZD"
  ].map((cur) => ({ value: cur, label: cur }));

  const totalsByCurrency = wallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "wallets"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setWallets(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
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
      const payload: WalletEntry = {
        name: form.name,
        balance: 0,
        currency: form.currency,
        createdAt: serverTimestamp(),
        colorType,
        colorSolid,
        colorGradient,
      };
      if (!editingId) {
        await addDoc(collection(db, "users", user!.uid, "wallets"), payload);
        toast.success("Wallet ditambahkan");
      } else {
        await updateDoc(doc(db, "users", user!.uid, "wallets", editingId), payload);
        toast.success("Wallet diperbarui");
      }
      setForm({ name: "", balance: "0", currency: "USD" });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      toast.error("Terjadi kesalahan saat menyimpan.");
      console.error(err);
    }
  };

  const handleEdit = (w: WalletEntry) => {
    setForm({ name: w.name, balance: "0", currency: w.currency });
    setEditingId(w.id!);
    setColorType(w.colorType || "gradient");
    setColorSolid(w.colorSolid || "#6366f1");
    setColorGradient(w.colorGradient || ["#9333ea", "#4f46e5"]);
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
      <main className="min-h-screen px-4 py-6 max-w-6xl mx-auto transition-all duration-300">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">💰 Total Saldo per Mata Uang</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <div key={currency} className="bg-white shadow-md rounded-lg p-4 border-t-4 border-indigo-500">
                <div className="text-sm text-gray-500 font-medium mb-1">{currency}</div>
                <div className="text-xl font-bold text-gray-900">
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
            <button onClick={() => setShowBalance(!showBalance)} className="text-sm flex items-center gap-1">
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
              {showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
            </button>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg">
              <Plus size={16} /> Tambah Wallet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="text-white p-5 rounded-2xl relative hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-white/30 transition"
              style={{
                background:
                  w.colorType === "solid"
                    ? w.colorSolid
                    : `linear-gradient(to bottom right, ${w.colorGradient?.[0]}, ${w.colorGradient?.[1]})`,
              }}
            >
              <button
                onClick={() => handleEdit(w)}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 p-1 rounded-md ring-1 ring-white/20"
              >
                <SquarePen size={16} />
              </button>
              <h3 className="text-lg font-semibold truncate">{w.name}</h3>
              <div className="text-2xl font-bold mt-2">
                {showBalance
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: w.currency,
                      maximumFractionDigits: 0,
                    }).format(w.balance)
                  : "••••••"}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl max-w-sm w-full relative">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="absolute top-3 right-3">
                <X size={20} />
              </button>
              <h3 className="mb-4 font-semibold">{editingId ? "Edit Wallet" : "Tambah Wallet"}</h3>
              <div className="mb-3">
                <input
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Wallet"
                  className="w-full px-4 py-2 border rounded"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>
              <div className="mb-4">
                <Select
                  options={currencyOptions}
                  value={currencyOptions.find((o) => o.value === form.currency)}
                  onChange={(sel) => setForm({ ...form, currency: sel?.value || "" })}
                  placeholder="Pilih mata uang"
                />
                {errors.currency && <p className="text-red-500 text-sm">{errors.currency}</p>}
              </div>
              <div className="mb-4">
                <label className="font-medium">Warna Wallet</label>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center space-x-1">
                    <input type="radio" checked={colorType === "solid"} onChange={() => setColorType("solid")} /> <span>Solid</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input type="radio" checked={colorType === "gradient"} onChange={() => setColorType("gradient")} /> <span>Gradient</span>
                  </label>
                </div>
                {colorType === "solid" ? (
                  <input type="color" value={colorSolid} onChange={(e) => setColorSolid(e.target.value)} className="mt-2 w-full h-10" />
                ) : (
                  <div className="mt-2 flex space-x-2">
                    <input type="color" value={colorGradient[0]} onChange={(e) => setColorGradient([e.target.value, colorGradient[1]])} className="w-1/2 h-10" />
                    <input type="color" value={colorGradient[1]} onChange={(e) => setColorGradient([colorGradient[0], e.target.value])} className="w-1/2 h-10" />
                  </div>
                )}
                <div className="mt-3 h-16 rounded-lg border" style={{ background: colorType === "solid" ? colorSolid : `linear-gradient(to right, ${colorGradient[0]}, ${colorGradient[1]})` }} />
              </div>
              <div className="flex justify-between items-center">
                {editingId && <button type="button" onClick={handleDelete} className="text-red-600">Hapus Wallet</button>}
                <button className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? "Simpan" : "Tambah"}</button>
              </div>
            </form>
          </div>
        )}
      </main>

      {pinLockVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
            <h2 className="text-xl font-bold mb-4">Masukkan PIN</h2>
            <input
              type="password"
              className="border rounded w-full px-3 py-2 mb-4"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="PIN"
            />
            <button
              onClick={handleUnlock}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              Buka Kunci
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (!pin) {
            toast.error("PIN belum diset. Silakan atur PIN terlebih dahulu di halaman Security.");
          } else {
            setEnteredPin("");
            setPinLockVisible(true);
          }
        }}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 z-40"
        title="Kunci Dompet"
      >
        <Lock />
      </button>
    </LayoutShell>
  );
};

export default WalletPage;
