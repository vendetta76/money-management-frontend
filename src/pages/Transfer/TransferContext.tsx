import React, { createContext, useState, useEffect, useContext } from "react";
import { db } from "../../../lib/firebaseClient";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { WalletEntry, TransferEntry } from "./transferTypes";

interface TransferContextType {
  wallets: WalletEntry[];
  transferHistory: TransferEntry[];
  fromWalletId: string;
  toWalletId: string;
  amount: string;
  description: string;
  editingTransfer: TransferEntry | null;
  setFromWalletId: (id: string) => void;
  setToWalletId: (id: string) => void;
  setAmount: (amount: string) => void;
  setDescription: (desc: string) => void;
  setEditingTransfer: (transfer: TransferEntry | null) => void;
  resetForm: () => void;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export const TransferProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferEntry[]>([]);
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [editingTransfer, setEditingTransfer] = useState<TransferEntry | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubWallets = onSnapshot(
      collection(db, "users", user.uid, "wallets"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WalletEntry[];
        setWallets(data.filter(w => w.status !== "archived"));
      }
    );

    const transferQuery = query(
      collection(db, "users", user.uid, "transfers"),
      orderBy("createdAt", "desc")
    );

    const unsubTransfer = onSnapshot(transferQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TransferEntry[];
      setTransferHistory(data);
    });

    return () => {
      unsubWallets();
      unsubTransfer();
    };
  }, [user]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setFromWalletId("");
    setToWalletId("");
    setEditingTransfer(null);
  };

  return (
    <TransferContext.Provider
      value={{
        wallets,
        transferHistory,
        fromWalletId,
        toWalletId,
        amount,
        description,
        editingTransfer,
        setFromWalletId,
        setToWalletId,
        setAmount,
        setDescription,
        setEditingTransfer,
        resetForm,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
};

export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error("useTransfer must be used within a TransferProvider");
  }
  return context;
};