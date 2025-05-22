import React, { useState, useEffect } from "react";
import { formatCurrency } from "@helpers/formatCurrency";
import { ChevronDown, ChevronUp, X, Wallet, Globe, CreditCard, Star, StarOff, Settings, Loader, Eye, EyeOff } from "lucide-react";
import CountUp from "react-countup";
import { useAuth } from "@context/AuthContext";
import { db } from "@lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";

interface WalletTotalOverviewProps {
  totalsByCurrency: Record<string, number>;
  showBalance: boolean;
  onToggleBalance: () => void;
}

// Constants
const SETTINGS_DOC_ID = "_currency_settings"; // Prefixed with _ to avoid collisions
const LOCAL_STORAGE_FALLBACK = "moniq_primary_currency";

const WalletTotalOverview: React.FC<WalletTotalOverviewProps> = ({
  totalsByCurrency,
  showBalance,
  onToggleBalance,
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sort currencies by balance
  const sortedCurrencies = Object.entries(totalsByCurrency)
    .sort((a, b) => b[1] - a[1]);

  // Get total count of currencies
  const currencyCount = sortedCurrencies.length;
  
  // Default to highest balance currency
  const defaultCurrency = sortedCurrencies[0]?.[0] || "";
  
  // State for primary currency
  const [primaryCurrency, setPrimaryCurrency] = useState<string>(defaultCurrency);
  
  // Load primary currency preference from Firestore (in wallets collection)
  useEffect(() => {
    const loadPrimaryCurrency = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        // Use wallets collection (which already has permissions)
        const settingsRef = doc(db, "users", user.uid, "wallets", SETTINGS_DOC_ID);
        const docSnap = await getDoc(settingsRef);
        
        let savedCurrency = "";
        
        if (docSnap.exists() && docSnap.data().primaryCurrency) {
          savedCurrency = docSnap.data().primaryCurrency;
        } else {
          // Try localStorage as fallback
          try {
            const localSaved = localStorage.getItem(LOCAL_STORAGE_FALLBACK);
            if (localSaved) savedCurrency = localSaved;
          } catch (e) {
            console.error("Error reading from localStorage:", e);
          }
        }
        
        // Only set if the currency still exists in the wallet
        if (savedCurrency && totalsByCurrency[savedCurrency] !== undefined) {
          setPrimaryCurrency(savedCurrency);
        }
      } catch (error) {
        console.error("Error loading primary currency:", error);
        // Try localStorage as fallback
        try {
          const localSaved = localStorage.getItem(LOCAL_STORAGE_FALLBACK);
          if (localSaved && totalsByCurrency[localSaved] !== undefined) {
            setPrimaryCurrency(localSaved);
          }
        } catch (e) {
          console.error("Error reading from localStorage:", e);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadPrimaryCurrency();
  }, [user?.uid, totalsByCurrency]);
  
  // Update primary currency whenever totalsByCurrency changes and current selection is no longer valid
  useEffect(() => {
    if (sortedCurrencies.length > 0 && !totalsByCurrency[primaryCurrency]) {
      setPrimaryCurrency(sortedCurrencies[0][0]);
      savePrimaryCurrency(sortedCurrencies[0][0]);
    }
  }, [totalsByCurrency, primaryCurrency]);
  
  // Save primary currency preference to Firestore
  const savePrimaryCurrency = async (currency: string) => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      // Use wallets collection (which already has permissions)
      const settingsRef = doc(db, "users", user.uid, "wallets", SETTINGS_DOC_ID);
      
      // Save to Firestore
      await setDoc(settingsRef, {
        primaryCurrency: currency,
        type: "settings", // Mark this as a settings doc, not a real wallet
        updatedAt: new Date()
      }, { merge: true });
      
      // Also save to localStorage as backup
      try {
        localStorage.setItem(LOCAL_STORAGE_FALLBACK, currency);
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
      
    } catch (error) {
      console.error("Error saving primary currency:", error);
      toast.error("Gagal menyimpan pengaturan mata uang");
      
      // Save to localStorage as fallback
      try {
        localStorage.setItem(LOCAL_STORAGE_FALLBACK, currency);
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Get primary currency amount
  const primaryAmount = totalsByCurrency[primaryCurrency] || 0;
  
  // Create currency groups for compact display
  const getPrimaryCurrencyIndex = () => {
    return sortedCurrencies.findIndex(([curr]) => curr === primaryCurrency);
  };
  
  // Reorder currencies to show primary currency first, then others by balance
  const reorderedCurrencies = [...sortedCurrencies];
  const primaryIndex = getPrimaryCurrencyIndex();
  
  if (primaryIndex > 0) {
    const [primaryItem] = reorderedCurrencies.splice(primaryIndex, 1);
    reorderedCurrencies.unshift(primaryItem);
  }
  
  const mainCurrencies = reorderedCurrencies.slice(0, 3);
  const otherCurrencies = reorderedCurrencies.slice(3);
  
  // Compute total of all currencies
  const totalSum = Object.values(totalsByCurrency).reduce((sum, val) => sum + val, 0);
  
  // Handle primary currency change
  const handleSetPrimary = (currency: string) => {
    setPrimaryCurrency(currency);
    savePrimaryCurrency(currency);
    // Close settings after change
    setShowSettings(false);
  };
  
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
                  end={primaryAmount}
                  duration={1.2}
                  separator="," 
                  decimals={0}
                  prefix={formatCurrency(0, primaryCurrency).replace(/\d+([.,]\d+)?/, "")}
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
    <div className="mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">💰 Summary</h2>
        <div className="flex items-center gap-2">
          {/* Balance Toggle Button */}
          <button
            onClick={onToggleBalance}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
          >
            {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="text-sm hidden sm:inline">
              {showBalance ? "Sembunyikan" : "Tampilkan"}
            </span>
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Currency Settings"
          >
            <Settings size={18} />
          </button>
          <button 
            onClick={() => setIsMinimized(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Minimize to floating widget"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      {/* Currency Settings Popover */}
      {showSettings && (
        <div className="absolute right-0 top-12 w-72 bg-white dark:bg-zinc-800 shadow-lg rounded-lg z-10 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium text-gray-700 dark:text-gray-200">Currency Settings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Set your primary currency for summaries
            </p>
          </div>
          
          <div className="p-2 max-h-60 overflow-y-auto">
            {sortedCurrencies.map(([currency, amount]) => (
              <div 
                key={currency}
                className={`flex justify-between items-center p-2 rounded-md cursor-pointer
                  ${currency === primaryCurrency 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                onClick={() => handleSetPrimary(currency)}
              >
                <div className="flex items-center">
                  {currency === primaryCurrency ? (
                    <Star size={16} className="text-yellow-500 mr-2" />
                  ) : (
                    <StarOff size={16} className="text-gray-400 mr-2" />
                  )}
                  <span className="font-medium">{currency}</span>
                </div>
                {showBalance && (
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {formatCurrency(amount, currency)}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
            {loading && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <Loader size={12} className="animate-spin mr-1" /> Saving...
              </div>
            )}
            <button 
              className="ml-auto py-1.5 px-3 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setShowSettings(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
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
          {primaryCurrency && (
            <div className="mt-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <Star size={14} className="text-yellow-300 mr-1.5" />
                    <div className="text-xs font-medium text-indigo-200">Primary Currency</div>
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {primaryCurrency}
                  </div>
                </div>
                
                {showBalance ? (
                  <div className="text-xl font-medium">
                    <CountUp
                      end={primaryAmount}
                      duration={1.2}
                      separator="," 
                      decimals={0}
                      prefix={formatCurrency(0, primaryCurrency).replace(/\d+([.,]\d+)?/, "")}
                    />
                  </div>
                ) : (
                  <div className="text-xl font-medium">••••••</div>
                )}
              </div>
              
              {showBalance && (
                <div className="mt-2 text-xs text-indigo-200">
                  {Math.round((primaryAmount / totalSum) * 100)}% of your total balance
                </div>
              )}
            </div>
          )}
          
          {/* Quick totals */}
          {mainCurrencies.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {mainCurrencies
                .filter(([currency]) => currency !== primaryCurrency)
                .slice(0, 2)
                .map(([currency, total]) => (
                <div key={currency} className="bg-white/10 rounded-lg px-3 py-1.5 flex-1">
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
                <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1">
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
                    className={`flex justify-between items-center p-2 rounded-lg ${
                      currency === primaryCurrency 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        currency === primaryCurrency
                          ? 'bg-indigo-500 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                      }`}>
                        {currency === primaryCurrency ? (
                          <Star size={16} />
                        ) : (
                          currency.slice(0, 1)
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white flex items-center">
                          {currency}
                          {currency !== primaryCurrency && (
                            <button
                              className="ml-2 p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetPrimary(currency);
                              }}
                              title="Set as primary currency"
                            >
                              <StarOff size={14} />
                            </button>
                          )}
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