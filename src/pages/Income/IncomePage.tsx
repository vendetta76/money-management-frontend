import LayoutShell from "../../layouts/LayoutShell";
import IncomeForm from "./IncomeForm";
import RecentTransactions from "./RecentTransactions";
import { useAuth } from "../../context/AuthContext";
import { usePageLockStatus } from "import { usePageLockStatus } from "../../hooks/usePageLockStatus";"; // Adjust path as needed
import PageLockAnnouncement from "../../components/PageLockAnnouncement"; // Adjust path as needed

const IncomePage = () => {
  const { user } = useAuth();
  const { locked, message } = usePageLockStatus("dashboard", "GLOBAL_ADMIN_ID");

  return (
    <LayoutShell>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <PageLockAnnouncement
          locked={locked}
          message={message}
          currentUserEmail={user?.email || ""}
          currentUserRole={user?.role || ""}
          bypassFor={["Admin", "diorvendetta76@gmail.com"]}
        />
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Tambah Pemasukan
        </h1>
        <IncomeForm />
        <RecentTransactions />
      </main>
    </LayoutShell>
  );
};

export default IncomePage;