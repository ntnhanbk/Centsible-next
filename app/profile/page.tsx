"use client";

import { useState } from "react";
import { User, Mail, Wallet, Target, Save, Smartphone, LogOut, Bell, Shield, HelpCircle } from "lucide-react";
import { Header, PageContainer } from "@/components/AppShell";
import { formatCurrency, cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";
import { useAuth } from "@/lib/providers/AuthProvider";

const menuItems = [
  { icon: Smartphone, label: "Devices", value: "2 devices", color: "text-blue-600 bg-blue-50", darkColor: "bg-blue-900/30 text-blue-400" },
  { icon: Bell, label: "Notifications", color: "text-amber-600 bg-amber-50", darkColor: "bg-amber-900/30 text-amber-400" },
  { icon: Shield, label: "Security", color: "text-purple-600 bg-purple-50", darkColor: "bg-purple-900/30 text-purple-400" },
  { icon: HelpCircle, label: "Help", color: "text-cyan-600 bg-cyan-50", darkColor: "bg-cyan-900/30 text-cyan-400" },
];

export default function ProfilePage() {
  const { theme, t, language } = useAppContext();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);

  // fallback to avoid errors if user is null
  const displayUser = user || { name: "Guest User", email: "guest@example.com", income: 0, financialGoal: 0 };

  return (
    <>
      <Header title={t('Profile') || "Profile"} />
      <PageContainer>
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[24px] p-5 text-white shadow-xl">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center border-4 border-slate-600">
                <User className="h-10 w-10 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold">{displayUser.name}</p>
                <p className="text-slate-400">{displayUser.email}</p>
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className="h-10 px-4 rounded-full bg-white/20 font-medium text-sm hover:bg-white/30 transition-colors">
                {t('Edit') || "Edit"}
              </button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-2xl p-3">
                <Wallet className="h-5 w-5 text-emerald-400" />
                <p className="mt-2 text-sm text-slate-400">{t('Income/month') || "Income/month"}</p>
                <p className="text-lg font-bold">{formatCurrency(displayUser.income || 0, language)}</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-3">
                <Target className="h-5 w-5 text-amber-400" />
                <p className="mt-2 text-sm text-slate-400">{t('Goal') || "Goal"}</p>
                <p className="text-lg font-bold">{formatCurrency(displayUser.financialGoal || 0, language)}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className={cn("rounded-[24px] p-5 border space-y-4 transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
              <div>
                <label className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>{t('Name') || "Name"}</label>
                <input defaultValue={displayUser.name} className={cn("w-full mt-1 h-12 px-4 rounded-2xl outline-none ring-0 focus:ring-1 focus:ring-emerald-500", isDark ? "bg-slate-700 text-white" : "bg-slate-50")} />
              </div>
              <div>
                <label className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>{t('Email') || "Email"}</label>
                <input defaultValue={displayUser.email} className={cn("w-full mt-1 h-12 px-4 rounded-2xl outline-none ring-0 focus:ring-1 focus:ring-emerald-500", isDark ? "bg-slate-700 text-white" : "bg-slate-50")} />
              </div>
              <div>
                <label className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>{t('Monthly Income') || "Monthly Income"}</label>
                <input type="number" defaultValue={displayUser.income || 0} className={cn("w-full mt-1 h-12 px-4 rounded-2xl outline-none ring-0 focus:ring-1 focus:ring-emerald-500", isDark ? "bg-slate-700 text-white" : "bg-slate-50")} />
              </div>
              <div>
                <label className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>{t('Financial Goal') || "Financial Goal"}</label>
                <input type="number" defaultValue={displayUser.financialGoal || 0} className={cn("w-full mt-1 h-12 px-4 rounded-2xl outline-none ring-0 focus:ring-1 focus:ring-emerald-500", isDark ? "bg-slate-700 text-white" : "bg-slate-50")} />
              </div>
              <button className="w-full h-12 rounded-2xl bg-emerald-500 text-white font-medium flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Save className="h-4 w-4 mr-2" /> {t('Save Changes') || "Save Changes"}
              </button>
            </div>
          )}

          <div className={cn("rounded-[24px] border overflow-hidden transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
            {menuItems.map((item, idx) => (
              <button key={item.label} className={cn("w-full flex items-center gap-4 p-4 border-b transition-colors", isDark ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-100 hover:bg-slate-50", idx === menuItems.length - 1 && "border-b-0")}>
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", isDark ? item.darkColor : item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-900")}>{t(item.label) || item.label}</p>
                  {item.value && <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{item.value}</p>}
                </div>
                <span className={isDark ? "text-slate-500" : "text-slate-400"}>›</span>
              </button>
            ))}
          </div>

          <div className="py-6 text-center">
            <p className={isDark ? "text-sm text-slate-500" : "text-sm text-slate-400"}>Finance App v1.0.0</p>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
