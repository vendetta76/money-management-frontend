// helpers/formatCurrency.ts
// Enhanced Universal Currency Formatter
// Now handles ANY currency - traditional, crypto, custom, or completely unknown

interface CurrencyConfig {
  symbol: string;
  name: string;
  decimals: number;
  type: 'fiat' | 'crypto' | 'custom' | 'unknown';
}

// Enhanced with auto-detection for unknown currencies
const autoDetectedCurrencies: Record<string, CurrencyConfig> = {};

export const formatCurrency = (
  amount: number,
  currency: string = "IDR",
  locale?: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  // Handle edge cases
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  
  if (!currency || currency.trim() === '') {
    currency = 'IDR';
  }

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

  // Enhanced cryptocurrency symbols and formatting
  const cryptoSymbols: Record<string, string> = {
  // Stablecoins
  'USDT': 'USDT', 'USDC': 'USDC', 'DAI': 'DAI', 'BUSD': 'BUSD',
  'TUSD': 'TUSD', 'FRAX': 'FRAX', 'LUSD': 'LUSD',

  // Major Cryptocurrencies
  'BTC': '₿', 'ETH': 'Ξ', 'BNB': 'BNB', 'ADA': '₳', 'DOT': '●',
  'LINK': 'LINK', 'SOL': 'SOL', 'MATIC': 'MATIC', 'AVAX': 'AVAX',
  'DOGE': 'DOGE', 'LTC': 'Ł', 'XRP': 'XRP', 'TRX': 'TRX',
  'UNI': 'UNI', 'CAKE': 'CAKE', 'SUSHI': 'SUSHI',

  // DeFi Tokens
  'AAVE': 'AAVE', 'COMP': 'COMP', 'MKR': 'MKR', 'SNX': 'SNX',
  'CRV': 'CRV', 'BAL': 'BAL', 'YFI': 'YFI',

  // Meme Coins
  'SHIB': 'SHIB', 'FLOKI': 'FLOKI', 'PEPE': 'PEPE'
};

  // Custom/Gaming currencies
  const customCurrencies: Record<string, string> = {
    'POINTS': 'PTS', 'CREDITS': 'CR', 'GEMS': '💎', 'GOLD': '🏆',
    'COINS': '🪙', 'TOKENS': '🎫', 'XP': 'XP', 'ENERGY': '⚡'
  };

  const currencyUpper = currency.toUpperCase();
  const selectedLocale = locale || localeMap[currencyUpper] || "en-US";
  
  // Dynamic decimal places based on currency type
  let minDigits = options?.minimumFractionDigits;
  let maxDigits = options?.maximumFractionDigits;
  
  if (minDigits === undefined || maxDigits === undefined) {
    if (currencyUpper === "IDR" || currencyUpper === "JPY" || currencyUpper === "KRW" || currencyUpper === "VND") {
      minDigits = minDigits ?? 0;
      maxDigits = maxDigits ?? 0;
    } else if (cryptoSymbols[currencyUpper]) {
      // Crypto currencies get more decimals
      minDigits = minDigits ?? 2;
      maxDigits = maxDigits ?? (currencyUpper === 'BTC' ? 8 : currencyUpper === 'ETH' ? 6 : 4);
    } else {
      minDigits = minDigits ?? 2;
      maxDigits = maxDigits ?? 2;
    }
  }

  // 1. Try ISO currency formatting first
  if (validIsoCurrencies.includes(currencyUpper)) {
    try {
      return new Intl.NumberFormat(selectedLocale, {
        style: "currency",
        currency: currencyUpper,
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      }).format(amount);
    } catch (error) {
      console.warn(`ISO currency formatting failed for ${currencyUpper}, using fallback`);
      return new Intl.NumberFormat(selectedLocale, {
        style: "decimal",
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      }).format(amount) + ` ${currencyUpper}`;
    }
  }

  // 2. Handle known cryptocurrencies
  if (cryptoSymbols[currencyUpper]) {
    const symbol = cryptoSymbols[currencyUpper];
    const formattedAmount = new Intl.NumberFormat(selectedLocale, {
      style: "decimal",
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(amount);
    return `${symbol} ${formattedAmount}`;
  }

  // 3. Handle known custom currencies
  if (customCurrencies[currencyUpper]) {
    const symbol = customCurrencies[currencyUpper];
    const formattedAmount = new Intl.NumberFormat(selectedLocale, {
      style: "decimal",
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(amount);
    return `${symbol} ${formattedAmount}`;
  }

  // 4. AUTO-DETECT UNKNOWN CURRENCIES 🚀
  // This is the new magic part that handles ANY currency!
  let detectedConfig = autoDetectedCurrencies[currencyUpper];
  
  if (!detectedConfig) {
    detectedConfig = autoDetectCurrency(currencyUpper);
    autoDetectedCurrencies[currencyUpper] = detectedConfig;
    console.info(`🆕 Auto-detected new currency: ${currencyUpper}`, detectedConfig);
  }

  // Format using detected configuration
  const formattedAmount = new Intl.NumberFormat(selectedLocale, {
    style: "decimal",
    minimumFractionDigits: Math.min(detectedConfig.decimals, minDigits || 2),
    maximumFractionDigits: detectedConfig.decimals,
  }).format(amount);

  return `${detectedConfig.symbol} ${formattedAmount}`;
};

// 🤖 Smart auto-detection for unknown currencies
function autoDetectCurrency(currency: string): CurrencyConfig {
  const upperCurrency = currency.toUpperCase();
  
  // Pattern 1: Cryptocurrency detection
  if (isCryptoCurrencyPattern(upperCurrency)) {
    return {
      symbol: upperCurrency,
      name: generateCryptoName(upperCurrency),
      decimals: 4,
      type: 'crypto'
    };
  }
  
  // Pattern 2: Gaming/Custom currency detection
  if (isCustomCurrencyPattern(upperCurrency)) {
    return {
      symbol: generateCustomSymbol(upperCurrency),
      name: generateCustomName(upperCurrency),
      decimals: 0,
      type: 'custom'
    };
  }
  
  // Pattern 3: Fiat currency detection (2-3 letters)
  if (isFiatCurrencyPattern(upperCurrency)) {
    return {
      symbol: upperCurrency,
      name: `${upperCurrency} Currency`,
      decimals: 2,
      type: 'fiat'
    };
  }
  
  // Fallback: Unknown currency
  return {
    symbol: upperCurrency,
    name: `${upperCurrency} Token`,
    decimals: 2,
    type: 'unknown'
  };
}

function isCryptoCurrencyPattern(currency: string): boolean {
  // Common crypto patterns
  const cryptoPatterns = [
    /^[A-Z]{4,10}(COIN|TOKEN)$/,    // Ends with COIN or TOKEN
    /^(USDT|USDC|BUSD|DAI)/,        // Stablecoin patterns
    /(SWAP|DEX|FINANCE|PROTOCOL)$/,  // DeFi patterns
    /^[A-Z]{3,6}$/,                 // 3-6 letter codes (common for crypto)
  ];
  
  const cryptoKeywords = ['COIN', 'TOKEN', 'SWAP', 'FINANCE', 'PROTOCOL', 'CHAIN'];
  
  return cryptoPatterns.some(pattern => pattern.test(currency)) ||
         cryptoKeywords.some(keyword => currency.includes(keyword));
}

function isCustomCurrencyPattern(currency: string): boolean {
  const customKeywords = ['POINTS', 'CREDITS', 'GEMS', 'GOLD', 'SILVER', 'XP', 'ENERGY', 'COINS', 'STARS'];
  return customKeywords.some(keyword => currency.includes(keyword));
}

function isFiatCurrencyPattern(currency: string): boolean {
  // Traditional fiat currencies are usually 2-3 letters
  return /^[A-Z]{2,3}$/.test(currency);
}

function generateCryptoName(currency: string): string {
  const commonCryptoNames: Record<string, string> = {
    'DOGECOIN': 'Dogecoin',
    'SHIBATOKEN': 'Shiba Token',
    'SAFEMOON': 'SafeMoon',
    'BABYDOGE': 'Baby Doge',
  };
  
  return commonCryptoNames[currency] || 
         currency.replace(/TOKEN|COIN/, '').trim() + ' Token';
}

function generateCustomName(currency: string): string {
  return currency.charAt(0) + currency.slice(1).toLowerCase();
}

function generateCustomSymbol(currency: string): string {
  const symbolMap: Record<string, string> = {
    'POINTS': 'PTS',
    'CREDITS': 'CR',
    'GEMS': '💎',
    'GOLD': '🏆',
    'SILVER': '🥈',
    'COINS': '🪙',
    'STARS': '⭐',
    'XP': 'XP',
    'ENERGY': '⚡'
  };
  
  for (const [keyword, symbol] of Object.entries(symbolMap)) {
    if (currency.includes(keyword)) {
      return symbol;
    }
  }
  
  return currency.substring(0, 3);
}

// Enhanced utility functions
export const isCryptoCurrency = (currency: string): boolean => {
  if (!currency) return false;
  
  const knownCryptos = [
    'BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'ADA', 'DOT', 'LINK', 'SOL', 'MATIC',
    'AVAX', 'DOGE', 'LTC', 'XRP', 'TRX', 'CAKE', 'UNI', 'DAI', 'BUSD', 'SHIB'
  ];
  
  const upperCurrency = currency.toUpperCase();
  
  // Check known cryptos first
  if (knownCryptos.includes(upperCurrency)) return true;
  
  // Check auto-detected cryptos
  const detected = autoDetectedCurrencies[upperCurrency];
  if (detected?.type === 'crypto') return true;
  
  // Check patterns for unknown cryptos
  return isCryptoCurrencyPattern(upperCurrency);
};

export const getCurrencySymbol = (currency: string): string => {
  if (!currency) return '';
  
  const upperCurrency = currency.toUpperCase();
  
  // Check known symbols first
  const knownSymbols: Record<string, string> = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'IDR': 'Rp',
    'USDT': 'USDT', 'USDC': 'USDC', 'BTC': '₿', 'ETH': 'Ξ', 'BNB': 'BNB'
  };
  
  if (knownSymbols[upperCurrency]) {
    return knownSymbols[upperCurrency];
  }
  
  // Check auto-detected currencies
  const detected = autoDetectedCurrencies[upperCurrency];
  if (detected) {
    return detected.symbol;
  }
  
  // Auto-detect and return symbol
  const config = autoDetectCurrency(upperCurrency);
  autoDetectedCurrencies[upperCurrency] = config;
  return config.symbol;
};

export const getCurrencyType = (currency: string): 'fiat' | 'crypto' | 'custom' | 'unknown' => {
  if (!currency) return 'unknown';
  
  const upperCurrency = currency.toUpperCase();
  
  // Check auto-detected currencies
  const detected = autoDetectedCurrencies[upperCurrency];
  if (detected) {
    return detected.type;
  }
  
  // Auto-detect and return type
  const config = autoDetectCurrency(upperCurrency);
  autoDetectedCurrencies[upperCurrency] = config;
  return config.type;
};

export const formatCurrencyCompact = (
  amount: number, 
  currency: string = "IDR"
): string => {
  const symbol = getCurrencySymbol(currency);
  
  if (amount >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency);
};

// 🚀 NEW: Add custom currency at runtime
export const addCustomCurrency = (
  code: string, 
  config: Partial<CurrencyConfig>
): void => {
  const upperCode = code.toUpperCase();
  
  const fullConfig: CurrencyConfig = {
    symbol: config.symbol || upperCode,
    name: config.name || `${upperCode} Currency`,
    decimals: config.decimals ?? 2,
    type: config.type || 'custom'
  };
  
  autoDetectedCurrencies[upperCode] = fullConfig;
  console.info(`➕ Added custom currency: ${upperCode}`, fullConfig);
};

// 🚀 NEW: Get all detected currencies
export const getDetectedCurrencies = (): Record<string, CurrencyConfig> => {
  return { ...autoDetectedCurrencies };
};

// 🚀 NEW: Clear auto-detected currencies (for testing)
export const clearDetectedCurrencies = (): void => {
  Object.keys(autoDetectedCurrencies).forEach(key => {
    delete autoDetectedCurrencies[key];
  });
  console.info('🗑️ Cleared all auto-detected currencies');
};