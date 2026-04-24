"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronUp, Coffee, ShoppingBag, Home, Zap, Car, Gamepad2, HeartPulse, GraduationCap, Briefcase, Gift, DollarSign, Trash2, Edit, Loader2 } from "lucide-react";
import { Header, PageContainer, FAB } from "@/components/AppShell";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase, utensils: Coffee, "shopping-bag": ShoppingBag,
  home: Home, zap: Zap, car: Car, "gamepad-2": Gamepad2,
  "heart-pulse": HeartPulse, "graduation-cap": GraduationCap, gift: Gift,
};

function formatNumberInput(value: string): string {
  const numbers = value.replace(/[^\d]/g, "");
  if (!numbers) return "";
  return new Intl.NumberFormat("vi-VN").format(parseInt(numbers));
}

export default function TransactionsPage() {
  const { theme, t, language } = useAppContext();
  const isDark = theme === "dark";
  
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [transactions, setTransactions] = useState<Array<{
    _id: string;
    amount: number;
    type: "income" | "expense";
    category: { _id: string; name: string; icon: string; color: string };
    date: string;
    note: string;
  }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; icon: string; color: string; type: string }>>([]);
  
  const [formAmount, setFormAmount] = useState("");
  const [formType, setFormType] = useState<"expense" | "income">("expense");
  const [formCategory, setFormCategory] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNote, setFormNote] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    async function fetchData() {
      try {
        const [txRes, catRes] = await Promise.all([
          fetch(`/api/transactions?month=${currentMonth}`),
          fetch("/api/categories"),
        ]);
        const txData = await txRes.json();
        const catData = await catRes.json();
        if (txData.transactions) setTransactions(txData.transactions);
        if (catData.categories) setCategories(catData.categories);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [currentMonth]);

  const filteredTransactions = transactions
    .filter((t) => (filterType === "all" || t.type === filterType) && (!search || t.note?.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedByDate = filteredTransactions.reduce((groups, t) => {
    const date = t.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(t);
    return groups;
  }, {} as Record<string, typeof transactions>);

  const filteredCategories = categories.filter((c) => 
    formType === "income" ? c.type === "income" : c.type === "variable" || c.type === "fixed"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formAmount || !formCategory || !formDate) return;
    
    setFormSubmitting(true);
    try {
      const rawAmount = Number(formAmount.replace(/\./g, ""));
      
      const res = await fetch("/api/transactions", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          amount: rawAmount,
          type: formType,
          category: formCategory,
          date: formDate,
          note: formNote,
        }),
      });
      
      const data = await res.json();
      
      if (data.transaction) {
        if (editingId) {
          setTransactions(transactions.map((t) => t._id === editingId ? data.transaction : t));
        } else {
          setTransactions([data.transaction, ...transactions]);
        }
        resetForm();
      } else if (data.error) {
        console.error("Error:", data.error);
      }
    } catch (err) {
      console.error("Failed to save transaction:", err);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTransactions(transactions.filter((t) => t._id !== id));
      setExpanded(null);
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  }

  function openEditModal(tx: typeof transactions[0]) {
    setEditingId(tx._id);
    setFormAmount(tx.amount.toString());
    setFormType(tx.type);
    setFormCategory(tx.category._id);
    setFormDate(tx.date);
    setFormNote(tx.note || "");
    setShowAddModal(true);
  }

  function resetForm() {
    setShowAddModal(false);
    setEditingId(null);
    setFormAmount("");
    setFormType("expense");
    setFormCategory("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormNote("");
  }

  if (isLoading) {
    return (
      <>
        <Header title={t('Transactions') || "Transactions"} subtitle={t('Manage your finances') || "Manage your finances"} />
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
      <Header title={t('Transactions') || "Transactions"} subtitle={t('Manage your finances') || "Manage your finances"} />
      <PageContainer>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input type="text" placeholder={t('Search...') || "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className={cn("w-full h-12 pl-12 pr-4 rounded-2xl border transition-colors outline-none focus:border-emerald-500", isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900")} />
          </div>
          <div className="flex gap-2">
            {(["all", "income", "expense"] as const).map((type) => (
              <button key={type} onClick={() => setFilterType(type)} className={cn("flex-shrink-0 h-10 px-5 rounded-full font-medium text-sm transition-colors", filterType === type ? "bg-emerald-500 text-white" : isDark ? "bg-slate-800 text-slate-300 border border-slate-700" : "bg-white text-slate-600 border border-slate-200")}>
                {type === "all" ? (t('All') || "All") : type === "income" ? (t('Income') || "Income") : (t('Expense') || "Expense")}
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {Object.keys(groupedByDate).length === 0 ? (
              <p className={cn("text-center py-8", isDark ? "text-slate-500" : "text-slate-400")}>{t('No transactions yet') || "No transactions yet"}</p>
            ) : (
              Object.entries(groupedByDate).map(([date, txs]) => (
                <div key={date}>
                  <div className="flex items-center justify-between py-2"><span className={cn("font-semibold", isDark ? "text-slate-400" : "text-slate-700")}>{formatDate(date)}</span></div>
                  <div className="space-y-2">
                    {txs.map((item) => {
                      const cat = item.category;
                      const Icon = iconMap[cat?.icon || "coffee"] || DollarSign;
                      const isExpanded = expanded === item._id;
                      return (
                        <div key={item._id}>
                          <button onClick={() => setExpanded(isExpanded ? null : item._id)} className={cn("w-full rounded-2xl p-4 border text-left flex items-center gap-3 transition-colors", isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-100 hover:bg-slate-50")}>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${cat?.color}20` }}>
                              <Icon className="h-6 w-6" style={{ color: cat?.color }} />
                            </div>
                            <div className="flex-1">
                              <p className={cn("font-semibold", isDark ? "text-slate-200" : "text-slate-900")}>{item.note || (t('Untitled') || "Untitled")}</p>
                              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{cat?.name}</p>
                            </div>
                            <div className="text-right">
                              <p className={cn("font-bold text-lg", item.type === "income" ? "text-emerald-600" : "text-red-600", isDark && (item.type === "income" ? "text-emerald-400" : "text-red-400"))}>{item.type === "income" ? "+" : ""}{formatCurrency(item.type === "expense" ? -item.amount : item.amount, language)}</p>
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="flex gap-2 mt-2">
                              <button className={cn("flex-1 h-10 rounded-xl border flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors", isDark ? "border-slate-700 text-slate-300" : "")} onClick={() => openEditModal(item)}><Edit className="h-4 w-4" /> {t('Edit') || "Edit"}</button>
                              <button className={cn("flex-1 h-10 rounded-xl border flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors")} onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4" /> {t('Delete') || "Delete"}</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PageContainer>
      <FAB onClick={() => { resetForm(); setShowAddModal(true); }} />
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50" onClick={resetForm}>
          <div className={cn("w-full max-w-md rounded-t-[32px] p-6 pb-8 transition-colors", isDark ? "bg-slate-800" : "bg-white")} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{editingId ? (t('Edit Transaction') || "Edit Transaction") : (t('Add Transaction') || "Add Transaction")}</h2>
              <button onClick={resetForm} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormType("expense")} className={cn("h-14 rounded-2xl font-semibold transition-colors", formType === "expense" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-red-50 text-red-600 border border-red-200")}>{t('Expense') || "Expense"}</button>
                <button type="button" onClick={() => setFormType("income")} className={cn("h-14 rounded-2xl font-semibold transition-colors", formType === "income" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-emerald-50 text-emerald-600 border border-emerald-200")}>{t('Income') || "Income"}</button>
              </div>
              <input type="text" placeholder="0" value={formAmount} onChange={(e) => setFormAmount(formatNumberInput(e.target.value))} className={cn("w-full h-14 px-4 rounded-2xl text-2xl font-bold outline-none ring-0", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")} required />
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className={cn("w-full h-14 px-4 rounded-2xl outline-none ring-0", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")} required>
                <option value="">{t('Select category') || "Select category"}</option>
                {filteredCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className={cn("w-full h-14 px-4 rounded-2xl outline-none ring-0", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")} required />
              <input type="text" placeholder={t('Note...') || "Note..."} value={formNote} onChange={(e) => setFormNote(e.target.value)} className={cn("w-full h-14 px-4 rounded-2xl outline-none ring-0", isDark ? "bg-slate-700 text-white placeholder:text-slate-400" : "bg-slate-50 text-slate-900 placeholder:text-slate-400")} />
              <button type="submit" className={cn("w-full h-14 mt-6 rounded-2xl text-lg font-semibold text-white transition-colors disabled:opacity-50", formType === "expense" ? "bg-red-500 hover:bg-red-600" : "bg-emerald-500 hover:bg-emerald-600")} disabled={formSubmitting}>
                {formSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : editingId ? (t('Update Transaction') || "Update Transaction") : (t('Save Transaction') || "Save Transaction")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}