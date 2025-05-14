// pages/admin/AdminSettings.tsx (rebuild dengan pageKeys lengkap)
import React, { useEffect, useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

interface PageLock {
  locked: boolean;
  message?: string;
}

const pageKeys = ["wallet", "income", "outcome", "transfer", "history"];

export default function AdminSettings() {
  const { user } = useAuth();
  const [pageLocks, setPageLocks] = useState<Record<string, PageLock>>({});

  useEffect(() => {
    const fetchLocks = async () => {
      if (!user) return;
      const ref = doc(db, "users", "kJ2inCI7zWRnJcdQtfAUOUkFJqr1");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setPageLocks(data.pageLocks || {});
      }
    };
    fetchLocks();
  }, [user]);

  const handleChange = (key: string, field: keyof PageLock, value: any) => {
    setPageLocks((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const saveChanges = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { pageLocks }, { merge: true });
    toast.success("Pengaturan disimpan!");
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto p-4 text-white">
        <h1 className="text-2xl font-bold mb-6">⚙️ Pengaturan Lock Halaman</h1>

        {pageKeys.map((key) => (
          <div key={key} className="mb-6 border-b border-gray-700 pb-4">
            <h2 className="font-semibold capitalize">{key} Page</h2>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={pageLocks[key]?.locked || false}
                onChange={(e) => handleChange(key, "locked", e.target.checked)}
              />
              Kunci halaman ini
            </label>
            <textarea
              placeholder="Pesan pengumuman (opsional)"
              className="mt-2 w-full border border-gray-600 bg-black text-white p-2 rounded text-sm"
              value={pageLocks[key]?.message || ""}
              onChange={(e) => handleChange(key, "message", e.target.value)}
            />
          </div>
        ))}

        <button
          onClick={saveChanges}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Simpan Perubahan
        </button>
      </div>
    </AdminLayout>
  );
}