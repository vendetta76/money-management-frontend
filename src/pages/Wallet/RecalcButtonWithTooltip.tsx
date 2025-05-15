// RecalcButtonWithTooltip.tsx
import React from "react";
import { toast } from "react-hot-toast";
import { recalculateAllWalletBalances } from "../../utils/WalletRecalculator";

interface Props {
  userId: string;
  setLoading: (value: boolean) => void;
  loading: boolean;
}

const RecalcButtonWithTooltip: React.FC<Props> = ({ userId, setLoading, loading }) => {
  const handleClick = async () => {
    const confirmRecalc = window.confirm(
      "Apakah anda yakin ingin melakukan rekalkulasi ulang?\n\nFitur ini dapat menjadi pedang bermata dua dan masih dalam tahap pengembangan oleh Developer. Jika anda ada kendala, Silahkan menghubungi Developer."
    );
    if (!confirmRecalc) return;
    try {
      await recalculateAllWalletBalances(userId, setLoading);
      toast.success("Rekalkulasi selesai!");
    } catch {
      toast.error("Gagal melakukan rekalkulasi");
    }
  };

  return (
    <div className="relative group inline-block">
      <button
        onClick={handleClick}
        className="text-sm border px-3 py-1 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "⏳ Rekalkulasi..." : "⚠️ Rekalkulasi (Eksperimen)"}
      </button>
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
        Fitur eksperimen - gunakan dengan hati-hati
      </div>
    </div>
  );
};

export default RecalcButtonWithTooltip;
