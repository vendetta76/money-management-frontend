import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
const userOverview = [
  { name: "Jan", users: 40 },
  { name: "Feb", users: 60 },
  { name: "Mar", users: 80 },
  { name: "Apr", users: 100 },
  { name: "May", users: 120 },
];
export default function UserOverviewChart() {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-2">User Overview</h2>
        <LineChart width={400} height={200} data={userOverview}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="users" stroke="#8884d8" />
        </LineChart>
      </CardContent>
    </Card>
  );
}