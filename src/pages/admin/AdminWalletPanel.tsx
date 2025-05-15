import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";
import LayoutShell from "../../layouts/LayoutShell";
import { useAuth } from "../../context/AuthContext";

const AdminWalletPanel = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const ref = collection(db, "users", user.uid, "wallets");
    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setWallets(list);
    });
    return () => unsub();
  }, [user?.uid]);

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">🗂 Semua Wallet (Admin View)</h1>
        <div className="space-y-4">
          {wallets.map((w) => (
            <div key={w.id} className="border p-4 rounded shadow-sm bg-white">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <strong>{w.name}</strong> — {w.currency}
                </div>
                {w.status === "archived" && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Archived
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Saldo: {w.balance?.toLocaleString("id-ID") || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
};

export default AdminWalletPanel;
