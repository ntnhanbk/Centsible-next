"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { useAppContext } from "@/lib/providers/AppProvider";
import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const { theme } = useAppContext();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className={cn("min-h-screen flex items-center justify-center transition-colors duration-500", isDark ? "bg-slate-950" : "bg-slate-200")}>
      <div 
        className={cn("w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative border-x-[2px] transition-colors duration-300", isDark ? "bg-slate-900 border-slate-700" : "bg-slate-50 border-slate-300")}
        style={{ height: "100vh" }}
      >
        {showSplash ? (
          <SplashScreen />
        ) : (
          <>
            {children}
            {!isAuthPage && <BottomNav isDark={isDark} />}
          </>
        )}
      </div>
    </div>
  );
}

export function FAB({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}

export function Header({ title, subtitle, showBack }: { title: string; subtitle?: string; showBack?: boolean }) {
  const { theme } = useAppContext();
  const isDark = theme === "dark";
  const pathname = usePathname();
  const showBackButton = showBack !== false && pathname !== "/";
  
  return (
    <header className={cn("px-4 sm:px-5 py-4 shrink-0 flex items-center justify-between sticky top-0 transition-colors duration-300 z-20", isDark ? "bg-slate-900" : "bg-slate-50")}>
      <div className="flex items-center gap-2 sm:gap-3">
        {showBackButton && (
          <Link href="/" className={cn("h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center rounded-full transition-colors", isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300")}>
            <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className={cn("text-xl sm:text-2xl font-bold tracking-tight transition-colors truncate", isDark ? "text-white" : "text-slate-900")}>{title}</h1>
          {subtitle && <p className={cn("text-xs sm:text-sm mt-0.5 transition-colors truncate", isDark ? "text-slate-400" : "text-slate-500")}>{subtitle}</p>}
        </div>
      </div>
      {!showBackButton && (
        <Link href="/settings" className={cn("h-9 sm:h-10 w-9 sm:w-10 flex items-center justify-center rounded-full transition-colors shrink-0", isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-600 hover:bg-slate-300")}>
          <User className="h-4 sm:h-5 w-4 sm:w-5" />
        </Link>
      )}
    </header>
  );
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  const { theme } = useAppContext();
  const isDark = theme === "dark";
  
  return (
    <div className={cn("flex-1 overflow-y-auto px-5 pb-24 transition-colors duration-300", isDark ? "bg-slate-900" : "bg-slate-50", className)}>
      {children}
    </div>
  );
}
