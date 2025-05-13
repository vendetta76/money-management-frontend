import React from "react";
import WalletCard from "./WalletCard";

interface WalletEntry {
  id: string;
  name: string;
  balance: number;
  currency: string;
  colorStyle: "solid" | "gradient";
  colorValue: string | { start: string; end: string };
}

interface WalletGridProps {
  wallets: WalletEntry[];
  showBalance: boolean;
  onEdit: (walletId: string) => void;
  onCardClick: (walletId: string) => void;
}

const WalletGrid: React.FC<WalletGridProps> = ({
  wallets,
  showBalance,
  onEdit,
  onCardClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {wallets.map((wallet) => (
        <WalletCard
          key={wallet.id}
          id={wallet.id}
          name={wallet.name}
          balance={wallet.balance}
          currency={wallet.currency}
          colorStyle={wallet.colorStyle}
          colorValue={wallet.colorValue}
          showBalance={showBalance}
          onEdit={() => onEdit(wallet.id)}
          onClick={() => onCardClick(wallet.id)}
        />
      ))}
    </div>
  );
};

export default WalletGrid;