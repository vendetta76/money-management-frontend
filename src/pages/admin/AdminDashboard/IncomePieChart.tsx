import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
const income = [
  { name: "Investments", value: 4000 },
  { name: "Salary", value: 3000 },
  { name: "Freelance", value: 2000 },
];
const colors = ["#8884d8", "#82ca9d", "#ffc658"];
export default function IncomePieChart() {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-2">Income</h2>
        <PieChart width={300} height={200}>
          <Pie data={income} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
            {income.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </CardContent>
    </Card>
  );
}