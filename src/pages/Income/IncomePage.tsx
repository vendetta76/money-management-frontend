import LayoutShell from "../../layouts/LayoutShell";
import IncomeForm from "./IncomeForm";
import RecentTransactions from "./RecentTransactions";
import { useAuth } from "../../context/AuthContext";
import { usePageLockStatus } from "../../hooks/usePageLockStatus";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";

const IncomePage = () => {
  const { user } = useAuth();
  const { locked, message } = usePageLockStatus("income");

  return (
    <LayoutShell>
      <main className="relative max-w-2xl mx-auto px-4 py-6">
        {locked && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={user?.role || ""}
              bypassFor={["Admin", "diorvendetta76@gmail.com"]}
            />
          </div>
        )}

        <div className={locked ? "pointer-events-none blur-sm" : "relative z-10"}>
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Tambah Pemasukan
          </h1>
          <IncomeForm />
          <RecentTransactions />
        </div>
      </main>
    </LayoutShell>
  );
};

export default IncomePage;