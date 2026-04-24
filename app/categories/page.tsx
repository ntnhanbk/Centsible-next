"use client";

import { useState, useEffect } from "react";
import { Coffee, ShoppingBag, Home, Zap, Car, Gamepad2, HeartPulse, GraduationCap, Briefcase, Gift, Edit, Plus, Loader2 } from "lucide-react";
import { Header, PageContainer, FAB } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase, utensils: Coffee, "shopping-bag": ShoppingBag,
  home: Home, zap: Zap, car: Car, "gamepad-2": Gamepad2,
  "heart-pulse": HeartPulse, "graduation-cap": GraduationCap, gift: Gift,
};

export default function CategoriesPage() {
  const { theme, t } = useAppContext();
  const isDark = theme === "dark";
  
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState<Array<{
    _id: string;
    name: string;
    icon: string;
    color: string;
    type: "income" | "fixed" | "variable";
  }>>([]);
  
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<"income" | "fixed" | "variable">("variable");
  const [selectedIcon, setSelectedIcon] = useState("coffee");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof categories[0] | null>(null);

  const icons = [
    "coffee", "shopping-bag", "home", "zap", "car", "gamepad-2", "heart-pulse", "graduation-cap", "briefcase", "gift"
  ];
  const colors = ["#22c55e", "#3b82f6", "#ef4444", "#f59e0b", "#a855f7", "#ec4899", "#6366f1", "#f43f5e"];

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const income = categories.filter((c) => c.type === "income");
  const fixed = categories.filter((c) => c.type === "fixed");
  const variable = categories.filter((c) => c.type === "variable");

  const iconOptions = icons.map((iconName) => {
    const IconComponent = iconMap[iconName] || Coffee;
    return { name: iconName, Icon: IconComponent };
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName || !selectedIcon || !selectedColor) return;
    
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory?._id,
          name: categoryName,
          icon: selectedIcon,
          color: selectedColor,
          type: categoryType,
        }),
      });
      const data = await res.json();
      if (data.category) {
        if (editingCategory) {
          setCategories(categories.map((c) => c._id === editingCategory._id ? data.category : c));
        } else {
          setCategories([...categories, data.category]);
        }
        resetForm();
      }
    } catch (err) {
      console.error("Failed to save category:", err);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setCategories(categories.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  }

  function openEditModal(cat: typeof categories[0]) {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryType(cat.type);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setShowAddModal(true);
  }

  function resetForm() {
    setShowAddModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryType("variable");
    setSelectedIcon("coffee");
    setSelectedColor("#3b82f6");
  }

  if (isLoading) {
    return (
      <>
        <Header title={t('Categories') || "Categories"} subtitle={t('Manage expenses') || "Manage expenses"} />
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
      <Header title={t('Categories') || "Categories"} subtitle={t('Manage expenses') || "Manage expenses"} />
      <PageContainer>
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-2">
            {categories.slice(0, 8).map((cat) => {
              const Icon = iconMap[cat.icon] || Coffee;
              return (
                <button key={cat._id} className={cn("flex flex-col items-center gap-2 p-3 rounded-2xl border transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                  <div className="h-11 w-11 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: cat.color }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className={cn("text-xs font-medium w-full text-center truncate", isDark ? "text-slate-300" : "text-slate-700")}>{cat.name}</span>
                </button>
              );
            })}
          </div>
          <div className="space-y-3">
            <p className={cn("font-semibold", isDark ? "text-emerald-400" : "text-emerald-600")}>{t('Income Categories') || "Income Categories"}</p>
            {income.length === 0 ? (
              <p className={cn("text-sm", isDark ? "text-slate-500" : "text-slate-400")}>{t('No income categories') || "No income categories"}</p>
            ) : (
              income.map((cat) => {
                const Icon = iconMap[cat.icon] || Briefcase;
                return (
                  <div key={cat._id} className={cn("rounded-2xl p-4 border flex items-center gap-3 transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1"><p className={cn("font-semibold", isDark ? "text-slate-200" : "text-slate-900")}>{cat.name}</p><p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{cat.type === "fixed" ? (t('Fixed') || "Fixed") : cat.type === "variable" ? (t('Variable') || "Variable") : (t('Income') || "Income")}</p></div>
                    <button className={cn("p-2 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700", isDark ? "text-slate-400" : "")} onClick={() => openEditModal(cat)}><Edit className="h-4 w-4" /></button>
                  </div>
                );
              })
            )}
          </div>
          <div className="space-y-3">
            <p className={cn("font-semibold", isDark ? "text-amber-400" : "text-amber-600")}>{t('Fixed Expenses') || "Fixed Expenses"}</p>
            {fixed.length === 0 ? (
              <p className={cn("text-sm", isDark ? "text-slate-500" : "text-slate-400")}>{t('No fixed expense categories') || "No fixed expense categories"}</p>
            ) : (
              fixed.map((cat) => {
                const Icon = iconMap[cat.icon] || Home;
                return (
                  <div key={cat._id} className={cn("rounded-2xl p-4 border flex items-center gap-3 transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1"><p className={cn("font-semibold", isDark ? "text-slate-200" : "text-slate-900")}>{cat.name}</p><p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Fixed</p></div>
                    <button className={cn("p-2 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700", isDark ? "text-slate-400" : "")} onClick={() => openEditModal(cat)}><Edit className="h-4 w-4" /></button>
                  </div>
                );
              })
            )}
          </div>
          <div className="space-y-3">
            <p className={cn("font-semibold", isDark ? "text-blue-400" : "text-blue-600")}>{t('Variable Expenses') || "Variable Expenses"}</p>
            {variable.length === 0 ? (
              <p className={cn("text-sm", isDark ? "text-slate-500" : "text-slate-400")}>{t('No variable expense categories') || "No variable expense categories"}</p>
            ) : (
              variable.map((cat) => { 
                const Icon = iconMap[cat.icon] || Coffee;
                return (
                  <div key={cat._id} className={cn("rounded-2xl p-4 border flex items-center gap-3 transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1"><p className={cn("font-semibold", isDark ? "text-slate-200" : "text-slate-900")}>{cat.name}</p><p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Variable</p></div>
                    <button className={cn("p-2 rounded-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700", isDark ? "text-slate-400" : "")} onClick={() => openEditModal(cat)}><Edit className="h-4 w-4" /></button>
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
          <div className={cn("w-full max-w-md rounded-t-[32px] p-6 pb-8 transition-colors", isDark ? "bg-slate-800" : "bg-white")} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{editingCategory ? (t('Edit Category') || "Edit Category") : (t('Add Category') || "Add Category")}</h2>
              <button 
                onClick={resetForm} 
                className={cn("h-8 w-8 flex items-center justify-center rounded-full transition-colors", isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500")}
              >✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[60vh] px-1">
              <div>
                <label className={cn("text-xs font-semibold mb-1.5 block", isDark ? "text-slate-400" : "text-slate-500")}>NAME</label>
                <input 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name..." 
                  className={cn("w-full h-14 px-4 rounded-2xl transition-colors outline-none", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")} 
                  required
                />
              </div>

              <div>
                <label className={cn("text-xs font-semibold mb-1.5 block", isDark ? "text-slate-400" : "text-slate-500")}>{t('Type') || "Type"}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["income", "fixed", "variable"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCategoryType(type)}
                      className={cn(
                        "h-11 rounded-xl text-xs font-bold transition-all",
                        categoryType === type 
                          ? "bg-slate-900 text-white shadow-lg scale-[1.02]" 
                          : isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {type === "income" ? (t('Income') || "Income") : type === "fixed" ? (t('Fixed') || "Fixed") : (t('Variable') || "Variable")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={cn("text-xs font-semibold mb-1.5 block", isDark ? "text-slate-400" : "text-slate-500")}>ICON & COLOR</label>
                <div className="flex gap-4">
                  <div className="flex-1 grid grid-cols-5 gap-2">
                    {iconOptions.map(({ name, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSelectedIcon(name)}
                        className={cn(
                          "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                          selectedIcon === name 
                            ? "bg-slate-900 text-white shadow-md scale-110" 
                            : isDark ? "bg-slate-700 text-slate-400 hover:bg-slate-600" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                  <div className="w-px bg-slate-200 dark:bg-slate-700 my-1" />
                  <div className="grid grid-cols-2 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "h-8 w-8 rounded-full transition-transform",
                          selectedColor === color ? "scale-125 border-2 border-white shadow-lg" : "hover:scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={cn("p-4 rounded-2xl flex items-center gap-4 border-2 transition-all", isDark ? "bg-slate-900/50 border-slate-700" : "bg-slate-50 border-slate-100")}>
                <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: selectedColor }}>
                  {(() => {
                    const PreviewIcon = iconMap[selectedIcon] || Coffee;
                    return <PreviewIcon className="h-6 w-6 text-white" />;
                  })()}
                </div>
                <div>
                  <p className={cn("text-xs font-bold", isDark ? "text-slate-500" : "text-slate-400")}>PREVIEW</p>
                  <p className={cn("font-bold text-lg", isDark ? "text-white" : "text-slate-900")}>{categoryName || t('New Category') || "New Category"}</p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-14 mt-6 rounded-2xl text-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50" 
                disabled={formSubmitting}
              >
                {formSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : editingCategory ? (t('Update Category') || "Update Category") : (t('Save Category') || "Save Category")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}