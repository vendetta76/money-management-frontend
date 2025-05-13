import LayoutShell from "../../layouts/LayoutShell";
import OutcomeForm from "./OutcomeForm";
import RecentOutcomeTransactions from "./RecentOutcomeTransactions";

const OutcomePage = () => {
  return (
    <LayoutShell>
      <main className="max-w-2xl mx-auto px-4 py-6">
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
