import React from 'react';

interface QuickAmountButtonsProps {
  currency: string;
  onAmountSelect: (amount: number) => void;
  disabled?: boolean;
}

const QuickAmountButtons: React.FC<QuickAmountButtonsProps> = ({
  currency,
  onAmountSelect,
  disabled = false
}) => {
  // Comprehensive currency configuration with appropriate quick amounts
  const getCurrencyQuickAmounts = (currency: string) => {
    const curr = currency.toUpperCase();
    
    switch (curr) {
      // Indonesian Rupiah - Higher amounts due to lower denomination
      case 'IDR':
        return [
          { label: '50K', value: 50000 },
          { label: '100K', value: 100000 },
          { label: '500K', value: 500000 },
          { label: '1M', value: 1000000 },
          { label: '5M', value: 5000000 }
        ];

      // US Dollar - Standard amounts
      case 'USD':
        return [
          { label: '$50', value: 50 },
          { label: '$100', value: 100 },
          { label: '$500', value: 500 },
          { label: '$1K', value: 1000 },
          { label: '$5K', value: 5000 }
        ];

      // Euro - Similar to USD
      case 'EUR':
        return [
          { label: '€50', value: 50 },
          { label: '€100', value: 100 },
          { label: '€500', value: 500 },
          { label: '€1K', value: 1000 },
          { label: '€5K', value: 5000 }
        ];

      // British Pound - Slightly higher value
      case 'GBP':
        return [
          { label: '£25', value: 25 },
          { label: '£50', value: 50 },
          { label: '£200', value: 200 },
          { label: '£500', value: 500 },
          { label: '£2K', value: 2000 }
        ];

      // Japanese Yen - Much higher amounts due to lower denomination
      case 'JPY':
        return [
          { label: '¥1K', value: 1000 },
          { label: '¥5K', value: 5000 },
          { label: '¥10K', value: 10000 },
          { label: '¥50K', value: 50000 },
          { label: '¥100K', value: 100000 }
        ];

      // Australian Dollar - Similar to USD
      case 'AUD':
        return [
          { label: 'A$50', value: 50 },
          { label: 'A$100', value: 100 },
          { label: 'A$500', value: 500 },
          { label: 'A$1K', value: 1000 },
          { label: 'A$5K', value: 5000 }
        ];

      // Chinese Yuan - Moderate amounts
      case 'CNY':
        return [
          { label: '¥100', value: 100 },
          { label: '¥500', value: 500 },
          { label: '¥1K', value: 1000 },
          { label: '¥5K', value: 5000 },
          { label: '¥10K', value: 10000 }
        ];

      // Taiwan Dollar - Higher amounts
      case 'TWD':
        return [
          { label: 'NT$1K', value: 1000 },
          { label: 'NT$3K', value: 3000 },
          { label: 'NT$10K', value: 10000 },
          { label: 'NT$30K', value: 30000 },
          { label: 'NT$100K', value: 100000 }
        ];

      // Thai Baht - Higher amounts
      case 'THB':
        return [
          { label: '฿500', value: 500 },
          { label: '฿1K', value: 1000 },
          { label: '฿5K', value: 5000 },
          { label: '฿10K', value: 10000 },
          { label: '฿50K', value: 50000 }
        ];

      // Singapore Dollar - Similar to USD
      case 'SGD':
        return [
          { label: 'S$50', value: 50 },
          { label: 'S$100', value: 100 },
          { label: 'S$500', value: 500 },
          { label: 'S$1K', value: 1000 },
          { label: 'S$5K', value: 5000 }
        ];

      // Malaysian Ringgit - Moderate amounts
      case 'MYR':
        return [
          { label: 'RM100', value: 100 },
          { label: 'RM500', value: 500 },
          { label: 'RM1K', value: 1000 },
          { label: 'RM5K', value: 5000 },
          { label: 'RM10K', value: 10000 }
        ];

      // South Korean Won - Very high amounts
      case 'KRW':
        return [
          { label: '₩50K', value: 50000 },
          { label: '₩100K', value: 100000 },
          { label: '₩500K', value: 500000 },
          { label: '₩1M', value: 1000000 },
          { label: '₩5M', value: 5000000 }
        ];

      // Hong Kong Dollar - Moderate amounts
      case 'HKD':
        return [
          { label: 'HK$200', value: 200 },
          { label: 'HK$500', value: 500 },
          { label: 'HK$1K', value: 1000 },
          { label: 'HK$5K', value: 5000 },
          { label: 'HK$10K', value: 10000 }
        ];

      // Indian Rupee - Higher amounts
      case 'INR':
        return [
          { label: '₹1K', value: 1000 },
          { label: '₹5K', value: 5000 },
          { label: '₹10K', value: 10000 },
          { label: '₹50K', value: 50000 },
          { label: '₹100K', value: 100000 }
        ];

      // Philippine Peso - Higher amounts
      case 'PHP':
        return [
          { label: '₱1K', value: 1000 },
          { label: '₱5K', value: 5000 },
          { label: '₱10K', value: 10000 },
          { label: '₱25K', value: 25000 },
          { label: '₱50K', value: 50000 }
        ];

      // Vietnamese Dong - Very high amounts
      case 'VND':
        return [
          { label: '₫500K', value: 500000 },
          { label: '₫1M', value: 1000000 },
          { label: '₫5M', value: 5000000 },
          { label: '₫10M', value: 10000000 },
          { label: '₫50M', value: 50000000 }
        ];

      // Brazilian Real - Moderate amounts
      case 'BRL':
        return [
          { label: 'R$100', value: 100 },
          { label: 'R$500', value: 500 },
          { label: 'R$1K', value: 1000 },
          { label: 'R$5K', value: 5000 },
          { label: 'R$10K', value: 10000 }
        ];

      // Canadian Dollar - Similar to USD
      case 'CAD':
        return [
          { label: 'C$50', value: 50 },
          { label: 'C$100', value: 100 },
          { label: 'C$500', value: 500 },
          { label: 'C$1K', value: 1000 },
          { label: 'C$5K', value: 5000 }
        ];

      // New Zealand Dollar - Similar to AUD
      case 'NZD':
        return [
          { label: 'NZ$50', value: 50 },
          { label: 'NZ$100', value: 100 },
          { label: 'NZ$500', value: 500 },
          { label: 'NZ$1K', value: 1000 },
          { label: 'NZ$5K', value: 5000 }
        ];

      // Swiss Franc - Higher value like GBP
      case 'CHF':
        return [
          { label: 'CHF25', value: 25 },
          { label: 'CHF50', value: 50 },
          { label: 'CHF200', value: 200 },
          { label: 'CHF500', value: 500 },
          { label: 'CHF2K', value: 2000 }
        ];

      // Russian Ruble - Higher amounts
      case 'RUB':
        return [
          { label: '₽1K', value: 1000 },
          { label: '₽5K', value: 5000 },
          { label: '₽10K', value: 10000 },
          { label: '₽50K', value: 50000 },
          { label: '₽100K', value: 100000 }
        ];

      // UAE Dirham - Moderate amounts
      case 'AED':
        return [
          { label: 'د.إ200', value: 200 },
          { label: 'د.إ500', value: 500 },
          { label: 'د.إ1K', value: 1000 },
          { label: 'د.إ5K', value: 5000 },
          { label: 'د.إ10K', value: 10000 }
        ];

      // Saudi Riyal - Moderate amounts
      case 'SAR':
        return [
          { label: 'ر.س200', value: 200 },
          { label: 'ر.س500', value: 500 },
          { label: 'ر.س1K', value: 1000 },
          { label: 'ر.س5K', value: 5000 },
          { label: 'ر.س10K', value: 10000 }
        ];

      // Turkish Lira - Higher amounts due to inflation
      case 'TRY':
        return [
          { label: '₺500', value: 500 },
          { label: '₺1K', value: 1000 },
          { label: '₺5K', value: 5000 },
          { label: '₺10K', value: 10000 },
          { label: '₺50K', value: 50000 }
        ];

      // Mexican Peso - Higher amounts
      case 'MXN':
        return [
          { label: '$500', value: 500 },
          { label: '$1K', value: 1000 },
          { label: '$5K', value: 5000 },
          { label: '$10K', value: 10000 },
          { label: '$25K', value: 25000 }
        ];

      // South African Rand - Higher amounts
      case 'ZAR':
        return [
          { label: 'R500', value: 500 },
          { label: 'R1K', value: 1000 },
          { label: 'R5K', value: 5000 },
          { label: 'R10K', value: 10000 },
          { label: 'R25K', value: 25000 }
        ];

      // Egyptian Pound - Higher amounts
      case 'EGP':
        return [
          { label: 'ج.م500', value: 500 },
          { label: 'ج.م1K', value: 1000 },
          { label: 'ج.م5K', value: 5000 },
          { label: 'ج.م10K', value: 10000 },
          { label: 'ج.م25K', value: 25000 }
        ];

      // Norwegian Krone - Higher amounts
      case 'NOK':
        return [
          { label: 'kr500', value: 500 },
          { label: 'kr1K', value: 1000 },
          { label: 'kr5K', value: 5000 },
          { label: 'kr10K', value: 10000 },
          { label: 'kr25K', value: 25000 }
        ];

      // Swedish Krona - Similar to NOK
      case 'SEK':
        return [
          { label: 'kr500', value: 500 },
          { label: 'kr1K', value: 1000 },
          { label: 'kr5K', value: 5000 },
          { label: 'kr10K', value: 10000 },
          { label: 'kr25K', value: 25000 }
        ];

      // Danish Krone - Similar to SEK/NOK
      case 'DKK':
        return [
          { label: 'kr500', value: 500 },
          { label: 'kr1K', value: 1000 },
          { label: 'kr5K', value: 5000 },
          { label: 'kr10K', value: 10000 },
          { label: 'kr25K', value: 25000 }
        ];

      // Polish Zloty - Higher amounts
      case 'PLN':
        return [
          { label: 'zł200', value: 200 },
          { label: 'zł500', value: 500 },
          { label: 'zł1K', value: 1000 },
          { label: 'zł5K', value: 5000 },
          { label: 'zł10K', value: 10000 }
        ];

      // Czech Koruna - Higher amounts
      case 'CZK':
        return [
          { label: 'Kč1K', value: 1000 },
          { label: 'Kč5K', value: 5000 },
          { label: 'Kč10K', value: 10000 },
          { label: 'Kč25K', value: 25000 },
          { label: 'Kč50K', value: 50000 }
        ];

      // Hungarian Forint - Very high amounts
      case 'HUF':
        return [
          { label: 'Ft10K', value: 10000 },
          { label: 'Ft50K', value: 50000 },
          { label: 'Ft100K', value: 100000 },
          { label: 'Ft500K', value: 500000 },
          { label: 'Ft1M', value: 1000000 }
        ];

      // Israeli Shekel - Moderate amounts
      case 'ILS':
        return [
          { label: '₪200', value: 200 },
          { label: '₪500', value: 500 },
          { label: '₪1K', value: 1000 },
          { label: '₪5K', value: 5000 },
          { label: '₪10K', value: 10000 }
        ];

      // Nigerian Naira - Higher amounts
      case 'NGN':
        return [
          { label: '₦10K', value: 10000 },
          { label: '₦50K', value: 50000 },
          { label: '₦100K', value: 100000 },
          { label: '₦500K', value: 500000 },
          { label: '₦1M', value: 1000000 }
        ];

      // Argentine Peso - Very high amounts due to inflation
      case 'ARS':
        return [
          { label: '$10K', value: 10000 },
          { label: '$50K', value: 50000 },
          { label: '$100K', value: 100000 },
          { label: '$500K', value: 500000 },
          { label: '$1M', value: 1000000 }
        ];

      // Chilean Peso - Very high amounts
      case 'CLP':
        return [
          { label: '$50K', value: 50000 },
          { label: '$100K', value: 100000 },
          { label: '$500K', value: 500000 },
          { label: '$1M', value: 1000000 },
          { label: '$5M', value: 5000000 }
        ];

      // Colombian Peso - Very high amounts
      case 'COP':
        return [
          { label: '$100K', value: 100000 },
          { label: '$500K', value: 500000 },
          { label: '$1M', value: 1000000 },
          { label: '$5M', value: 5000000 },
          { label: '$10M', value: 10000000 }
        ];

      // USDT (Tether) - Same as USD
      case 'USDT':
        return [
          { label: '₮50', value: 50 },
          { label: '₮100', value: 100 },
          { label: '₮500', value: 500 },
          { label: '₮1K', value: 1000 },
          { label: '₮5K', value: 5000 }
        ];

      // Default fallback for unknown currencies
      default:
        return [
          { label: '50', value: 50 },
          { label: '100', value: 100 },
          { label: '500', value: 500 },
          { label: '1K', value: 1000 },
          { label: '5K', value: 5000 }
        ];
    }
  };

  const quickAmounts = getCurrencyQuickAmounts(currency);

  const handleQuickAmount = (value: number) => {
    if (!disabled) {
      onAmountSelect(value);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {quickAmounts.map((amt) => (
        <button
          key={amt.value}
          type="button"
          onClick={() => handleQuickAmount(amt.value)}
          disabled={disabled}
          className="px-3 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium hover:from-green-200 hover:to-blue-200 dark:hover:from-green-800/40 dark:hover:to-blue-800/40 transition-all duration-200 border border-green-200 dark:border-green-700 hover:scale-105 min-h-[36px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {amt.label}
        </button>
      ))}
    </div>
  );
};

export default QuickAmountButtons;