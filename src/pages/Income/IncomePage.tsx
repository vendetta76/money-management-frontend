import LayoutShell from "../../layouts/LayoutShell";
import IncomeForm from "./IncomeForm";
import RecentTransactions from "./RecentTransactions";
import { useAuth } from "../../context/AuthContext";
import { usePageLockStatus } from "../../hooks/usePageLockStatus";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";

const IncomePage = () => {
  const { user, userMeta } = useAuth();
  const { locked, message } = usePageLockStatus("income");

  const bypassFor = ["Admin", "Staff", "Tester"];
  const normalizedBypass = bypassFor.map((b) => b.toLowerCase());
  const email = user?.email?.toLowerCase() || "";
  const role = userMeta?.role?.toLowerCase() || "";
  const isBypassed = normalizedBypass.includes(email) || normalizedBypass.includes(role);

  return (
    <LayoutShell>
      <main className="relative max-w-2xl mx-auto px-4 py-6">
        {locked && !isBypassed && userMeta && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={userMeta.role || ""}
              bypassFor={bypassFor}
            />
          </div>
        )}

        <div className={!locked || isBypassed ? "relative z-10" : "pointer-events-none blur-sm"}>
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