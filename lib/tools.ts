import dbConnect from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Category } from "@/models/Category";

const CURRENCY_SYMBOLS: Record<string, string> = {
  vi: "₫", en: "$", de: "€", fr: "€", es: "€", it: "€", nl: "€", pt: "€",
  pl: "zł", cs: "Kč", hu: "Ft", ro: "lei", bg: "лв.", dk: "kr", se: "kr",
};

const CURRENCY_LOCALES: Record<string, string> = {
  vi: "vi-VN", en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT",
  nl: "nl-NL", pt: "pt-PT", pl: "pl-PL", cs: "cs-CZ", hu: "hu-HU", ro: "ro-RO",
};

function formatAmount(amount: number, lang: string): string {
  const locale = CURRENCY_LOCALES[lang] || "vi-VN";
  const symbol = CURRENCY_SYMBOLS[lang] || "₫";
  const decimals = lang === "vi" || lang === "hu" ? 0 : 2;
  return symbol + new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export async function getFinancialSummary(userId: string, lang: string = "vi") {
  await dbConnect();
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const transactions = await Transaction.find({
    userId,
    date: { $regex: `^${currentMonth}` },
  }).lean();

  const totalIncome = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0);

  return {
    month: currentMonth,
    totalIncome: formatAmount(totalIncome, lang),
    totalExpense: formatAmount(totalExpense, lang),
    balance: formatAmount(totalIncome - totalExpense, lang),
    rawIncome: totalIncome,
    rawExpense: totalExpense,
    rawBalance: totalIncome - totalExpense,
  };
}

export async function getCategorySpending(userId: string, lang: string = "vi") {
  await dbConnect();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const transactions = await Transaction.find({
    userId,
    date: { $regex: `^${currentMonth}` },
    type: "expense",
  }).populate("category").lean();

  const spending: Record<string, number> = {};
  transactions.forEach((t: any) => {
    const catName = t.category?.name || "Khác";
    spending[catName] = (spending[catName] || 0) + t.amount;
  });

  return Object.entries(spending)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => ({
      category: cat,
      amount: formatAmount(amount, lang),
      rawAmount: amount,
    }));
}

export async function searchTransactions(userId: string, keyword: string = "", limit: number = 10, lang: string = "vi") {
  await dbConnect();

  const query: any = { userId };
  if (keyword) {
    query.note = { $regex: keyword, $options: "i" };
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1 })
    .limit(limit)
    .populate("category")
    .lean();

  return transactions.map((t: any) => ({
    date: t.date,
    type: t.type,
    amount: formatAmount(t.amount, lang),
    category: t.category?.name || "Khác",
    note: t.note || "-",
    rawAmount: t.amount,
  }));
}