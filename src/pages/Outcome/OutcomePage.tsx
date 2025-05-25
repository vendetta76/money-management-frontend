import { useState } from "react";
import LayoutShell from "src/layouts/LayoutShell";
import OutcomeForm from "./OutcomeForm";
import RecentOutcomeTransactions from "./RecentOutcomeTransactions";
import { useAuth } from "src/context/AuthContext";
import { usePageLockStatus } from "src/hooks/usePageLockStatus";
import PageLockAnnouncement from "src/components/admin/PageLockAnnouncement";
import { OutcomeEntry } from "src/pages/helpers/types";

const OutcomePage = () => {
  const { user, userMeta } = useAuth();
  const { locked, message } = usePageLockStatus("outcome");
  const [editingEntry, setEditingEntry] = useState<OutcomeEntry | null>(null);

  const bypassFor = ["Admin", "Staff", "Tester"];
  const normalizedBypass = bypassFor.map((b) => b.toLowerCase());
  const email = user?.email?.toLowerCase() || "";
  const role = userMeta?.role?.toLowerCase() || "";
  const isBypassed = normalizedBypass.includes(email) || normalizedBypass.includes(role);

  const handleEdit = (entry: OutcomeEntry) => {
    setEditingEntry(entry);
    // Scroll to form for better UX
    const formElement = document.getElementById('outcome-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEditComplete = () => {
    setEditingEntry(null);
  };

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
                {editingEntry ? "Edit Pengeluaran" : "Kelola Pengeluaran"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {editingEntry 
                  ? "Perbarui informasi pengeluaran Anda" 
                  : "Catat dan kelola semua pengeluaran Anda dengan mudah"
                }
              </p>
            </div>

            {editingEntry && (
              <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-xl p-4 border border-red-300 dark:border-red-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <p className="font-semibold">Mode Edit Aktif</p>
                        <p className="text-sm opacity-90">
                          Sedang mengedit: {editingEntry.description} - {editingEntry.amount.toLocaleString('id-ID')} {editingEntry.currency}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleEditComplete}
                      className="px-4 py-2 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      Batal Edit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Responsive Layout - PROPERLY FIXED */}
          <div className="max-w-7xl mx-auto">
            {/* Desktop: Two Column Layout (XL screens and up) */}
            <div className="hidden xl:block">
              <div className="grid grid-cols-12 gap-8">
                {/* Left Column - Form */}
                <div className="col-span-5">
                  <div className="sticky top-6" id="outcome-form">
                    <OutcomeForm 
                      editingEntry={editingEntry}
                      onEditComplete={handleEditComplete}
                    />
                  </div>
                </div>

                {/* Right Column - Recent Transactions */}
                <div className="col-span-7">
                  <RecentOutcomeTransactions onEdit={handleEdit} />
                </div>
              </div>
            </div>

            {/* Mobile: Single Column Layout (Below XL screens) */}
            <div className="block xl:hidden max-w-2xl mx-auto">
              <div className="mb-6" id="outcome-form-mobile">
                <OutcomeForm 
                  editingEntry={editingEntry}
                  onEditComplete={handleEditComplete}
                />
              </div>
              <RecentOutcomeTransactions onEdit={handleEdit} />
            </div>
          </div>
        </div>
      </main>
    </LayoutShell>
  );
};

export default OutcomePage;