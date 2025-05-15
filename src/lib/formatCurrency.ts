export const formatCurrency = (
  amount: number,
  currency: string = "IDR",
  locale?: string
): string => {
  const localeMap: Record<string, string> = {
    IDR: "id-ID",         // Indonesian Rupiah
    USD: "en-US",         // US Dollar
    EUR: "de-DE",         // Euro (Germany style)
    GBP: "en-GB",         // British Pound
    JPY: "ja-JP",         // Japanese Yen
    CNY: "zh-CN",         // Chinese Yuan
    TWD: "zh-TW",         // Taiwan Dollar
    HKD: "zh-HK",         // Hong Kong Dollar
    SGD: "en-SG",         // Singapore Dollar
    MYR: "ms-MY",         // Malaysian Ringgit
    THB: "th-TH",         // Thai Baht
    KRW: "ko-KR",         // Korean Won
    PHP: "en-PH",         // Philippine Peso
    VND: "vi-VN",         // Vietnamese Dong
    AUD: "en-AU",         // Australian Dollar
    NZD: "en-NZ",         // New Zealand Dollar
    CAD: "en-CA",         // Canadian Dollar
    CHF: "fr-CH",         // Swiss Franc
    INR: "en-IN",         // Indian Rupee
    BRL: "pt-BR",         // Brazilian Real
    RUB: "ru-RU",         // Russian Ruble
    SAR: "ar-SA",         // Saudi Riyal
    AED: "ar-AE",         // UAE Dirham
    ZAR: "en-ZA",         // South African Rand
    MXN: "es-MX",         // Mexican Peso
    TRY: "tr-TR",         // Turkish Lira
    NOK: "nb-NO",         // Norwegian Krone
    SEK: "sv-SE",         // Swedish Krona
    DKK: "da-DK",         // Danish Krone
    PLN: "pl-PL",         // Polish Zloty
    CZK: "cs-CZ",         // Czech Koruna
    HUF: "hu-HU",         // Hungarian Forint
    ILS: "he-IL",         // Israeli Shekel
    NGN: "en-NG",         // Nigerian Naira
    ARS: "es-AR",         // Argentine Peso
    CLP: "es-CL",         // Chilean Peso
    COP: "es-CO",         // Colombian Peso
    EGP: "ar-EG"          // Egyptian Pound
  };

  const chosenLocale = locale || localeMap[currency] || "en-US";

  return amount.toLocaleString(chosenLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};