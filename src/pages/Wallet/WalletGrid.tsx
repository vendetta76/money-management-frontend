import React, { useState, useEffect } from "react";
import WalletCard from "./WalletCard";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";
import useIsMobile from "../../hooks/useIsMobile";
import { archiveWallet } from "@/lib/archiveWallet";
import { toast } from "react-hot-toast";

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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
  userId,
  wallets,
  showBalance,
  onEdit,
  onCardClick,
}) => {
  const isMobile = useIsMobile();
  const [items, setItems] = useState<string[]>(wallets.map((w) => w.id));

  useEffect(() => {
    setItems(wallets.map((w) => w.id));
  }, [wallets]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      await setDoc(doc(db, "users", userId), { walletOrder: newItems }, { merge: true });
    }
  };

  // Note: handleDelete is retained for reference but not used in this component.
  // Assume it's implemented in the edit modal via onEdit.
  const handleDelete = async (wallet: WalletEntry) => {
    if (wallet.balance !== 0) {
      toast.error("Saldo wallet masih ada. Kosongkan dulu sebelum menghapus.");
      return;
    }
    try {
      await archiveWallet(userId, wallet.id);
      toast.success("Dompet berhasil dihapus.");
    } catch {
      toast.error("Gagal menghapus dompet.");
    }
  };

  const GridContent = () => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {items.map((id) => {
        const wallet = wallets.find((w) => w.id === id);
        if (!wallet) return null;

        if (isMobile) {
          return (
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
          );
        } else {
          return (
            <SortableWalletCard
              key={wallet.id}
              wallet={wallet}
              showBalance={showBalance}
              onEdit={onEdit}
              onClick={onCardClick}
            />
          );
        }
      })}
    </div>
  );

  if (isMobile) {
    return <GridContent />;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <GridContent />
      </SortableContext>
    </DndContext>
  );
};

export default WalletGrid;