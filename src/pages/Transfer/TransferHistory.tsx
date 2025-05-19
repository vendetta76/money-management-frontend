import { formatCurrency } from "../../../helpers/formatCurrency";
import { useTransfer } from "./TransferContext";
import { useAuth } from "../../../context/AuthContext";
import { handleDeleteTransfer, handleEditTransfer } from "./transferUtils";

const TransferHistory: React.FC = () => {
  const { user } = useAuth();
  const {
    transferHistory,
    setEditingTransfer,
    setFromWalletId,
    setToWalletId,
    setAmount,
    setDescription
  } = useTransfer();

  const handleTransferEdit = (entry: any) => {
    if (!user) return;
    handleEditTransfer(
      entry,
      setEditingTransfer,
      setFromWalletId,
      setToWalletId,
      setAmount,
      setDescription
    );
  };

  const handleTransferDelete = async (entry: any) => {
    if (!user) return;
    await handleDeleteTransfer(entry, user.uid);
  };

  if (transferHistory.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Riwayat Transfer Terbaru</h2>
      <div className="space-y-3">
        {transferHistory.map((entry) => (
          <div key={entry.id} className="p-3 rounded border border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-blue-900">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  {entry.from} ➡️ {entry.to}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300">{entry.description}</div>
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-200">
                {formatCurrency(entry.amount, entry.currency)}
              </div>
            </div>
            <div className="flex justify-between items-center mt-1 text-xs text-gray-400 dark:text-gray-300">
              <span>
                {new Date(entry.createdAt?.toDate?.() ?? entry.createdAt).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <div className="space-x-3">
                <button
                  onClick={() => handleTransferEdit(entry)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleTransferDelete(entry)}
                  className="text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransferHistory;