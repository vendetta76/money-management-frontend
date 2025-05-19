import { Suspense, lazy } from "react";
import LayoutShell from "../../layouts/LayoutShell";
import { usePageLockStatus } from "../../hooks/usePageLockStatus";
import { useAuth } from "../../context/AuthContext";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";
import { TransferProvider } from "./TransferContext";

// Lazy loaded components
const TransferForm = lazy(() => import("./components/TransferForm"));
const TransferHistory = lazy(() => import("./components/TransferHistory"));

const TransferPage: React.FC = () => {
  const { user, userMeta } = useAuth();
  const { locked, message } = usePageLockStatus("transfer");

  return (
    <LayoutShell>
      <main className="relative max-w-xl mx-auto p-4">
        {locked && userMeta && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={user?.role}
              bypassFor={["Admin", "Staff", "Tester"]}
            />
          </div>
        )}
        <div className={locked ? "pointer-events-none blur-sm" : "relative z-10"}>
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Transfer Antar Wallet</h1>
          
          <TransferProvider>
            <Suspense fallback={<div className="text-center py-6">Loading...</div>}>
              <TransferForm />
              <TransferHistory />
            </Suspense>
          </TransferProvider>
        </div>
      </main>
    </LayoutShell>
  );
};

export default TransferPage;
