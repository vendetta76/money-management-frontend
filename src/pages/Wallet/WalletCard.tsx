import React, { useRef } from "react";
import { SquarePen } from "lucide-react";

interface WalletCardProps {
  id: string;
  name: string;
  balance: number;
  currency: string;
  colorStyle?: "solid" | "gradient";
  colorValue?: string | { start: string; end: string };
  showBalance: boolean;
  onEdit: () => void;
  onClick: () => void;
  showEdit?: boolean;
}

const getContrastColor = (hex: string) => {
  if (typeof hex !== "string" || !hex.startsWith("#")) return "black";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "black" : "white";
};

const WalletCard: React.FC<WalletCardProps> = ({
  id,
  name,
  balance,
  currency,
  colorStyle = "solid",
  colorValue = "#999999",
  showBalance,
  onEdit,
  onClick,
  showEdit = true,
}) => {
  const pointerDownRef = useRef<number>(0);

  const handlePointerDown = () => {
    pointerDownRef.current = Date.now();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = Date.now() - pointerDownRef.current;
    if ((e.target as HTMLElement).closest("button")) return;
    if (diff < 200) onClick();
  };

  const bgStyle =
    colorStyle === "solid"
      ? { backgroundColor: colorValue as string }
      : {
          background: `linear-gradient(to bottom right, ${
            (colorValue as any)?.start ?? "#9333ea"
          }, ${(colorValue as any)?.end ?? "#4f46e5"})`,
        };

  const contrastColor =
    colorStyle === "solid"
      ? getContrastColor(colorValue as string)
      : getContrastColor((colorValue as any)?.end ?? "#4f46e5");

  return (
    <div
      className="w-full max-w-[320px] aspect-[16/10] rounded-xl shadow-md p-4 transition-transform duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      style={bgStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold truncate" style={{ color: contrastColor }}>
          {name}
        </h3>
        {showEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 rounded hover:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white"
            title={`Edit ${name}`}
          >
            <SquarePen size={16} color={contrastColor} />
          </button>
        )}
      </div>
      <div
        className="mt-auto text-2xl font-bold tracking-widest"
        style={{ color: contrastColor }}
      >
        {showBalance
          ? new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency,
              maximumFractionDigits: 0,
            }).format(balance)
          : "••••••"}
      </div>
    </div>
  );
};

export default WalletCard;