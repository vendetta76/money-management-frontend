import { useState } from "react";
import LayoutShell from "src/layouts/LayoutShell";
import IncomeForm from "./IncomeForm";
import RecentTransactions from "./RecentTransactions";
import { useAuth } from "src/context/AuthContext";
import { usePageLockStatus } from "src/hooks/usePageLockStatus";
import { IncomeEntry } from "src/pages/helpers/types";
import { CheckCircle } from "lucide-react";

const IncomePage = () => {
  const { user, userMeta } = useAuth();
  const { locked, message } = usePageLockStatus("income");
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const bypassFor = ["Admin", "Staff", "Tester"];
  const normalizedBypass = bypassFor.map((b) => b.toLowerCase());
  const email = user?.email?.toLowerCase() || "";
  const role = userMeta?.role?.toLowerCase() || "";
  const isBypassed = normalizedBypass.includes(email) || normalizedBypass.includes(role);

  const handleEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    // Scroll to form for better UX
    const formElement = document.getElementById('income-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleEditComplete = () => {
    setEditingEntry(null);
  };

  const handleFormSuccess = (isEdit: boolean) => {
    const message = isEdit ? "Pemasukan diperbarui! ✨" : "Pemasukan berhasil disimpan! 🎉";
    setSuccessMessage(message);
    setShowSuccessToast(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  return (
    <LayoutShell>
      <main className="relative w-full px-4 py-6">
        {/* Success Toast - Page Level with Highest Z-Index */}
        {showSuccessToast && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none px-4">
            <div className="bg-green-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 animate-bounce max-w-sm text-center border-2 border-green-400">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base">
                {successMessage}
              </span>
            </div>
          </div>
        )}

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
                {editingEntry ? "Edit Pemasukan" : "Kelola Pemasukan"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {editingEntry 
                  ? "Perbarui informasi pemasukan Anda" 
                  : "Catat dan kelola semua pemasukan Anda dengan mudah"
                }
              </p>
            </div>

            {editingEntry && (
              <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-xl p-4 border border-blue-300 dark:border-blue-700">
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
                      className="px-4 py-2 bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
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
                  <div className="sticky top-6" id="income-form">
                    <IncomeForm 
                      editingEntry={editingEntry}
                      onEditComplete={handleEditComplete}
                      onSuccess={handleFormSuccess}
                    />
                  </div>
                </div>

                {/* Right Column - Recent Transactions */}
                <div className="col-span-7">
                  <RecentTransactions onEdit={handleEdit} />
                </div>
              </div>
            </div>

            {/* Mobile: Single Column Layout (Below XL screens) */}
            <div className="block xl:hidden max-w-2xl mx-auto">
              <div className="mb-6" id="income-form-mobile">
                <IncomeForm 
                  editingEntry={editingEntry}
                  onEditComplete={handleEditComplete}
                  onSuccess={handleFormSuccess}
                />
              </div>
              <RecentTransactions onEdit={handleEdit} />
            </div>
          </div>
        </div>
      </main>
    </LayoutShell>
  );
};

export default IncomePage;