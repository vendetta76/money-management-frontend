export interface WalletEntry {
  id: string;
  name: string;
  balance: number;
  currency: string;
  status?: string;
}

export interface TransferEntry {
  id: string;
  from: string;
  to: string;
  fromWalletId: string;
  toWalletId: string;
  wallet: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  createdAt: any;
}