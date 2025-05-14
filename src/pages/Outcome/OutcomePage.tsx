import LayoutShell from "../../layouts/LayoutShell";
import OutcomeForm from "./OutcomeForm";
import RecentOutcomeTransactions from "./RecentOutcomeTransactions";
import { useAuth } from "../../context/AuthContext";
import { usePageLockStatus } from "import { usePageLockStatus } from "../../hooks/usePageLockStatus";"; // Adjust path as needed
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement"; // Adjust path as needed

const OutcomePage = () => {
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
          Tambah Pengeluaran
        </h1>
        <OutcomeForm />
        <RecentOutcomeTransactions />
      </main>
    </LayoutShell>
  );
};

export default OutcomePage;