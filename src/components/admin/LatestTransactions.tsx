import { Card, CardContent } from "@/components/ui/card";
const transactions = [
  { date: "2025-05-10", user: "John Doe", amount: 125.0, status: "Pending" },
  { date: "2025-05-09", user: "Jane Smith", amount: 245.0, status: "Completed" },
];
export default function LatestTransactions() {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-2">Latest Transactions</h2>
        <table className="w-full text-sm">
          <thead>
            <tr><th>Date</th><th>User</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={i} className="border-t">
                <td>{tx.date}</td>
                <td>{tx.user}</td>
                <td>${tx.amount}</td>
                <td>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}