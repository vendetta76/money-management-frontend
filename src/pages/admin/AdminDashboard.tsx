import Sidebar from "@/components/admin/AdminSidebar";
import StatsCards from "@/components/admin/StatsCards";
import UserOverviewChart from "@/components/admin/UserOverviewChart";
import LatestTransactions from "@/components/admin/LatestTransactions";
import IncomePieChart from "@/components/admin/IncomePieChart";
import RecentUsers from "@/components/admin/RecentUsers";
import { useAdminData } from "@/hooks/useAdminData";

export default function AdminDashboard() {
  const { summary, transactions, users } = useAdminData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 min-h-screen">
      <Sidebar />
      <main className="md:col-span-5 p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <StatsCards stats={summary} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserOverviewChart />
          <LatestTransactions transactions={transactions} />
          <IncomePieChart />
          <RecentUsers users={users} />
        </div>
      </main>
    </div>
  );
}