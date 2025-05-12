import { Card, CardContent } from "@/components/ui/card";
const users = [
  { name: "John Doe", email: "john@example.com" },
  { name: "Jane Smith", email: "jane@example.com" },
];
export default function RecentUsers() {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-2">Recent Users</h2>
        <table className="w-full text-sm">
          <thead><tr><th>Name</th><th>Email</th></tr></thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={i} className="border-t">
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}