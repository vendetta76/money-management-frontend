import React, { useState, useRef, useEffect } from "react";
import { formatCurrency } from "@helpers/formatCurrency";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, DollarSign, ArrowRightCircle } from "lucide-react";
import CountUp from "react-countup";

interface WalletTotalOverviewProps {
  totalsByCurrency: Record<string, number>;
  showBalance: boolean;
}

const WalletTotalOverview: React.FC<WalletTotalOverviewProps> = ({
  totalsByCurrency,
  showBalance,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Optional: Add previous data to calculate trends (mock data for demo)
  const mockTrends = {
    "USD": 2.5, "IDR": -1.3, "THB": 5.1, "USDT": 0.2, "CNY": -0.8,
    "JPY": 1.2, "EUR": -2.1, "GBP": 0.9, "SGD": -0.5, "AUD": 2.3
  };

  // Get dominant currency (with highest balance)
  const dominantCurrency = Object.entries(totalsByCurrency)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  
  // Calculate total across all currencies (simplified, ideally would convert to base currency)
  const totalBalance = Object.values(totalsByCurrency).reduce((sum, value) => sum + value, 0);
  
  // Sort currencies by balance
  const sortedCurrencies = Object.entries(totalsByCurrency)
    .sort((a, b) => b[1] - a[1]);
    
  // Check scroll possibility
  useEffect(() => {
    const checkScroll = () => {
      if (!carouselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    };
    
    checkScroll();
    
    // Add scroll event listener
    const ref = carouselRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [totalsByCurrency]);
  
  // Scroll handlers
  const handleScrollLeft = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  
  const handleScrollRight = () => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };
  
  // Get currency with highest positive and negative trends
  const getTopTrendCurrencies = () => {
    const trends = Object.entries(mockTrends)
      .filter(([currency]) => currency in totalsByCurrency);
    
    if (trends.length === 0) return { top: null, bottom: null };
    
    trends.sort((a, b) => b[1] - a[1]);
    return {
      top: trends[0],
      bottom: trends[trends.length - 1]
    };
  };
  
  const { top: topTrend, bottom: bottomTrend } = getTopTrendCurrencies();

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">💰 Total Saldo per Mata Uang</h2>
      
      {/* Insights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Dominant Currency */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-indigo-100">Main Currency</p>
              <h3 className="text-xl font-bold">{dominantCurrency || "No Data"}</h3>
            </div>
            <div className="bg-white/20 rounded-full p-2">
              <DollarSign size={20} className="text-white" />
            </div>
          </div>
          <div className="mt-2">
            {showBalance && dominantCurrency ? (
              <div className="text-2xl font-bold">
                <CountUp
                  end={totalsByCurrency[dominantCurrency] || 0}
                  duration={1.2}
                  separator="," 
                  decimals={0}
                  prefix={formatCurrency(0, dominantCurrency).replace(/\d+([.,]\d+)?/, "")}
                />
              </div>
            ) : (
              <div className="text-2xl font-bold">••••••</div>
            )}
            <p className="text-xs mt-1 text-indigo-100">
              {Object.keys(totalsByCurrency).length > 1 ? 
                `${Math.round((totalsByCurrency[dominantCurrency] / totalBalance) * 100)}% of your portfolio` : 
                "100% of your portfolio"}
            </p>
          </div>
        </div>
        
        {/* Rising Currency (if available) */}
        {topTrend && topTrend[1] > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Rising</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{topTrend[0]}</h3>
              </div>
              <div className="text-green-500">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="mt-2">
              {showBalance ? (
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  <CountUp
                    end={totalsByCurrency[topTrend[0]] || 0}
                    duration={1.2}
                    separator="," 
                    decimals={0}
                    prefix={formatCurrency(0, topTrend[0]).replace(/\d+([.,]\d+)?/, "")}
                  />
                </div>
              ) : (
                <div className="text-lg font-bold text-gray-900 dark:text-white">••••••</div>
              )}
              <p className="text-sm text-green-500 font-medium flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" /> +{topTrend[1]}%
              </p>
            </div>
          </div>
        )}
        
        {/* Falling Currency (if available) */}
        {bottomTrend && bottomTrend[1] < 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md border-l-4 border-red-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Falling</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{bottomTrend[0]}</h3>
              </div>
              <div className="text-red-500">
                <TrendingDown size={24} />
              </div>
            </div>
            <div className="mt-2">
              {showBalance ? (
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  <CountUp
                    end={totalsByCurrency[bottomTrend[0]] || 0}
                    duration={1.2}
                    separator="," 
                    decimals={0}
                    prefix={formatCurrency(0, bottomTrend[0]).replace(/\d+([.,]\d+)?/, "")}
                  />
                </div>
              ) : (
                <div className="text-lg font-bold text-gray-900 dark:text-white">••••••</div>
              )}
              <p className="text-sm text-red-500 font-medium flex items-center mt-1">
                <TrendingDown size={16} className="mr-1" /> {bottomTrend[1]}%
              </p>
            </div>
          </div>
        )}
        
        {/* Portfolio Summary (replaces insights if not enough data) */}
        {(!topTrend || !bottomTrend) && (
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Portfolio</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {Object.keys(totalsByCurrency).length} Currencies
                </h3>
              </div>
              <ArrowRightCircle size={24} className="text-gray-400" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {sortedCurrencies.slice(0, 5).map(([currency]) => (
                <span key={currency} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                  {currency}
                </span>
              ))}
              {sortedCurrencies.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">
                  +{sortedCurrencies.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Currency Carousel */}
      <div className="relative">
        {canScrollLeft && (
          <button 
            onClick={handleScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {canScrollRight && (
          <button 
            onClick={handleScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronRight size={24} />
          </button>
        )}
        
        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pb-2 px-1 snap-x scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sortedCurrencies.map(([currency, total]) => (
            <div
              key={currency}
              className="snap-start flex-shrink-0 w-56 bg-white dark:bg-zinc-800 shadow-md rounded-lg p-4 border-t-4 border-indigo-500 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {currency}
                </div>
                {currency in mockTrends && (
                  <div className={`text-xs font-medium rounded px-1.5 py-0.5 flex items-center ${
                    mockTrends[currency] > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {mockTrends[currency] > 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                    {mockTrends[currency] > 0 ? '+' : ''}{mockTrends[currency]}%
                  </div>
                )}
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
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
    </div>
  );
};

export default WalletTotalOverview;