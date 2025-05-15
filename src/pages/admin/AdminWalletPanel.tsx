import { useEffect, useState } from "react";
import {
  collectionGroup,
  onSnapshot,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import LayoutShell from "@/layouts/LayoutShell";
import { format } from "date-fns";

interface Wallet {
  id: string;
  name: string;
  currency: string;
  balance: number;
  status?: string;
  userId?: string;
  color?: string;
  createdAt?: any;
  updatedAt?: any;
}

const AdminWalletPanel = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [userMap, setUserMap] = useState<{ [uid: string]: string }>({});
  const [sortBy, setSortBy] = useState<string>("");

  useEffect(() => {
    const q = collectionGroup(db, "wallets");
    const unsub = onSnapshot(q, async (snap) => {
      const list: Wallet[] = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const userId = docSnap.ref.path.split("/")[1];

        if (!userMap[userId]) {
          const userDoc = await getDoc(doc(db, "users", userId));
          const userName = userDoc.exists() ? userDoc.data().name : "Unknown";
          setUserMap((prev) => ({ ...prev, [userId]: userName }));
        }

        list.push({
          id: docSnap.id,
          userId,
          ...data,
        } as Wallet);
      }

      setWallets(list);
    });
    return () => unsub();
  }, []);

  const handleArchive = async (wallet: Wallet) => {
    const ref = doc(db, `users/${wallet.userId}/wallets/${wallet.id}`);
    await updateDoc(ref, { status: "archived", updatedAt: new Date() });
  };

  const handleDelete = async (wallet: Wallet) => {
    const ref = doc(db, `users/${wallet.userId}/wallets/${wallet.id}`);
    await deleteDoc(ref);
  };

  const sortedWallets = [...wallets].sort((a, b) => {
    switch (sortBy) {
      case "balance-desc":
        return (b.balance || 0) - (a.balance || 0);
      case "balance-asc":
        return (a.balance || 0) - (b.balance || 0);
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "userId-asc":
        return (a.userId || "").localeCompare(b.userId || "");
      default:
        return 0;
    }
  });

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">🗂 Semua Wallet (Admin View)</h1>

        <div className="flex gap-4 mb-6 flex-wrap">
          <select
            className="border p-2 rounded"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Urutkan...</option>
            <option value="balance-desc">Saldo Tertinggi</option>
            <option value="balance-asc">Saldo Terendah</option>
            <option value="name-asc">Nama Wallet (A-Z)</option>
            <option value="userId-asc">User ID (A-Z)</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedWallets.map((w) => (
            <div key={w.id} className="border p-4 rounded-lg shadow bg-white relative">
              <div className="mb-2">
                <strong>{w.name}</strong> — {w.currency}
                <div className="text-sm text-gray-400">
                  👤 {userMap[w.userId || ""] || w.userId}
                </div>
              </div>
              {w.color && (
                <div className="mb-1 text-sm flex items-center gap-2">
                  Warna:
                  <span
                    className="w-5 h-5 rounded-full border"
                    style={{ backgroundColor: w.color }}
                    title={w.color}
                  ></span>
                  <code>{w.color}</code>
                </div>
              )}
              <div className="text-sm text-gray-600">
                💰 Saldo:{" "}
                <strong>
                  {w.balance?.toLocaleString("id-ID", {
                    style: "currency",
                    currency: w.currency || "IDR",
                  })}
                </strong>
              </div>

              <div className="text-xs text-gray-400 mt-2 space-y-1">
                {w.createdAt && (
                  <div>📅 Dibuat: {format(w.createdAt.toDate(), "dd MMM yyyy")}</div>
                )}
                {w.updatedAt && (
                  <div>🕒 Diupdate: {format(w.updatedAt.toDate(), "dd MMM yyyy HH:mm")}</div>
                )}
              </div>

              {w.status === "archived" && (
                <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Archived
                </span>
              )}

              <div className="mt-4 flex gap-2 text-sm">
                <button
                  onClick={() => handleArchive(w)}
                  className="px-3 py-1 rounded bg-yellow-200 hover:bg-yellow-300 text-yellow-900"
                >
                  Arsipkan
                </button>
                <button
                  onClick={() => handleDelete(w)}
                  className="px-3 py-1 rounded bg-red-200 hover:bg-red-300 text-red-900"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
};

export default AdminWalletPanel;