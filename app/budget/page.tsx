"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, TrendingDown, Edit, Trash2, Loader2 } from "lucide-react";
import { Header, PageContainer, FAB } from "@/components/AppShell";
import { formatCurrency, cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";

function formatNumberInput(value: string): string {
  const numbers = value.replace(/[^\d]/g, "");
  if (!numbers) return "";
  return new Intl.NumberFormat("vi-VN").format(parseInt(numbers));
}

export default function BudgetPage() {
  const { theme, t, language } = useAppContext();
  const isDark = theme === "dark";
  
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthNames = language === "vi" 
    ? ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
    : ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = `${monthNames[parseInt(currentMonth.split("-")[1])]}, ${currentMonth.split("-")[0]}`;

  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Array<{
    _id: string;
    amount: number;
    month: string;
    category: { _id: string; name: string; icon: string; color: string };
    spent?: number;
  }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; icon: string; color: string; type: string }>>([]);
  const [transactions, setTransactions] = useState<Array<{ _id: string; amount: number; type: string; category: { _id: string } | null; date: string }>>([]);
  
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMonth, setFormMonth] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [budgetRes, catRes, txRes] = await Promise.all([
          fetch(`/api/budgets?month=${currentMonth}`),
          fetch("/api/categories"),
          fetch(`/api/transactions?month=${currentMonth}`),
        ]);
        const budgetData = await budgetRes.json();
        const catData = await catRes.json();
        const txData = await txRes.json();
        if (budgetData.budgets) setBudgets(budgetData.budgets);
        if (catData.categories) setCategories(catData.categories);
        if (txData.transactions) setTransactions(txData.transactions);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentMonth]);

  const getStatus = (categoryId: string) => {
    const budget = budgets.find((b) => b.category._id === categoryId);
    if (!budget) return { spent: 0, budgetAmount: 0, percent: 0 };
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category && t.category._id === categoryId && t.date.startsWith(formMonth || currentMonth))
      .reduce((s, t) => s + t.amount, 0);
    return { spent, budgetAmount: budget.amount, percent: budget.amount > 0 ? (spent / budget.amount) * 100 : 0 };
  };

  const getSpentForCategory = (categoryId: string) => {
    return transactions
      .filter((t) => t.type === "expense" && t.category && t.category._id === categoryId && t.date.startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0);
  };

  const currentBudgets = budgets.filter((b) => b.month === currentMonth).map((b) => ({
    ...b,
    spent: getSpentForCategory(b.category._id),
  }));

  const totalBudget = currentBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = currentBudgets.reduce((s, b) => s + b.spent, 0);
  const percent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const variableCategories = categories.filter((c) => c.type === "variable" || c.type === "fixed");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formCategory || !formAmount || !formMonth) return;
    
    setFormSubmitting(true);
    try {
      const rawAmount = Number(formAmount.replace(/\./g, ""));
      const res = await fetch("/api/budgets", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          categoryId: formCategory,
          amount: rawAmount,
          month: formMonth,
        }),
      });
      const data = await res.json();
      if (data.budget) {
        if (editingId) {
          setBudgets(budgets.map((b) => b._id === editingId ? { ...b, amount: rawAmount } : b));
        } else {
          const cat = categories.find((c) => c._id === formCategory);
          if (cat) {
            setBudgets([...budgets, { ...data.budget, category: cat }]);
          }
        }
        resetForm();
      }
    } catch (err) {
      console.error("Failed to save budget:", err);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch("/api/budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setBudgets(budgets.filter((b) => b._id !== id));
      setSelectedBudget(null);
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  }

  function openEditModal(budget: typeof budgets[0]) {
    setEditingId(budget._id);
    setFormCategory(budget.category._id);
    setFormAmount(budget.amount.toString());
    setFormMonth(budget.month);
    setShowAddModal(true);
  }

  function resetForm() {
    setShowAddModal(false);
    setEditingId(null);
    setFormCategory("");
    setFormAmount("");
    setFormMonth("");
  }

  if (isLoading) {
    return (
      <>
        <Header title={t('Budget') || "Budget"} subtitle={currentMonthName} />
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Header title={t('Budget') || "Budget"} subtitle={currentMonthName} />
      <PageContainer>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[24px] p-5 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div><p className="text-slate-400 text-sm">{t('Spent')} / {t('Budget')}</p><p className="mt-1 text-xl font-bold">{formatCurrency(totalSpent, language)} <span className="text-slate-500">/ {formatCurrency(totalBudget, language)}</span></p></div>
              <p className="text-4xl font-bold text-emerald-400">{Math.round(percent)}%</p>
            </div>
            <div className="mt-4 h-2.5 bg-slate-700 rounded-full"><div className={`h-full rounded-full ${percent > 100 ? "bg-red-500" : percent > 80 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${Math.min(percent, 100)}%` }} /></div>
            <div className="mt-3 flex justify-between text-sm"><span className="text-slate-400">{t('Left')}: {formatCurrency(Math.max(totalBudget - totalSpent, 0), language)}</span></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={cn("rounded-2xl p-4 border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
              <div className={cn("flex items-center gap-2", isDark ? "text-slate-400" : "text-slate-500")}><TrendingDown className="h-4 w-4" /><span className="text-sm">{t('Spent')}</span></div><p className={cn("mt-1 text-lg font-bold", isDark ? "text-red-400" : "text-red-600")}>{formatCurrency(totalSpent, language)}</p>
            </div>
            <div className={cn("rounded-2xl p-4 border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
              <div className={cn("flex items-center gap-2", isDark ? "text-slate-400" : "text-slate-500")}><TrendingUp className="h-4 w-4" /><span className="text-sm">{t('Left')}</span></div><p className={cn("mt-1 text-lg font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>{formatCurrency(Math.max(totalBudget - totalSpent, 0), language)}</p>
            </div>
          </div>
          <div className="space-y-3">
            {currentBudgets.length === 0 ? (
              <p className={cn("text-center py-8", isDark ? "text-slate-500" : "text-slate-400")}>{t('No budgets set yet')}</p>
            ) : (
              currentBudgets.map((budget) => {
                const cat = budget.category;
                const status = getStatus(cat._id);
                return (
                  <div key={budget._id} onClick={() => setSelectedBudget(selectedBudget === budget._id ? null : budget._id)} className={cn("rounded-2xl p-4 border cursor-pointer transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${cat?.color}20` }}><span style={{ color: cat?.color }} className="text-lg font-bold">{cat?.name[0]}</span></div>
                        <div><p className={cn("font-semibold", isDark ? "text-slate-200" : "text-slate-900")}>{cat?.name}</p><p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{formatCurrency(status.spent, language)} / {formatCurrency(budget.amount, language)}</p></div>
                      </div>
                      <p className={cn("font-bold", status.percent > 100 ? (isDark ? "text-red-400" : "text-red-600") : isDark ? "text-emerald-400" : "text-emerald-600")}>{Math.round(status.percent)}%</p>
                    </div>
                    <div className={cn("mt-3 h-2 rounded-full", isDark ? "bg-slate-700" : "bg-slate-100")}><div className={`h-full rounded-full ${status.percent > 100 ? "bg-red-500" : status.percent > 80 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(status.percent, 100)}%` }} /></div>
                    {selectedBudget === budget._id && <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2"><button className="flex-1 px-3 py-2 border rounded-xl text-sm flex items-center justify-center gap-2" onClick={() => openEditModal(budget)}><Edit className="h-4 w-4" /> {t('Edit')}</button><button className="flex-1 px-3 py-2 border rounded-xl text-sm flex items-center justify-center gap-2 text-red-600 border-red-200" onClick={() => handleDelete(budget._id)}><Trash2 className="h-4 w-4" /> {t('Delete')}</button></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PageContainer>
      <FAB onClick={() => { resetForm(); setShowAddModal(true); }} />
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50" onClick={resetForm}>
          <div className={cn("w-full max-w-md rounded-t-[32px] p-6 pb-8", isDark ? "bg-slate-800" : "bg-white")} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6"><h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{editingId ? t('Edit Budget') : t('Add Budget')}</h2><button onClick={resetForm} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100">✕</button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className={cn("w-full h-14 px-4 rounded-2xl outline-none ring-0", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")} required>
                <option value="">{t('Select category')}</option>
                {variableCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <input type="text" placeholder="0" value={formAmount} onChange={(e) => setFormAmount(formatNumberInput(e.target.value))} className={cn("w-full h-14 px-4 rounded-2xl text-2xl font-bold outline-none ring-0", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")} required />
              <input type="month" value={formMonth} onChange={(e) => setFormMonth(e.target.value)} className={cn("w-full h-14 px-4 rounded-2xl outline-none ring-0", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")} required />
              <button type="submit" className="w-full h-14 mt-6 rounded-2xl text-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50" disabled={formSubmitting}>
                {formSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : editingId ? t('Update Budget') : t('Save Budget')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}