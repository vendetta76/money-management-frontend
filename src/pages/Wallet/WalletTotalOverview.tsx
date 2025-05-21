import React, { useState } from "react";
import { formatCurrency } from "@helpers/formatCurrency";
import { ChevronDown, ChevronUp, X, Wallet, Globe, CreditCard } from "lucide-react";
import CountUp from "react-countup";

interface WalletTotalOverviewProps {
  totalsByCurrency: Record<string, number>;
  showBalance: boolean;
}

const WalletTotalOverview: React.FC<WalletTotalOverviewProps> = ({
  totalsByCurrency,
  showBalance,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Sort currencies by balance
  const sortedCurrencies = Object.entries(totalsByCurrency)
    .sort((a, b) => b[1] - a[1]);

  // Get total count of currencies
  const currencyCount = sortedCurrencies.length;
  
  // Get dominant currency
  const dominantCurrency = sortedCurrencies[0]?.[0] || "";
  const dominantAmount = sortedCurrencies[0]?.[1] || 0;
  
  // Create currency groups for compact display
  const mainCurrencies = sortedCurrencies.slice(0, 3);
  const otherCurrencies = sortedCurrencies.slice(3);
  
  // Compute total of all currencies
  const totalSum = Object.values(totalsByCurrency).reduce((sum, val) => sum + val, 0);
  
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 border border-indigo-100 dark:border-indigo-900 flex items-center">
          <button 
            onClick={() => setIsMinimized(false)}
            className="bg-indigo-500 text-white rounded-full p-2.5 mr-3"
          >
            <Wallet size={20} />
          </button>
          
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {currencyCount} Currencies
            </div>
            {showBalance ? (
              <div className="text-lg font-bold">
                <span className="text-gray-400 dark:text-gray-500 mr-1">~</span>
                <CountUp
                  end={dominantAmount}
                  duration={1.2}
                  separator="," 
                  decimals={0}
                  prefix={formatCurrency(0, dominantCurrency).replace(/\d+([.,]\d+)?/, "")}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1 font-normal">
                  + {currencyCount - 1} more
                </span>
              </div>
            ) : (
              <div className="text-lg font-bold text-gray-900 dark:text-white">••••••</div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">💰 Total Saldo per Mata Uang</h2>
        <button 
          onClick={() => setIsMinimized(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Minimize to floating widget"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Main summary card */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md overflow-hidden">
        {/* Header with summary */}
        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Globe size={20} className="mr-2" />
              <h3 className="font-bold">Currency Balance</h3>
            </div>
            <div className="text-sm">
              <span className="font-medium">{currencyCount}</span> currencies
            </div>
          </div>
          
          {/* Primary currency highlight */}
          {dominantCurrency && (
            <div className="mt-2">
              <div className="text-xs font-medium text-indigo-200">Primary Currency</div>
              <div className="flex items-baseline">
                <div className="text-2xl font-bold mr-2">
                  {dominantCurrency}
                </div>
                {showBalance ? (
                  <div className="text-xl font-medium">
                    <CountUp
                      end={dominantAmount}
                      duration={1.2}
                      separator="," 
                      decimals={0}
                      prefix={formatCurrency(0, dominantCurrency).replace(/\d+([.,]\d+)?/, "")}
                    />
                  </div>
                ) : (
                  <div className="text-xl font-medium">••••••</div>
                )}
              </div>
            </div>
          )}
          
          {/* Quick totals */}
          {mainCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {mainCurrencies.slice(1, 3).map(([currency, total]) => (
                <div key={currency} className="bg-white/10 rounded-lg px-3 py-1">
                  <div className="text-xs font-medium">{currency}</div>
                  {showBalance ? (
                    <div className="text-sm font-bold">
                      <CountUp
                        end={total}
                        duration={1.2}
                        separator="," 
                        decimals={0}
                        prefix={formatCurrency(0, currency).replace(/\d+([.,]\d+)?/, "")}
                      />
                    </div>
                  ) : (
                    <div className="text-sm font-bold">••••••</div>
                  )}
                </div>
              ))}
              
              {otherCurrencies.length > 0 && (
                <div className="bg-white/10 rounded-lg px-3 py-1">
                  <div className="text-xs font-medium">Others</div>
                  {showBalance ? (
                    <div className="text-sm font-bold">
                      <span>+{otherCurrencies.length}</span>
                    </div>
                  ) : (
                    <div className="text-sm font-bold">+{otherCurrencies.length}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Expandable details */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
          >
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <CreditCard size={18} className="mr-2" />
              <span className="font-medium">All Currencies</span>
            </div>
            {expanded ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </button>
          
          {expanded && (
            <div className="p-4 pt-0 space-y-2 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sortedCurrencies.map(([currency, total]) => (
                  <div 
                    key={currency}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 mr-3">
                        {currency.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {currency}
                        </div>
                        {showBalance && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round((total / totalSum) * 100)}% of total
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {showBalance ? (
                        <CountUp
                          end={total}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTotalOverview;