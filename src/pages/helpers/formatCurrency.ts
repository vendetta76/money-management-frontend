export const formatCurrency = (
  amount: number,
  currency: string = "IDR",
  locale?: string
): string => {
  const localeMap: Record<string, string> = {
    IDR: "id-ID",       // Indonesian Rupiah
    USD: "en-US",       // US Dollar
    EUR: "de-DE",       // Euro
    GBP: "en-GB",       // British Pound
    JPY: "ja-JP",       // Japanese Yen
    AUD: "en-AU",       // Australian Dollar
    CNY: "zh-CN",       // Chinese Yuan
    TWD: "zh-TW",       // Taiwan Dollar
    THB: "th-TH",       // Thai Baht
    SGD: "en-SG",       // Singapore Dollar
    MYR: "ms-MY",       // Malaysian Ringgit
    KRW: "ko-KR",       // South Korean Won
    HKD: "zh-HK",       // Hong Kong Dollar
    INR: "en-IN",       // Indian Rupee
    PHP: "en-PH",       // Philippine Peso
    VND: "vi-VN",       // Vietnamese Dong
    BRL: "pt-BR",       // Brazilian Real
    CAD: "en-CA",       // Canadian Dollar
    NZD: "en-NZ",       // New Zealand Dollar
    CHF: "fr-CH",       // Swiss Franc
    RUB: "ru-RU",       // Russian Ruble
    AED: "ar-AE",       // UAE Dirham
    SAR: "ar-SA",       // Saudi Riyal
    TRY: "tr-TR",       // Turkish Lira
    MXN: "es-MX",       // Mexican Peso
    ZAR: "en-ZA",       // South African Rand
    EGP: "ar-EG",       // Egyptian Pound
    NOK: "nb-NO",       // Norwegian Krone
    SEK: "sv-SE",       // Swedish Krona
    DKK: "da-DK",       // Danish Krone
    PLN: "pl-PL",       // Polish Zloty
    CZK: "cs-CZ",       // Czech Koruna
    HUF: "hu-HU",       // Hungarian Forint
    ILS: "he-IL",       // Israeli Shekel
    NGN: "en-NG",       // Nigerian Naira
    ARS: "es-AR",       // Argentine Peso
    CLP: "es-CL",       // Chilean Peso
    COP: "es-CO",       // Colombian Peso
    USDT: "en-US"       // Tether (fallback to US style decimal)
  };

  const selectedLocale = locale || localeMap[currency] || "en-US";

  try {
    return new Intl.NumberFormat(selectedLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // fallback untuk non-ISO currency
    return new Intl.NumberFormat(selectedLocale, {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ` ${currency}`;
  }
};
