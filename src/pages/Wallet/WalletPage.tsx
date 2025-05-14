import React, { useEffect, useState, useRef } from "react";
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
import { db } from "../../lib/firebaseClient";
import { useAuth } from "../../context/AuthContext";
import { usePinLock } from "../../context/PinLockContext";
import LayoutShell from "../../layouts/LayoutShell";
import { Plus, X, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { fixAllWalletBalances } from "../../utils/fixWallet";
import WalletPopupHistory from "../../components/WalletPopupHistory";
import WalletTotalOverview from "./WalletTotalOverview";
import WalletGrid from "./WalletGrid";
import WalletFormModal from "./WalletFormModal";
import { useIsBypassed } from "../../hooks/useIsBypassed";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";

const allowedRecalcEmails = [
  "diorvendetta76@gmail.com",
  "joeverson.kamantha@gmail.com"
];

interface WalletEntry {
  id?: string;
  name: string;
  balance: number;
  currency: string;
  createdAt?: any;
  colorStyle: "solid" | "gradient";
  colorValue: string | { start: string; end: string };
}

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userMeta } = useAuth();
  const { locked: pinLocked, unlock, lock, pin } = usePinLock();
  const { locked, message, isBypassed, userMeta: bypassedUserMeta } = useIsBypassed("wallet");
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [walletOrder, setWalletOrder] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletEntry | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<{ id: string; name: string; style: React.CSSProperties } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinLockVisible, setPinLockVisible] = useState(true);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!pinLocked) setPinLockVisible(false);
    if (pinLockVisible && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [pinLocked, pinLockVisible]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "wallets"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setWallets(
        snap.docs.map((d) => {
          const data = d.data() as WalletEntry;
          return {
            id: d.id,
            name: data.name,
            balance: data.balance ?? 0,
            currency: data.currency,
            createdAt: data.createdAt,
            colorStyle: data.colorStyle || "gradient",
            colorValue: data.colorValue || { start: "#9333ea", end: "#4f46e5" },
          };
        })
      );
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setWalletOrder(snap.data().walletOrder || []);
      }
    });
  }, [user]);

  const handleUnlock = () => {
    const ok = unlock(enteredPin);
    if (ok) {
      setEnteredPin("");
      setPinError("");
      setPinLockVisible(false);
      toast.success("PIN berhasil dibuka!");
    } else {
      setPinError("PIN salah!");
      toast.error("PIN salah!");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
    }
  };

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id!, w]));
  const orderedWallets = [
    ...walletOrder.map((id) => walletMap[id]).filter(Boolean),
    ...wallets.filter((w) => !walletOrder.includes(w.id!))
  ];

  const totalsByCurrency = orderedWallets.reduce((acc, w) => {
    acc[w.currency] = (acc[w.currency] || 0) + w.balance;
    return acc;
  }, {} as Record<string, number>);

  return (
    <LayoutShell>
      <main className={`relative min-h-screen px-4 sm:px-6 py-6 max-w-6xl mx-auto transition-all duration-300 ${pinLockVisible || (locked && !isBypassed) ? "blur-md pointer-events-none" : ""}`}>
        {(locked && !isBypassed) && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={userMeta?.role || ""}
              bypassFor={["Admin", "Staff", "Tester"]}
            />
          </div>
        )}
        {pinLockVisible && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Masukkan PIN</h2>
                <button onClick={() => navigate("/")}><X size={20} /></button>
              </div>
              <input
                ref={pinInputRef}
                type="password"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter PIN"
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
              {pinError && <p className="text-red-500 text-sm mt-2">{pinError}</p>}
              <button
                onClick={handleUnlock}
                className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                Unlock
              </button>
            </div>
          </div>
        )}

        <div className={(locked && !isBypassed) || pinLockVisible ? "pointer-events-none blur-sm" : "relative z-10"}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">Dompet Saya</h1>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-sm underline flex items-center gap-1"
              >
                {showBalance ? <EyeOff size={16} /> : <Eye size={16} />} {showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
              </button>
              {allowedRecalcEmails.includes(user?.email || "") && (
                <button
                  onClick={() => fixAllWalletBalances(user!.uid).then(() => toast.success("Rekalkulasi selesai!"))}
                  className="text-sm border px-3 py-1 rounded"
                >🔁 Rekalkulasi</button>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm sm:text-base flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Wallet
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <>
              <WalletTotalOverview totalsByCurrency={totalsByCurrency} showBalance={showBalance} />
              <WalletGrid
                userId={user?.uid || ""}
                wallets={orderedWallets}
                showBalance={showBalance}
                isMobile={isMobile}
                onEdit={(id) => setEditingWallet(walletMap[id])}
                onCardClick={(id) => setSelectedWallet({ id, name: walletMap[id].name, style: {} })}
              />
            </>
          )}
        </div>
      </main>

      <WalletFormModal
        isOpen={showForm || !!editingWallet}
        form={editingWallet ?? {
          name: "",
          balance: "0",
          currency: "USD",
          colorStyle: "gradient",
          colorValue: { start: "#9333ea", end: "#4f46e5" },
        }}
        errors={{}}
        editing={!!editingWallet}
        onClose={() => {
          setShowForm(false);
          setEditingWallet(null);
        }}
        onChange={() => {}}
        onSubmit={() => {}}
        currencyOptions={[]}
        colorStyleOptions={[]}
      />

      {selectedWallet && (
        <WalletPopupHistory
          walletId={selectedWallet?.id ?? ""}
          walletName={selectedWallet?.name ?? ""}
          cardStyle={selectedWallet?.style ?? {}}
          isOpen={!!selectedWallet}
          onClose={() => setSelectedWallet(null)}
        />
      )}
    </LayoutShell>
  );
};

export default WalletPage;