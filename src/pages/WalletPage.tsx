// src/pages/WalletPage.tsx
import React, { useEffect, useState } from 'react';
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
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { db } from '../lib/firebaseClient';
import LayoutShell from '../layouts/LayoutShell';
import { Plus, X, Eye, EyeOff } from 'lucide-react';
import Select from 'react-select';

interface WalletEntry {
  id?: string;
  name: string;
  balance: number;
  currency: string;
  createdAt?: any;
}

const currencyOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'JPY', label: 'JPY' },
  { value: 'IDR', label: 'IDR' },
  { value: 'MYR', label: 'MYR' },
  { value: 'SGD', label: 'SGD' },
  { value: 'THB', label: 'THB' },
  { value: 'KRW', label: 'KRW' },
  { value: 'CNY', label: 'CNY' },
  { value: 'AUD', label: 'AUD' },
  { value: 'CAD', label: 'CAD' },
  { value: 'CHF', label: 'CHF' },
  { value: 'GBP', label: 'GBP' },
  { value: 'PHP', label: 'PHP' },
  { value: 'VND', label: 'VND' },
  { value: 'INR', label: 'INR' },
  { value: 'HKD', label: 'HKD' },
  { value: 'NZD', label: 'NZD' },
];

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [form, setForm] = useState({ name: '', currency: 'USD' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pinRequired, setPinRequired] = useState(false);

  useEffect(() => {
    if (preferences.requirePinOnIdle) {
      const lastAccess = localStorage.getItem('lastWalletAccess');
      const now = Date.now();
      if (!lastAccess || now - parseInt(lastAccess) > preferences.pinIdleTimeoutMs) {
        setPinRequired(true);
      } else {
        localStorage.setItem('lastWalletAccess', now.toString());
      }
    }
  }, [preferences]);

  const handlePinVerified = () => {
    localStorage.setItem('lastWalletAccess', Date.now().toString());
    setPinRequired(false);
  };

  const totalsByCurrency = wallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'wallets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletEntry));
      setWallets(entries);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      balance: 0,
      currency: form.currency,
      createdAt: serverTimestamp(),
    };
    if (!user) return;
    if (editingId) {
      await updateDoc(doc(db, 'users', user.uid, 'wallets', editingId), payload);
    } else {
      await addDoc(collection(db, 'users', user.uid, 'wallets'), payload);
    }
    setForm({ name: '', currency: 'USD' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (entry: WalletEntry) => {
    setForm({ name: entry.name, currency: entry.currency });
    setEditingId(entry.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id?: string) => {
    if (!user || !id) return;
    await deleteDoc(doc(db, 'users', user.uid, 'wallets', id));
  };

  if (pinRequired) {
    return (
      <LayoutShell>
        <div className="text-center mt-20">
          <p className="mb-4">PIN verification required</p>
          <button
            onClick={handlePinVerified}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl">
            Verify PIN (Simulasi)
          </button>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Wallets</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
          onClick={() => setShowForm(!showForm)}>
          <Plus className="inline-block mr-2" size={18} /> {showForm ? 'Close' : 'Add Wallet'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-xl shadow mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Wallet Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
            <Select
              options={currencyOptions}
              value={currencyOptions.find(opt => opt.value === form.currency)}
              onChange={opt => setForm({ ...form, currency: opt?.value || 'USD' })}
            />
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl">
            {editingId ? 'Update Wallet' : 'Add Wallet'}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Total Balances</h2>
        <button onClick={() => setShowBalance(!showBalance)} className="text-gray-600">
          {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(totalsByCurrency).map(([currency, total]) => (
          <div
            key={currency}
            className="bg-white shadow p-4 rounded-xl border hover:shadow-md transition">
            <h3 className="text-lg font-medium">{currency}</h3>
            <p className="text-2xl font-bold mt-2">
              {showBalance ? total.toLocaleString(undefined, { style: 'currency', currency }) : '•••••'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Wallet List</h2>
        <div className="space-y-4">
          {wallets.map(entry => (
            <div
              key={entry.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
              <div>
                <h3 className="font-medium">{entry.name}</h3>
                <p className="text-sm text-gray-500">
                  {entry.currency} – {showBalance ? entry.balance.toLocaleString() : '•••••'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutShell>
  );
};

export default WalletPage;
