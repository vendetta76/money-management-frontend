import React from "react";
import WalletCard from "./WalletCard";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface WalletEntry {
  id: string;
  name: string;
  balance: number;
  currency: string;
  colorStyle: "solid" | "gradient";
  colorValue: string | { start: string; end: string };
}

interface WalletGridProps {
  userId: string;
  wallets: WalletEntry[];
  showBalance: boolean;
  onEdit: (walletId: string) => void;
  onCardClick: (walletId: string) => void;
  isMobile?: boolean;
}

const SortableWalletCard: React.FC<{
  wallet: WalletEntry;
  showBalance: boolean;
  onEdit: (id: string) => void;
  onClick: (id: string) => void;
}> = ({ wallet, showBalance, onEdit, onClick }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({ id: wallet.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative group">
      <div {...listeners} className="absolute inset-0 z-0 cursor-move" />
      <WalletCard
        id={wallet.id}
        name={wallet.name}
        balance={wallet.balance}
        currency={wallet.currency}
        colorStyle={wallet.colorStyle}
        colorValue={wallet.colorValue}
        showBalance={showBalance}
        onEdit={() => onEdit(wallet.id)}
        onClick={() => onClick(wallet.id)}
      />
    </div>
  );
};

const WalletGrid: React.FC<WalletGridProps> = ({
  wallets,
  showBalance,
  onEdit,
  onCardClick,
  isMobile = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {wallets.map((wallet) => (
        <SortableWalletCard
          key={wallet.id}
          wallet={wallet}
          showBalance={showBalance}
          onEdit={onEdit}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
};

export default WalletGrid;
