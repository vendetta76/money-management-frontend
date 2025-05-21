import React from "react";
import { formatCurrency } from "@/helpers/formatCurrency";
import { MoreHorizontal } from "lucide-react";
import CountUp from "react-countup";

interface WalletTotalOverviewProps {
  totalsByCurrency: Record<string, number>;
  showBalance: boolean;
}

// Color palette for currency bars
const COLORS = [
  "bg-indigo-600",
  "bg-purple-600", 
  "bg-pink-600", 
  "bg-red-600", 
  "bg-orange-600",
  "bg-amber-600", 
  "bg-yellow-600", 
  "bg-lime-600", 
  "bg-green-600", 
  "bg-emerald-600",
  "bg-teal-600", 
  "bg-cyan-600", 
  "bg-sky-600", 
  "bg-blue-600"
];

const WalletTotalOverview: React.FC<WalletTotalOverviewProps> = ({
  totalsByCurrency,
  showBalance,
}) => {
  // Sort currencies by balance
  const sortedCurrencies = Object.entries(totalsByCurrency)
    .sort((a, b) => b[1] - a[1]);
  
  // Take top currencies for visual display
  const topCurrencies = sortedCurrencies.slice(0, 5);
  const otherCurrencies = sortedCurrencies.slice(5);
  
  // Calculate total for percentage displays
  const totalBalance = Object.values(totalsByCurrency).reduce((acc, curr) => acc + curr, 0);
  const otherTotal = otherCurrencies.reduce((acc, [_, value]) => acc + value, 0);
  
  // Calculate percentages for stack bars
  const getPercentage = (value: number) => Math.max(5, Math.round((value / totalBalance) * 100));
  
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">💰 Total Saldo per Mata Uang</h2>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-5">
        {/* Visual stack bars */}
        <div className="h-10 w-full flex rounded-full overflow-hidden mb-5">
          {topCurrencies.map(([currency, value], index) => (
            <div 
              key={currency}
              className={`${COLORS[index % COLORS.length]} h-full flex items-center justify-center`}
              style={{ width: `${getPercentage(value)}%` }}
              title={`${currency}: ${getPercentage(value)}%`}
            >
              {getPercentage(value) > 10 && (
                <span className="text-white text-xs font-bold">{currency}</span>
              )}
            </div>
          ))}
          
          {otherTotal > 0 && (
            <div 
              className="bg-gray-500 h-full flex items-center justify-center"
              style={{ width: `${getPercentage(otherTotal)}%` }}
              title={`Others: ${getPercentage(otherTotal)}%`}
            >
              {getPercentage(otherTotal) > 10 && (
                <span className="text-white text-xs font-bold">
                  <MoreHorizontal size={16} />
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Currency details list */}
        <div className="grid grid-cols-1 gap-2">
          {sortedCurrencies.map(([currency, value], index) => (
            <div 
              key={currency}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center">
                <div className={`w-3 h-12 rounded-full ${index < 5 ? COLORS[index % COLORS.length] : 'bg-gray-500'} mr-4`} />
                
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currency}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {getPercentage(value)}%
                    </span>
                  </div>
                  
                  {/* Optional: Add a subtle subtext if needed */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {index === 0 ? 'Primary currency' : ''}
                  </div>
                </div>
              </div>
              
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {showBalance ? (
                  <CountUp
                    end={value}
                    duration={1.2}
                    separator="," 
                    decimals={0}
                    prefix={formatCurrency(0, currency).replace(/\d+([.,]\d+)?/, "")}
                  />
                ) : (
                  "••••••"
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletTotalOverview;