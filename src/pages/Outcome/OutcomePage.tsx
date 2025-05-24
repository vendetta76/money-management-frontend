import { useState } from "react";
import LayoutShell from "../../layouts/LayoutShell";
import OutcomeForm from "./OutcomeForm";
import RecentOutcomeTransactions from "./RecentOutcomeTransactions";
import { useAuth } from "../../context/AuthContext";
import { usePageLockStatus } from "../../hooks/usePageLockStatus";
import PageLockAnnouncement from "../../components/admin/PageLockAnnouncement";
import { OutcomeEntry } from "../helpers/types";

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditComplete = () => {
    setEditingEntry(null);
  };

  return (
    <LayoutShell>
      <main className="relative max-w-2xl mx-auto px-4 py-6">
        {locked && !isBypassed && userMeta && (
          <div className="absolute inset-0 z-40 backdrop-blur-sm bg-black/30 flex items-center justify-center">
            <PageLockAnnouncement
              locked={true}
              message={message}
              currentUserEmail={user?.email || ""}
              currentUserRole={userMeta?.role || ""}
              bypassFor={bypassFor}
            />
          </div>
        )}

        <div className={!locked || isBypassed ? "relative z-10" : "pointer-events-none blur-sm"}>
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingEntry ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </h1>
          
          {editingEntry && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg border border-blue-300 dark:border-blue-700">
              📝 Sedang mengedit: {editingEntry.description} - {editingEntry.amount.toLocaleString('id-ID')} {editingEntry.currency}
            </div>
          )}
          
          <OutcomeForm 
            editingEntry={editingEntry}
            onEditComplete={handleEditComplete}
          />
          <RecentOutcomeTransactions onEdit={handleEdit} />
        </div>
      </main>
    </LayoutShell>
  );
};

export default OutcomePage;