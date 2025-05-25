// Edit entry interface for history tracking
export interface EditEntry {
  description: string;
  amount: number;
  editedAt: any;
}

// History entry interface for income/outcome transactions
export interface HistoryEntry {
  id?: string;
  type: "income" | "outcome";
  wallet: string;
  currency: string;
  description: string;
  amount: number;
  createdAt?: any;
  editHistory?: EditEntry[];
  notes?: string;
}

// Transfer entry interface for wallet transfers
export interface TransferEntry {
  id?: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  description: string;
  createdAt?: any;
  type?: "transfer";
}

// Wallet entry interface
export interface WalletEntry {
  id?: string;
  name: string;
  currency: string;
  status?: string;
}

// Unified entry type for all transaction types
export type UnifiedEntry = HistoryEntry | (TransferEntry & { type: "transfer" });

// Filter state interface
export interface FilterState {
  search: string;
  selectedDateRange: string;
  customDate: string;
  selectedType: string;
  selectedWallet: string;
}

// Date range options
export const DATE_RANGE_OPTIONS = [
  { value: "all", label: "Semua Tanggal" },
  { value: "today", label: "Hari Ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "last7", label: "7 Hari Terakhir" },
  { value: "thisMonth", label: "Bulan Ini" },
  { value: "custom", label: "📆 Tanggal Khusus" }
];

// Transaction type options
export const TRANSACTION_TYPE_OPTIONS = [
  { value: "all", label: "Semua Jenis" },
  { value: "income", label: "Income" },
  { value: "outcome", label: "Outcome" },
  { value: "transfer", label: "Transfer" }
];