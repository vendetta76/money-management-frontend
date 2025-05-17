export const formatCurrency = (
  amount: number,
  currency: string = "IDR",
  locale?: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  const localeMap: Record<string, string> = {
    IDR: "id-ID", USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP",
    AUD: "en-AU", CNY: "zh-CN", TWD: "zh-TW", THB: "th-TH", SGD: "en-SG",
    MYR: "ms-MY", KRW: "ko-KR", HKD: "zh-HK", INR: "en-IN", PHP: "en-PH",
    VND: "vi-VN", BRL: "pt-BR", CAD: "en-CA", NZD: "en-NZ", CHF: "fr-CH",
    RUB: "ru-RU", AED: "ar-AE", SAR: "ar-SA", TRY: "tr-TR", MXN: "es-MX",
    ZAR: "en-ZA", EGP: "ar-EG", NOK: "nb-NO", SEK: "sv-SE", DKK: "da-DK",
    PLN: "pl-PL", CZK: "cs-CZ", HUF: "hu-HU", ILS: "he-IL", NGN: "en-NG",
    ARS: "es-AR", CLP: "es-CL", COP: "es-CO", USDT: "en-US"
  };

  const selectedLocale = locale || localeMap[currency] || "en-US";
  const isIDR = currency === "IDR";
  const minDigits = options?.minimumFractionDigits ?? 0;
  const maxDigits = options?.maximumFractionDigits ?? 2;

  try {
    return new Intl.NumberFormat(selectedLocale, {
      style: "currency",
      currency,
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(amount);
  } catch {
    if (!isIDR) {
      return new Intl.NumberFormat(selectedLocale, {
        style: "decimal",
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      }).format(amount) + ` ${currency}`;
    } else {
      return amount.toLocaleString("id-ID"); // fallback mentok untuk IDR
    }
  }
};
