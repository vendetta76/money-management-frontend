import React from "react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#10B981', '#EF4444', '#6366F1', '#F59E0B', '#06B6D4'];

interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Props {
  wallets: Wallet[];
  selectedCurrency: string;
}

const WalletPieChart: React.FC<Props> = ({ wallets, selectedCurrency }) => {
  const filteredWallets = selectedCurrency === 'all'
    ? wallets
    : wallets.filter(w => w.currency === selectedCurrency);

  const pieData = filteredWallets.map(wallet => ({ name: wallet.name, value: wallet.balance }));

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow text-gray-800 dark:text-gray-100">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">Distribusi Wallet (Pie)</h2>
      <div className="w-full h-48 overflow-x-auto">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
              {pieData.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {filteredWallets.map((wallet, index) => (
          <div key={wallet.id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{wallet.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WalletPieChart;