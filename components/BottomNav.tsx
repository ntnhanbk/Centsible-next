"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  PieChart,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/categories", label: "Categories", icon: PieChart },
  { href: "/chat", label: "Centsible", icon: Bot },
];

export function BottomNav({ isDark }: { isDark: boolean }) {
  const pathname = usePathname();
  const { t } = useAppContext();

  return (
    <nav className={cn("border-t px-1 py-2 shrink-0 z-50 transition-colors duration-300", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300",
                isActive ? "text-emerald-400" : isDark ? "text-slate-500" : "text-slate-400"
              )}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-full" />
              )}
              <Icon className={cn("h-6 w-6", isActive && "scale-110")} />
              <span className={cn("text-[10px] font-medium transition-opacity", isActive ? "opacity-100" : "opacity-0")}>
                {t(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}