export const formatTanggal = (tanggal?: string | Date): string => {
    if (!tanggal) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(tanggal));
    } catch {
      return "-";
    }
  };
  
  export const formatTanggalWaktu = (tanggal?: string | Date): string => {
    if (!tanggal) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(tanggal));
    } catch {
      return "-";
    }
  };
  