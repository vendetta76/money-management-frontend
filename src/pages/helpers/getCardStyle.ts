export const getCardStyle = (wallet?: WalletEntry): React.CSSProperties => {
  if (!wallet || !wallet.colorStyle || !wallet.colorValue) {
    console.warn("⚠️ Wallet rusak atau belum lengkap:", wallet);
    return { backgroundColor: "#ccc" };
  }

  if (wallet.colorStyle === "solid") {
    return {
      backgroundColor: typeof wallet.colorValue === "string" ? wallet.colorValue : "#9333ea",
    };
  }

  if (wallet.colorStyle === "gradient" && typeof wallet.colorValue === "object") {
    return {
      background: `linear-gradient(to bottom right, ${wallet.colorValue.start}, ${wallet.colorValue.end})`,
    };
  }

  return { backgroundColor: "#9333ea" };
};