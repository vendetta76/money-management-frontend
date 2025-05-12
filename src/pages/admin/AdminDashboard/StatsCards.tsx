import { Card, CardContent } from "@/components/ui/card";
const stats = {
  totalUsers: 120,
  totalBalance: 50000,
  totalTransactions: 1234,
};
export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <Card><CardContent className="p-4">Total Users: {stats.totalUsers}</CardContent></Card>
      <Card><CardContent className="p-4">Total Balance: ${stats.totalBalance.toLocaleString()}</CardContent></Card>
      <Card><CardContent className="p-4">Total Transactions: {stats.totalTransactions}</CardContent></Card>
    </div>
  );
}