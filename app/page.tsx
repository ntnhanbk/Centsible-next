"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, Plus, Minus, ArrowUpRight, ArrowDownRight,
  Coffee, ShoppingBag, Zap, Car, Gamepad2, HeartPulse, GraduationCap, Briefcase, Gift, Loader2, Home
} from "lucide-react";
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Header, PageContainer } from "@/components/AppShell";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";
import { useAuth } from "@/lib/providers/AuthProvider";

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase, utensils: Coffee, "shopping-bag": ShoppingBag,
  home: Home, zap: Zap, car: Car, "gamepad-2": Gamepad2,
  "heart-pulse": HeartPulse, "graduation-cap": GraduationCap, gift: Gift,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || Coffee;
}

export default function DashboardPage() {
  const { t, theme, language } = useAppContext();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [isLoading, setIsLoading] = useState(true);

  const [transactions, setTransactions] = useState<Array<{
    _id: string;
    amount: number;
    type: "income" | "expense";
    category: { name: string; icon: string; color: string };
    date: string;
    note: string;
  }>>([]);
  const [budgets, setBudgets] = useState<Array<{ categoryId: string; amount: number }>>([]);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    async function fetchData() {
      try {
        const [txRes, budgetRes] = await Promise.all([
          fetch(`/api/transactions?month=${currentMonth}`),
          fetch(`/api/budgets?month=${currentMonth}`),
        ]);

        const txData = await txRes.json();
        const budgetData = await budgetRes.json();

        if (txData.transactions) setTransactions(txData.transactions);
        if (budgetData.budgets) setBudgets(budgetData.budgets);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentMonth]);

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryMap = new Map<string, { name: string; color: string; icon: string }>();
  transactions.forEach((t) => {
    if (t.category && !categoryMap.has(t.category.name)) {
      categoryMap.set(t.category.name, t.category);
    }
  });

  const categoryData = Array.from(categoryMap.values()).map((cat) => {
    const val = transactions
      .filter((t) => t.type === "expense" && t.category?.name === cat.name)
      .reduce((s, t) => s + t.amount, 0);
    return { name: cat.name, value: val, color: cat.color };
  }).filter((c) => c.value > 0);

  const lastMonths = [
    `${today.getFullYear()}-${String(today.getMonth()).padStart(2, "0")}`,
    currentMonth,
  ];

  const monthNamesVi = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
  const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const trendData = lastMonths.map((m) => {
    const monthIndex = parseInt(m.slice(-2)) - 1;
    const monthNames = language === "vi" ? monthNamesVi : monthNamesEn;
    const tx = transactions.filter((t) => t.date.startsWith(m));
    return {
      name: monthNames[monthIndex] || m.slice(-2),
      income: tx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: tx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  const topExpenses = [...transactions]
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  if (isLoading) {
    return (
      <>
        <Header title={t('Loading...')} subtitle={formatDate(today)} />
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        </PageContainer>
      </>
    );
  }

  const displayName = user?.name?.split(" ")[0] || t('User') || "User";

  return (
    <>
      <Header title={`Hey, ${displayName} 👋`} subtitle={formatDate(today)} />
      <PageContainer>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-[24px] p-5 text-white shadow-xl">
            <p className="text-emerald-100 text-sm font-medium">{t('Available Balance') || "Available Balance"}</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(balance, language)}</p>
            <div className="mt-4 flex gap-3">
              <div className="flex-1 bg-white/20 rounded-2xl p-3">
                <div className="flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /><span className="text-sm">{t('Income') || "Income"}</span></div>
                <p className="mt-1 font-semibold">{formatCurrency(totalIncome, language)}</p>
              </div>
              <div className="flex-1 bg-white/20 rounded-2xl p-3">
                <div className="flex items-center gap-2"><ArrowDownRight className="h-4 w-4" /><span className="text-sm">{t('Expense') || "Expense"}</span></div>
                <p className="mt-1 font-semibold">{formatCurrency(totalExpense, language)}</p>
              </div>
            </div>
          </div>

          <div className={cn("rounded-[24px] p-4 border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
            <p className={cn("font-semibold mb-3", isDark ? "text-slate-200" : "text-slate-800")}>{t('Expenses by Category') || "Expenses by Category"}</p>
            <div className="h-44 -mx-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v as number, language)} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {categoryData.slice(0, 5).map((c) => (
                <div key={c.name} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors", isDark ? "bg-slate-700" : "bg-slate-50")}>
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className={cn("text-xs", isDark ? "text-slate-300" : "text-slate-600")}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("rounded-[24px] p-4 border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
            <p className={cn("font-semibold mb-3", isDark ? "text-slate-200" : "text-slate-800")}>{t('Month Trend') || "Month Trend"}</p>
            <div className="h-36 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#94a3b8' }} tickFormatter={(v) => language === "vi" ? `${Number(v)/1000000}M` : `${Number(v)/1000000}M`} />
                  <Tooltip formatter={(v) => formatCurrency(v as number, language)} contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', border: 'none', borderRadius: '8px', color: isDark ? '#fff' : '#000' }} />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className={cn("font-semibold mb-3", isDark ? "text-slate-200" : "text-slate-800")}>{t('Top Expenses') || "Top Expenses"}</p>
            <div className="space-y-2">
              {topExpenses.length === 0 ? (
                <p className={cn("text-center py-8", isDark ? "text-slate-500" : "text-slate-400")}>{t('No expenses yet') || "No expenses yet"}</p>
              ) : (
                topExpenses.map((t) => {
                  const Icon = getIcon(t.category?.icon || "coffee");
                  return (
                    <div key={t._id} className={cn("rounded-2xl p-4 border flex items-center gap-3 transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${t.category?.color || '#888'}20` }}>
                        <Icon className="h-5 w-5" style={{ color: t.category?.color || '#888' }} />
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-semibold", isDark ? "text-slate-200" : "text-slate-900")}>{t.note || t.category?.name}</p>
                        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{t.category?.name}</p>
                      </div>
                      <p className={cn("font-bold", isDark ? "text-red-400" : "text-red-600")}>-{formatCurrency(t.amount, language)}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}