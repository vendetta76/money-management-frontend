export const formatCurrency = (
  amount: number,
  currency: string = "IDR",
  locale?: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  // Valid ISO currency codes that work with Intl.NumberFormat
  const validIsoCurrencies = [
    'IDR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CNY', 'TWD', 'THB', 'SGD',
    'MYR', 'KRW', 'HKD', 'INR', 'PHP', 'VND', 'BRL', 'CAD', 'NZD', 'CHF',
    'RUB', 'AED', 'SAR', 'TRY', 'MXN', 'ZAR', 'EGP', 'NOK', 'SEK', 'DKK',
    'PLN', 'CZK', 'HUF', 'ILS', 'NGN', 'ARS', 'CLP', 'COP'
  ];

  // Locale mapping for ISO currencies
  const localeMap: Record<string, string> = {
    IDR: "id-ID", USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP",
    AUD: "en-AU", CNY: "zh-CN", TWD: "zh-TW", THB: "th-TH", SGD: "en-SG",
    MYR: "ms-MY", KRW: "ko-KR", HKD: "zh-HK", INR: "en-IN", PHP: "en-PH",
    VND: "vi-VN", BRL: "pt-BR", CAD: "en-CA", NZD: "en-NZ", CHF: "fr-CH",
    RUB: "ru-RU", AED: "ar-AE", SAR: "ar-SA", TRY: "tr-TR", MXN: "es-MX",
    ZAR: "en-ZA", EGP: "ar-EG", NOK: "nb-NO", SEK: "sv-SE", DKK: "da-DK",
    PLN: "pl-PL", CZK: "cs-CZ", HUF: "hu-HU", ILS: "he-IL", NGN: "en-NG",
    ARS: "es-AR", CLP: "es-CL", COP: "es-CO"
  };

  // Cryptocurrency symbols and formatting
  const cryptoSymbols: Record<string, string> = {
    'USDT': '$',
    'USDC': '$',
    'DAI': '$',
    'BUSD': '$',
    'BTC': '₿',
    'ETH': 'Ξ',
    'BNB': 'BNB',
    'ADA': '₳',
    'DOT': '●',
    'LINK': '🔗',
    'SOL': '◎',
    'MATIC': '⬟',
    'AVAX': '🔺',
    'DOGE': 'Ð',
    'LTC': 'Ł',
    'XRP': 'XRP',
    'TRX': 'TRX',
    'CAKE': '🥞',
    'UNI': '🦄'
  };

  const currencyUpper = currency.toUpperCase();
  const selectedLocale = locale || localeMap[currencyUpper] || "en-US";
  const minDigits = options?.minimumFractionDigits ?? (currencyUpper === "IDR" ? 0 : 2);
  const maxDigits = options?.maximumFractionDigits ?? (currencyUpper === "IDR" ? 0 : 2);

  // Check if it's a valid ISO currency
  if (validIsoCurrencies.includes(currencyUpper)) {
    try {
      return new Intl.NumberFormat(selectedLocale, {
        style: "currency",
        currency: currencyUpper,
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      }).format(amount);
    } catch (error) {
      // Fallback if currency formatting fails
      console.warn(`Currency formatting failed for ${currencyUpper}, using fallback`);
      return new Intl.NumberFormat(selectedLocale, {
        style: "decimal",
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      }).format(amount) + ` ${currencyUpper}`;
    }
  }

  // Handle cryptocurrencies and other non-ISO currencies
  const symbol = cryptoSymbols[currencyUpper] || currencyUpper;
  const formattedAmount = new Intl.NumberFormat(selectedLocale, {
    style: "decimal",
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(amount);

  // For crypto, show symbol before amount
  return `${symbol} ${formattedAmount}`;
};

// Additional utility functions for crypto support
export const isCryptoCurrency = (currency: string): boolean => {
  const cryptos = [
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'ADA', 'DOT', 'LINK', 'SOL', 'MATIC',
    'AVAX', 'DOGE', 'LTC', 'XRP', 'TRX', 'CAKE', 'UNI', 'DAI', 'BUSD'
  ];
  return cryptos.includes(currency?.toUpperCase());
};

export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'IDR': 'Rp',
    'USDT': '$', 'USDC': '$', 'BTC': '₿', 'ETH': 'Ξ', 'BNB': 'BNB'
  };
  return symbols[currency?.toUpperCase()] || currency?.toUpperCase() || '';
};

export const formatCurrencyCompact = (
  amount: number, 
  currency: string = "IDR"
): string => {
  if (amount >= 1_000_000_000) {
    return `${getCurrencySymbol(currency)}${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${getCurrencySymbol(currency)}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${getCurrencySymbol(currency)}${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
};