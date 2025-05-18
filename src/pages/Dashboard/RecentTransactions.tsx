import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { id as localeID } from "date-fns/locale";

interface Props {
  transactions: any[];
  wallets: any[];
  isWalletsLoaded: boolean;
}

const formatRupiah = (amount: number): string => {
  return amount.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
};

const getWalletName = (walletId: string, wallets: any[]): string => {
  const wallet = wallets.find((w) => w.id === walletId);
  return wallet ? wallet.name : `${walletId} (Telah dihapus)`;
};

const RecentTransactions: React.FC<Props> = ({ transactions, wallets, isWalletsLoaded }) => {
  const sortedTx = transactions
    .filter((tx) => tx.createdAt)
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .slice(0, 7);

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow text-sm text-gray-700 dark:text-gray-200">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">Transaksi Terbaru</h3>
      {!isWalletsLoaded ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Memuat dompet...</p>
      ) : sortedTx.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada transaksi.</p>
      ) : (
        <>
          <div className="max-h-[250px] overflow-y-auto pr-1">
            <ul className="space-y-4">
              {sortedTx.map((tx) => {
                const walletName = getWalletName(tx.wallet, wallets);
                return (
                  <li
                    key={tx.id}
                    className="flex justify-between items-start text-sm flex-col sm:flex-row gap-2 sm:gap-0 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition"
                    title={`${tx.type === 'income' ? 'Income' : tx.type === 'outcome' ? 'Outcome' : 'Transfer'}: ${tx.description}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {tx.type === 'income' ? '📥' : tx.type === 'outcome' ? '📤' : '🔁'}
                      </span>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {tx.type === 'transfer'
                            ? `Dari: ${tx.from} → Ke: ${tx.to}`
                            : `Dompet: ${walletName}`} ·{' '}
                          {tx.createdAt?.toDate
                            ? format(new Date(tx.createdAt.toDate()), 'dd MMM yyyy, HH:mm', { locale: localeID })
                            : '-'}
                        </p>
                        {tx.category && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">Kategori: {tx.category}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        tx.type === 'income' ? 'text-green-500' : tx.type === 'outcome' ? 'text-red-500' : 'text-blue-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'outcome' ? '–' : ''} {formatRupiah(tx.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-4 text-right">
            <Link to="/history" className="text-blue-500 text-sm hover:underline">
              Lihat Semua
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default RecentTransactions;