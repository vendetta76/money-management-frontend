// src/components/DashboardFilters.tsx
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
      setFilterDate("today")
      setFilterWallet("all")
      setFilterType("all")
      setSelectedCurrency("all")
      setCustomStartDate("")
      setCustomEndDate("")
    }
  
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
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
                  className="px-3 py-2 border rounded"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border rounded"
                />
              </div>
            )}
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dompet</label>
            <select
              value={filterWallet}
              onChange={(e) => setFilterWallet(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Semua Wallet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="outcome">Pengeluaran</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Uang</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="all">Semua</option>
              {allCurrencies.map((cur) => (
                <option key={cur} value={cur}>{cur}</option>
              ))}
            </select>
          </div>
        </div>
  
        <div className="flex justify-end mt-2">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
          >
            Reset Filter
          </button>
        </div>
      </>
    )
  }