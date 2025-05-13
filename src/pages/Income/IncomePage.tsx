import LayoutShell from "../../layouts/LayoutShell";
import IncomeForm from "./IncomeForm";
import RecentTransactions from "./RecentTransactions";

const IncomePage = () => {
  return (
    <LayoutShell>
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Tambah Pemasukan
        </h1>
        <IncomeForm />
        <RecentTransactions />
      </main>
    </LayoutShell>
  );
};

export default IncomePage;
