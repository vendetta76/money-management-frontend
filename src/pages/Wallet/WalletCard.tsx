import React, { useRef } from "react";
import { SquarePen } from "lucide-react";
import { formatCurrency } from "../helpers/formatCurrency";

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

// Function to determine font size class based on content length
const getFontSizeClass = (balanceText: string): string => {
  const length = balanceText.length;
  
  if (length > 12) return "text-lg"; // Smallest
  if (length > 9) return "text-xl";  // Medium
  return "text-2xl";                 // Default/largest
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
  const safeColorStyle = colorStyle || "solid";
  const safeColorValue = colorValue || "#cccccc";

  const handlePointerDown = () => {
    pointerDownRef.current = Date.now();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = Date.now() - pointerDownRef.current;
    if ((e.target as HTMLElement).closest("button")) return;
    if (diff < 200) onClick();
  };

  const bgStyle =
    safeColorStyle === "solid"
      ? { backgroundColor: safeColorValue as string }
      : {
          background: `linear-gradient(to bottom right, ${
            (safeColorValue as any)?.start ?? "#9333ea"
          }, ${(safeColorValue as any)?.end ?? "#4f46e5"})`,
        };

  const contrastColor =
    safeColorStyle === "solid"
      ? getContrastColor(safeColorValue as string)
      : getContrastColor((safeColorValue as any)?.end ?? "#4f46e5");

  // Format the balance and determine the appropriate font size
  const formattedBalance = showBalance ? formatCurrency(balance, currency) : "••••••";
  const fontSizeClass = getFontSizeClass(formattedBalance);

  return (
    <div
      className="w-full max-w-[320px] aspect-[16/10] rounded-xl shadow-md p-4 transition-transform duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex flex-col justify-between"
      style={bgStyle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold truncate max-w-[85%]" style={{ color: contrastColor }}>
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
        className={`${fontSizeClass} font-bold tracking-tight overflow-hidden text-ellipsis whitespace-nowrap w-full`}
        style={{ color: contrastColor }}
        title={formattedBalance} // Add tooltip on hover
      >
        {formattedBalance}
      </div>
    </div>
  );
};

export default WalletCard;