import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { format, subDays, subMonths, subYears } from 'date-fns';
import WalletLegend from './WalletLegend';

interface Props {
  transactions: any[];
  selectedCurrency: string;
  filterDate: string;
  customStartDate: any;
  customEndDate: any;
  wallets: any[];
}

const BalanceTrendChart: React.FC<Props> = ({
  transactions,
  selectedCurrency,
  filterDate,
  customStartDate,
  customEndDate,
  wallets
}) => {
  const now = new Date();

  const filteredTx = transactions
    .filter(tx => tx.createdAt)
    .filter(tx => {
      const txDate = new Date(tx.createdAt.toDate());

      if (filterDate === 'custom' && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return txDate >= start && txDate <= end;
      } else if (filterDate === '7days') {
        return txDate >= subDays(now, 7);
      } else if (filterDate === '30days') {
        return txDate >= subMonths(now, 1);
      } else if (filterDate === '1year') {
        return txDate >= subYears(now, 1);
      }
      return true;
    })
    .filter(tx => selectedCurrency === 'all' || tx.currency === selectedCurrency);

  const groupedByDate: Record<string, number> = {};
  filteredTx.forEach((tx) => {
    const dateKey = format(tx.createdAt.toDate(), 'dd MMM');
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = 0;
    groupedByDate[dateKey] += tx.amount || 0;
  });

  const lineData = Object.entries(groupedByDate).map(([date, value]) => ({
    name: date,
    value
  }));

  const filteredWallets = selectedCurrency === 'all'
    ? wallets
    : wallets.filter(w => w.currency === selectedCurrency);

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow mb-6 text-gray-800 dark:text-gray-100">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-4">
        Trend Saldo ({selectedCurrency})
      </h2>
      <div className="w-full h-64 overflow-x-auto">
        <ResponsiveContainer>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat('id-ID', {
                  style: 'decimal',
                  maximumFractionDigits: 0
                }).format(value)
              }
              stroke="#9ca3af"
            />
            <RechartsTooltip />
            <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <WalletLegend wallets={filteredWallets} />
    </div>
  );
};

export default BalanceTrendChart;