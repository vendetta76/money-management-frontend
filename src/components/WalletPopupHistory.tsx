import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, Repeat2 } from "lucide-react";

interface WalletPopupProps {
  walletId: string;
  walletName: string;
  cardStyle: React.CSSProperties;
  isOpen: boolean;
  onClose: () => void;
}

const WalletPopup: React.FC<WalletPopupProps> = ({ walletId, walletName, cardStyle, isOpen, onClose }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !walletId) return;

    const incomeQuery = query(collection(db, "users", user.uid, "incomes"), orderBy("createdAt", "desc"));
    const outcomeQuery = query(collection(db, "users", user.uid, "outcomes"), orderBy("createdAt", "desc"));
    const transferQuery = collection(db, "users", user.uid, "transfers");

    const unsubIn = onSnapshot(incomeQuery, snapshot => {
      const incomes = snapshot.docs
        .map(doc => ({ id: doc.id, type: "income", ...doc.data() }))
        .filter(tx => tx.wallet === walletId);
      setTransactions(prev => [...prev.filter(tx => tx.type !== "income"), ...incomes]);
    });

    const unsubOut = onSnapshot(outcomeQuery, snapshot => {
      const outcomes = snapshot.docs
        .map(doc => ({ id: doc.id, type: "outcome", ...doc.data() }))
        .filter(tx => tx.wallet === walletId);
      setTransactions(prev => [...prev.filter(tx => tx.type !== "outcome"), ...outcomes]);
    });

    const unsubTransfer = onSnapshot(transferQuery, snapshot => {
      const transfers = snapshot.docs
        .map(doc => ({ id: doc.id, type: "transfer", ...doc.data() }))
        .filter(tx => tx.from === walletId || tx.to === walletId);
      setTransactions(prev => [...prev.filter(tx => tx.type !== "transfer"), ...transfers]);
    });

    return () => {
      unsubIn();
      unsubOut();
      unsubTransfer();
    };
  }, [user, walletId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{walletName}</DialogTitle>
        </DialogHeader>
        <div className="rounded-xl h-32" style={cardStyle} />
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {transactions.length ? transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-2">
                {tx.type === "income" && <ArrowDownCircle className="text-green-500" size={16} />}
                {tx.type === "outcome" && <ArrowUpCircle className="text-red-500" size={16} />}
                {tx.type === "transfer" && <Repeat2 className="text-blue-500" size={16} />}
                <span>{tx.description || "Transfer"}</span>
              </div>
              <span className="font-medium">{tx.currency} {tx.amount.toLocaleString()}</span>
            </div>
          )) : <div className="text-center text-gray-500">Tidak ada transaksi</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletPopup;