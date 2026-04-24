import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_CONFIG: Record<string, { locale: string; currency: string; symbol: string; decimals: number }> = {
  vi: { locale: "vi-VN", currency: "VND", symbol: "₫", decimals: 0 },
  en: { locale: "en-US", currency: "USD", symbol: "$", decimals: 2 },
  bg: { locale: "bg-BG", currency: "BGN", symbol: "лв.", decimals: 2 },
  cs: { locale: "cs-CZ", currency: "CZK", symbol: "Kč", decimals: 2 },
  da: { locale: "da-DK", currency: "DKK", symbol: "kr", decimals: 2 },
  de: { locale: "de-DE", currency: "EUR", symbol: "€", decimals: 2 },
  el: { locale: "el-GR", currency: "EUR", symbol: "€", decimals: 2 },
  es: { locale: "es-ES", currency: "EUR", symbol: "€", decimals: 2 },
  et: { locale: "et-EE", currency: "EUR", symbol: "€", decimals: 2 },
  fi: { locale: "fi-FI", currency: "EUR", symbol: "€", decimals: 2 },
  fr: { locale: "fr-FR", currency: "EUR", symbol: "€", decimals: 2 },
  ga: { locale: "ga-IE", currency: "EUR", symbol: "€", decimals: 2 },
  hr: { locale: "hr-HR", currency: "EUR", symbol: "€", decimals: 2 },
  hu: { locale: "hu-HU", currency: "HUF", symbol: "Ft", decimals: 0 },
  it: { locale: "it-IT", currency: "EUR", symbol: "€", decimals: 2 },
  lt: { locale: "lt-LT", currency: "EUR", symbol: "€", decimals: 2 },
  lv: { locale: "lv-LV", currency: "EUR", symbol: "€", decimals: 2 },
  mt: { locale: "mt-MT", currency: "EUR", symbol: "€", decimals: 2 },
  nl: { locale: "nl-NL", currency: "EUR", symbol: "€", decimals: 2 },
  pl: { locale: "pl-PL", currency: "PLN", symbol: "zł", decimals: 2 },
  pt: { locale: "pt-PT", currency: "EUR", symbol: "€", decimals: 2 },
  ro: { locale: "ro-RO", currency: "RON", symbol: "lei", decimals: 2 },
  sk: { locale: "sk-SK", currency: "EUR", symbol: "€", decimals: 2 },
  sl: { locale: "sl-SI", currency: "EUR", symbol: "€", decimals: 2 },
  sv: { locale: "sv-SE", currency: "SEK", symbol: "kr", decimals: 2 },
};

export function formatCurrency(amount: number, language: string = "vi"): string {
  const config = CURRENCY_CONFIG[language] || CURRENCY_CONFIG["en"];
  
  if (config.decimals === 0) {
    const formatted = new Intl.NumberFormat(config.locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    return config.symbol + formatted;
  }
  
  const formatted = new Intl.NumberFormat(config.locale, { minimumFractionDigits: config.decimals, maximumFractionDigits: config.decimals }).format(Math.abs(amount));
  const sign = amount < 0 ? "-" : "";
  return sign + config.symbol + formatted;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}