import { formatCurrency } from "../helpers/formatCurrency";
import React from "react";
import CountUp from "react-countup";

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
            className="bg-white dark:bg-zinc-800 shadow-md rounded-lg p-4 border-t-4 border-indigo-500 hover:shadow-lg transition"
          >
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">
              {currency}
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {showBalance ? (
                <CountUp
                  end={total}
                  duration={1.2}
                  separator="," 
                  decimals={0}
                  prefix={formatCurrency(0, currency).replace(/\d+([.,]\d+)?/, "")} // ambil prefix symbol aja
                />
              ) : (
                "••••••"
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletTotalOverview;