import React, { useEffect, useState } from "react";
import WalletCard from "./WalletCard";
import { PlusCircle } from "lucide-react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebaseClient";

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
    attributes,
    listeners,
    setNodeRef,
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
  isMobile = false,
}) => {
  const [items, setItems] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));

  useEffect(() => {
    if (!userId || wallets.length === 0) return;
    const ref = doc(db, "users", userId);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const savedOrder = data.walletOrder || [];
        const validIds = savedOrder.filter((id: string) => id in walletMap);
        const remaining = wallets.map((w) => w.id).filter((id) => !validIds.includes(id));
        setItems([...validIds, ...remaining]);
      } else {
        setItems(wallets.map((w) => w.id));
      }
    });

    return () => unsubscribe();
  }, [userId, wallets]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        const newOrder = arrayMove(prev, oldIndex, newIndex);

        const ref = doc(db, "users", userId);
        setDoc(ref, { walletOrder: newOrder }, { merge: true });

        return newOrder;
      });
    }
  };

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PlusCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
          Belum ada wallet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Klik tombol "+ Wallet" untuk membuat yang pertama.
        </p>
      </div>
    );
  }

  const sortedWallets = items.map((id) => walletMap[id]).filter(Boolean);

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedWallets.map((wallet) => (
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
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedWallets.map((wallet) => (
            <SortableWalletCard
              key={wallet.id}
              wallet={wallet}
              showBalance={showBalance}
              onEdit={onEdit}
              onClick={onCardClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default WalletGrid;
