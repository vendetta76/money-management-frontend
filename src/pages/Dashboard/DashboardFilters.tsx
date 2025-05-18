export default function DashboardFilters({
  filterDate,
  setFilterDate,
  filterWallet,
  setFilterWallet,
  filterType,
  setFilterType,
  selectedCurrency,
  setSelectedCurrency,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  wallets,
  allCurrencies,
}) {
  const handleResetFilters = () => {
    setFilterDate("today");
    setFilterWallet("all");
    setFilterType("all");
    setSelectedCurrency("all");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  return (
    <>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          Reset Filter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl shadow text-gray-800 dark:text-gray-100">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          >
            <option value="today">Hari Ini</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="30days">30 Hari Terakhir</option>
            <option value="1year">1 Tahun Terakhir</option>
            <option value="custom">Custom...</option>
          </select>
          {filterDate === "custom" && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-2 border rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dompet</label>
          <select
            value={filterWallet}
            onChange={(e) => setFilterWallet(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          >
            <option value="all">Semua Wallet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Transaksi</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          >
            <option value="all">Semua</option>
            <option value="income">Pemasukan</option>
            <option value="outcome">Pengeluaran</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mata Uang</label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
          >
            <option value="all">Semua</option>
            {allCurrencies.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}