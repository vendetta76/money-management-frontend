import LayoutShell from "../../layouts/LayoutShell";
import OutcomeForm from "./OutcomeForm";
import RecentOutcomeTransactions from "./RecentOutcomeTransactions";
import { useAuth } from "../../context/AuthContext";
import { usePageLockStatus } from "../../hooks/usePageLockStatus";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";

const OutcomePage = () => {
  const { user, userMeta } = useAuth();
  const { locked, message } = usePageLockStatus("outcome");

  return (
    <LayoutShell>
      <main className="relative max-w-2xl mx-auto px-4 py-6">
        {locked && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={userMeta?.role || ""}
              bypassFor={["Admin", "Staff", "Tester"]}
            />
          </div>
        )}

        <div className={locked ? "pointer-events-none blur-sm" : "relative z-10"}>
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Tambah Pengeluaran
          </h1>
          <OutcomeForm />
          <RecentOutcomeTransactions />
        </div>
      </main>
    </LayoutShell>
  );
};

export default OutcomePage;