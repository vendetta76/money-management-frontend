import { formatCurrency } from "../helpers/formatCurrency";
import { useTransfer } from "./TransferContext";
import { useAuth } from "../../context/AuthContext";
import { formatAmountWithThousandSeparator, processTransfer } from "./transferUtils";

const TransferForm: React.FC = () => {
  const { user } = useAuth();
  const {
    wallets,
    fromWalletId,
    toWalletId,
    amount,
    description,
    editingTransfer,
    setFromWalletId,
    setToWalletId,
    setAmount,
    setDescription,
    resetForm,
  } = useTransfer();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatAmountWithThousandSeparator(e.target.value));
  };

  const handleTransfer = async () => {
    if (!user) return;
    await processTransfer(
      user.uid,
      fromWalletId,
      toWalletId,
      amount,
      description,
      wallets,
      editingTransfer,
      resetForm
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dari Dompet</label>
        <select
          value={fromWalletId}
          onChange={(e) => setFromWalletId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
        >
          <option value="">Pilih Dompet</option>
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ke Dompet</label>
        <select
          value={toWalletId}
          onChange={(e) => setToWalletId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
        >
          <option value="">Pilih Dompet</option>
          {wallets.map((wallet) => (
            <option key={wallet.id} value={wallet.id}>
              {wallet.name} ({formatCurrency(wallet.balance, wallet.currency)})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9.,]*"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Masukkan jumlah"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deskripsi *</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Masukkan deskripsi (wajib)"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleTransfer}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {editingTransfer ? "Perbarui Transfer" : "Transfer"}
      </button>
      {editingTransfer && (
        <button
          onClick={resetForm}
          className="w-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white py-2 rounded-md hover:bg-gray-400"
        >
          Batal Edit
        </button>
      )}
    </div>
  );
};

export default TransferForm;
