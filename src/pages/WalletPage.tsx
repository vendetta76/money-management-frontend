// src/pages/WalletPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
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
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { Plus, X, Eye, EyeOff, Settings } from "lucide-react";
import Select from "react-select";

interface WalletEntry {
  id?: string;
  name: string;
  balance: number;
  currency: string;
  createdAt?: any;
}

const currencyOptions = [
  { value: "USD", label: "USD" },
  // ... lainnya sama seperti sebelumnya ...
  { value: "MYR", label: "MYR" },
];

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [storedPin, setStoredPin] = useState("");
  const [enteredPin, setEnteredPin] = useState("");
  const [verified, setVerified] = useState(false);
  const [loadingPin, setLoadingPin] = useState(true);
  const [pinError, setPinError] = useState("");

  // Data wallet
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [form, setForm] = useState({ name: "", balance: "0", currency: "USD" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const totalsByCurrency = wallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance;
    return acc;
  }, {} as Record<string, number>);

  // Ambil PIN user sekali saat mount
  useEffect(() => {
    const fetchPin = async () => {
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setStoredPin(data.pin || "");
      }
      setLoadingPin(false);
    };
    fetchPin();
  }, [user]);

  // Cek sessionStorage kalau sudah verifikasi dalam 5 menit
  useEffect(() => {
    const at = Number(sessionStorage.getItem("walletPinVerifiedAt"));
    if (at && Date.now() - at < 5 * 60 * 1000) {
      setVerified(true);
    }
  }, []);

  // Setelah verified, subcribe data wallet
  useEffect(() => {
    if (!verified || !user) return;
    const q = query(
      collection(db, "users", user.uid, "wallets"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setWallets(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as WalletEntry) }))
      );
    });
    return () => unsub();
  }, [verified, user]);

  const handlePinSubmit = () => {
    if (enteredPin === storedPin) {
      sessionStorage.setItem("walletPinVerifiedAt", Date.now().toString());
      setVerified(true);
      setPinError("");
    } else {
      setPinError("PIN salah. Coba lagi.");
    }
  };

  // Validasi form
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
        balance: 0,
        currency: form.currency,
        createdAt: serverTimestamp(),
      };
      if (!editingId) {
        await setDoc(doc(db, "users", user!.uid), {}, { merge: true });
        await addDoc(collection(db, "users", user!.uid, "wallets"), payload);
        setSuccess("Wallet ditambahkan");
      } else {
        await updateDoc(
          doc(db, "users", user!.uid, "wallets", editingId),
          payload
        );
        setSuccess("Wallet diperbarui");
      }
      setForm({ name: "", balance: "0", currency: "USD" });
      setEditingId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (w: WalletEntry) => {
    setForm({ name: w.name, balance: "0", currency: w.currency });
    setEditingId(w.id!);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!window.confirm("Yakin hapus wallet ini?")) return;
    await deleteDoc(doc(db, "users", user!.uid, "wallets", editingId));
    setEditingId(null);
    setShowForm(false);
  };

  // Render: loading PIN
  if (loadingPin) {
    return <div className="p-6 text-center">Loading...</div>;
  }
  // Jika user belum set PIN, langsung tampil Wallet
  if (!storedPin) {
    setVerified(true);
  }
  // Belum verifikasi
  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-sm w-full p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">🔒 Masukkan PIN</h2>
          <input
            type="password"
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            placeholder="PIN Akses"
            maxLength={6}
            className="w-full mb-3 px-4 py-2 border rounded"
          />
          {pinError && (
            <p className="text-red-500 text-sm mb-3">{pinError}</p>
          )}
          <button
            onClick={handlePinSubmit}
            className="w-full bg-purple-600 text-white py-2 rounded"
          >
            Verifikasi
          </button>
        </div>
      </div>
    );
  }

  // Setelah verified: tampil Wallet
  return (
    <LayoutShell>
      <main className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
        {/* Total per currency */}
        <div className="mb-6">
          <h2 className="font-semibold mb-3">
            Total Saldo per Mata Uang
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(totalsByCurrency).map(
              ([curr, tot]) =>
                tot > 0 && (
                  <div
                    key={curr}
                    className="p-4 bg-white rounded-xl shadow"
                  >
                    <div className="flex justify-between">
                      <span>Total {curr}</span>
                      <span>
                        {showBalance
                          ? new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: curr,
                              maximumFractionDigits: 0,
                            }).format(tot)
                          : "••••••"}
                      </span>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
        {/* Daftar Wallet */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Daftar Wallet</h2>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-1 text-sm"
          >
            {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}{" "}
            {showBalance ? "Sembunyikan" : "Tampilkan"} Saldo
          </button>
        </div>
        {wallets.length === 0 ? (
          <p>Belum ada wallet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {wallets.map((w) => (
              <div
                key={w.id}
                className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-5 rounded-xl flex flex-col justify-between"
              >
                <div className="flex justify-between">
                  <h3>{w.name}</h3>
                  <Settings
                    onClick={() => handleEdit(w)}
                    className="cursor-pointer"
                  />
                </div>
                <div className="text-2xl font-bold">
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
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            {success}
          </div>
        )}
        {/* Form Tambah/Edit */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
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
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Nama Wallet"
                  className="w-full px-4 py-2 border rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <Select
                  options={currencyOptions}
                  value={currencyOptions.find(
                    (o) => o.value === form.currency
                  )}
                  onChange={(sel) =>
                    setForm({
                      ...form,
                      currency: sel?.value || "",
                    })
                  }
                  placeholder="Pilih mata uang"
                />
                {errors.currency && (
                  <p className="text-red-500 text-sm">
                    {errors.currency}
                  </p>
                )}
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
      </main>
    </LayoutShell>
  );
};

export default WalletPage;
