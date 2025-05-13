import React from "react";

interface WalletTotalOverviewProps {
  totalsByCurrency: Record<string, number>;
  showBalance: boolean;
}

const WalletTotalOverview: React.FC<WalletTotalOverviewProps> = ({
  totalsByCurrency,
  showBalance,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">💰 Total Saldo per Mata Uang</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(totalsByCurrency).map(([currency, total]) => (
          <div
            key={currency}
            className="bg-white shadow-md rounded-lg p-4 border-t-4 border-indigo-500 hover:shadow-lg transition"
          >
            <div className="text-sm text-gray-500 font-medium mb-1">
              {currency}
            </div>
            <div className="text-xl font-bold text-gray-900 tracking-tight">
              {showBalance
                ? new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 0,
                  }).format(total)
                : "••••••"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletTotalOverview;