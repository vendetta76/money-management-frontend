import React from "react";

interface Wallet {
  id: string;
  name: string;
}

interface Props {
  wallets: Wallet[];
  colors?: string[];
}

const DEFAULT_COLORS = ['#10B981', '#EF4444', '#6366F1', '#F59E0B', '#06B6D4'];

const WalletLegend: React.FC<Props> = ({ wallets, colors = DEFAULT_COLORS }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {wallets.map((wallet, index) => (
        <div key={wallet.id} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
          ></span>
          <span className="text-sm text-gray-600">{wallet.name}</span>
        </div>
      ))}
    </div>
  );
};

export default WalletLegend;