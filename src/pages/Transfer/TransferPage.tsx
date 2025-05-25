import { Suspense, lazy, useState } from "react";
import LayoutShell from "../../layouts/LayoutShell";
import { usePageLockStatus } from "../../hooks/usePageLockStatus";
import { useAuth } from "../../context/AuthContext";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";
import { TransferProvider } from "./TransferContext";

// Lazy loaded components
const TransferForm = lazy(() => import("./TransferForm"));
const TransferHistory = lazy(() => import("./TransferHistory"));

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 h-8 w-64 rounded-lg mb-4"></div>
    <div className="bg-gray-200 dark:bg-gray-700 h-96 rounded-2xl mb-6"></div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 h-20 rounded-xl"></div>
      ))}
    </div>
  </div>
);

const TransferPage: React.FC = () => {
  const { user, userMeta } = useAuth();
  const { locked, message } = usePageLockStatus("transfer");
  const [editingTransfer, setEditingTransfer] = useState<any>(null);

  const bypassFor = ["Admin", "Staff", "Tester"];
  const normalizedBypass = bypassFor.map((b) => b.toLowerCase());
  const email = user?.email?.toLowerCase() || "";
  const role = userMeta?.role?.toLowerCase() || "";
  const isBypassed = normalizedBypass.includes(email) || normalizedBypass.includes(role);

  return (
    <LayoutShell>
      <main className="relative w-full px-4 py-6">
        {locked && !isBypassed && userMeta && (
          <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
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
          {/* Page Header */}
          <div className="max-w-7xl mx-auto mb-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                {editingTransfer ? "Edit Transfer" : "Transfer Antar Wallet"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {editingTransfer 
                  ? "Perbarui informasi transfer Anda" 
                  : "Pindahkan dana antar dompet dengan mudah dan aman"
                }
              </p>
            </div>

            {editingTransfer && (
              <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-xl p-4 border border-purple-300 dark:border-purple-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <p className="font-semibold">Mode Edit Aktif</p>
                        <p className="text-sm opacity-90">
                          Sedang mengedit transfer: {editingTransfer.from} → {editingTransfer.to}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingTransfer(null)}
                      className="px-4 py-2 bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      Batal Edit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Responsive Layout */}
          <div className="max-w-7xl mx-auto">
            <TransferProvider>
              <Suspense fallback={<LoadingSkeleton />}>
                {/* Desktop: Two Column Layout (XL screens and up) */}
                <div className="hidden xl:block">
                  <div className="grid grid-cols-12 gap-8">
                    {/* Left Column - Form */}
                    <div className="col-span-5">
                      <div className="sticky top-6" id="transfer-form">
                        <TransferForm />
                      </div>
                    </div>

                    {/* Right Column - History */}
                    <div className="col-span-7">
                      <TransferHistory />
                    </div>
                  </div>
                </div>

                {/* Mobile: Single Column Layout (Below XL screens) */}
                <div className="block xl:hidden max-w-2xl mx-auto">
                  <div className="mb-6" id="transfer-form-mobile">
                    <TransferForm />
                  </div>
                  <TransferHistory />
                </div>
              </Suspense>
            </TransferProvider>
          </div>
        </div>
      </main>
    </LayoutShell>
  );
};

export default TransferPage;