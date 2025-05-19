import { doc, updateDoc, increment, deleteDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebaseClient";
import { toast } from "react-hot-toast";
import { TransferEntry, WalletEntry } from "./transferTypes";

export const formatAmountWithThousandSeparator = (value: string): string => {
  // Clean the input to only allow digits, dots, and commas
  let cleaned = value.replace(/[^0-9.,]/g, "");
  
  // If using Indonesian format with dots for thousand separators and comma for decimal
  const parts = cleaned.split(",");
  
  // Handle the integer part with thousand separators
  const integerPart = parts[0].replace(/\./g, ""); // Remove existing separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Return the formatted number with decimal part if it exists
  if (parts.length > 1) {
    return `${formattedInteger},${parts[1]}`;
  }
  
  return formattedInteger;
};

export const handleDeleteTransfer = async (
  transfer: TransferEntry, 
  userId: string
): Promise<void> => {
  if (!window.confirm(`Anda yakin ingin menghapus transfer ini dari ${transfer.from} ke ${transfer.to}?`)) {
    return;
  }

  try {
    // Revert the balance changes
    const fromRef = doc(db, "users", userId, "wallets", transfer.fromWalletId);
    const toRef = doc(db, "users", userId, "wallets", transfer.toWalletId);
    
    await updateDoc(fromRef, { 
      balance: increment(transfer.amount) 
    });
    
    await updateDoc(toRef, { 
      balance: increment(-transfer.amount) 
    });
    
    // Delete the transfer document
    await deleteDoc(doc(db, "users", userId, "transfers", transfer.id));
    
    toast.success("Transfer berhasil dihapus");
  } catch (err: any) {
    toast.error("Gagal menghapus transfer: " + err.message);
  }
};

export const handleEditTransfer = (
  transfer: TransferEntry,
  setEditingTransfer: (transfer: TransferEntry | null) => void,
  setFromWalletId: (id: string) => void,
  setToWalletId: (id: string) => void,
  setAmount: (amount: string) => void,
  setDescription: (desc: string) => void
): void => {
  setEditingTransfer(transfer);
  setFromWalletId(transfer.fromWalletId);
  setToWalletId(transfer.toWalletId);
  
  // Format the amount with thousand separators
  const formattedAmount = formatAmountWithThousandSeparator(transfer.amount.toString());
  setAmount(formattedAmount);
  
  setDescription(transfer.description);
};

export const processTransfer = async (
  userId: string,
  fromWalletId: string,
  toWalletId: string,
  amount: string,
  description: string,
  wallets: WalletEntry[],
  editingTransfer: TransferEntry | null,
  resetForm: () => void,
): Promise<void> => {
  // Parse amount by removing thousand separators and converting comma to dot
  const parsedAmount = Number(amount.replace(/\./g, "").replace(",", "."));
  
  if (!fromWalletId || !toWalletId || parsedAmount <= 0 || !description.trim()) {
    toast.error("Lengkapi semua field dan jumlah harus valid");
    return;
  }
  if (fromWalletId === toWalletId) {
    toast.error("Dompet asal dan tujuan tidak boleh sama");
    return;
  }

  try {
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);
    if (!fromWallet || !toWallet) throw new Error("Wallet tidak ditemukan");
    if (fromWallet.currency !== toWallet.currency) {
      toast.error("Hanya bisa transfer antar dompet dengan mata uang yang sama");
      return;
    }
    if (fromWallet.balance < parsedAmount) {
      toast.error("Saldo tidak cukup untuk transfer ini");
      return;
    }

    const fromRef = doc(db, "users", userId, "wallets", fromWalletId);
    const toRef = doc(db, "users", userId, "wallets", toWalletId);

    if (editingTransfer) {
      const previousAmount = editingTransfer.amount;
      const rollbackBalance = fromWallet.balance + previousAmount;
      if (rollbackBalance < parsedAmount) {
        toast.error("Saldo tidak cukup untuk memperbarui transfer");
        return;
      }
      const prevFromRef = doc(db, "users", userId, "wallets", editingTransfer.fromWalletId);
      const prevToRef = doc(db, "users", userId, "wallets", editingTransfer.toWalletId);

      await updateDoc(prevFromRef, { balance: increment(previousAmount) });
      await updateDoc(prevToRef, { balance: increment(-previousAmount) });
      await updateDoc(fromRef, { balance: increment(-parsedAmount) });
      await updateDoc(toRef, { balance: increment(parsedAmount) });

      await updateDoc(doc(db, "users", userId, "transfers", editingTransfer.id), {
        from: fromWallet.name,
        to: toWallet.name,
        fromWalletId,
        toWalletId,
        wallet: fromWalletId,
        type: "transfer",
        amount: parsedAmount,
        currency: fromWallet.currency,
        description,
      });

      toast.success("Transfer diperbarui");
    } else {
      await updateDoc(fromRef, { balance: increment(-parsedAmount) });
      await updateDoc(toRef, { balance: increment(parsedAmount) });
      await addDoc(collection(db, "users", userId, "transfers"), {
        from: fromWallet.name,
        to: toWallet.name,
        fromWalletId,
        toWalletId,
        wallet: fromWalletId,
        type: "transfer",
        amount: parsedAmount,
        currency: fromWallet.currency,
        description,
        createdAt: serverTimestamp(),
      });
      toast.success("Transfer berhasil!");
    }

    resetForm();
  } catch (err: any) {
    toast.error("Gagal transfer: " + err.message);
  }
};