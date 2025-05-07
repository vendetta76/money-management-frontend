import { useEffect, useState } from "react";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { maxWalletPerRole } from "../utils/walletLimit";
import LayoutShell from "../layouts/LayoutShell";
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
  setDoc
} from "firebase/firestore";
import { Settings, Plus, X, Eye, EyeOff } from "lucide-react";
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
  { value: "IDR", label: "IDR" },
  { value: "EUR", label: "EUR" },
  { value: "JPY", label: "JPY" },
  { value: "GBP", label: "GBP" },
  { value: "CHF", label: "CHF" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
  { value: "SGD", label: "SGD" },
  { value: "CNY", label: "CNY" },
  { value: "KRW", label: "KRW" },
  { value: "THB", label: "THB" },
  { value: "PHP", label: "PHP" }
];

export default function WalletPage() {
  const { user, userMeta } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("IDR");
  const [editingId, setEditingId] = useState<string | null>(null);
  const maxWallets = maxWalletPerRole(userMeta?.role);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "wallets"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const walletData: WalletEntry[] = [];
      snapshot.forEach((doc) => {
        walletData.push({ id: doc.id, ...(doc.data() as WalletEntry) });
      });
      setWallets(walletData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    if (!editingId && wallets.length >= maxWallets) {
      alert(`🚫 Batas wallet tercapai. ${userMeta?.role === "premium" ? "Premium" : "Regular"} hanya bisa membuat maksimal ${maxWallets} wallet.`);
      return;
    }

    const walletRef = editingId
      ? doc(db, "users", user.uid, "wallets", editingId)
      : doc(collection(db, "users", user.uid, "wallets"));

    const walletData: WalletEntry = {
      name,
      balance,
      currency,
      createdAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(walletRef, walletData);
      } else {
        await setDoc(walletRef, walletData);
      }

      setName("");
      setBalance(0);
      setCurrency("IDR");
      setEditingId(null);
    } catch (error) {
      alert("❌ Gagal menyimpan wallet.");
    }
  };

  const handleEdit = (wallet: WalletEntry) => {
    setName(wallet.name);
    setBalance(wallet.balance);
    setCurrency(wallet.currency);
    setEditingId(wallet.id || null);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!user || !id) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "wallets", id));
    } catch {
      alert("❌ Gagal menghapus wallet.");
    }
  };

  return (
    <LayoutShell>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dompet Saya</h1>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <div className="mb-2">
              <input
                className="w-full p-2 border rounded"
                placeholder="Nama Dompet"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Saldo"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
              />
            </div>
            <div className="mb-4">
              <Select
                options={currencyOptions}
                value={currencyOptions.find((opt) => opt.value === currency)}
                onChange={(opt) => setCurrency(opt?.value || "IDR")}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            >
              {editingId ? "Update Wallet" : "Tambah Wallet"}
            </button>
          </div>

          <div className="space-y-2">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{wallet.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {wallet.balance} {wallet.currency}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(wallet)} className="text-blue-500">Edit</button>
                  <button onClick={() => handleDelete(wallet.id)} className="text-red-500">Hapus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
