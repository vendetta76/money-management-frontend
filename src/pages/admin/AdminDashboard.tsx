import AdminLayout from "@/layouts/AdminLayout";
import StatsCards from "@/pages/admin/StatsCards";
import UserOverviewChart from "@/pages/admin/AdminDashboard/UserOverviewChart";
import LatestTransactions from "@/pages/admin/AdminDashboard/LatestTransactions";
import IncomePieChart from "@/pages/admin/AdminDashboard/IncomePieChart";
import RecentUsers from "@/pages/admin/AdminDashboard/RecentUsers";
import { useAdminData } from "@/hooks/useAdminData";

export default function AdminDashboard() {
  const { summary, transactions, users } = useAdminData();

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <StatsCards stats={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserOverviewChart />
        <LatestTransactions transactions={transactions} />
        <IncomePieChart />
        <RecentUsers users={users} />
      </div>
    </AdminLayout>
  );
}
