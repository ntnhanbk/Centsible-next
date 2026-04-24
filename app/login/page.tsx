"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiggyBank, Mail, Lock, ArrowRight, Shield, TrendingUp, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";

export default function LoginPage() {
  const { theme, t } = useAppContext();
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Protected",
      description: "Bank-level encryption keeps your data safe"
    },
    {
      icon: TrendingUp,
      title: "Smart Insights",
      description: "AI-powered financial recommendations"
    },
    {
      icon: Smartphone,
      title: "Access Anywhere",
      description: "Manage finances on any device"
    },
    {
      icon: PiggyBank,
      title: "Easy Budgeting",
      description: "Track spending and reach your goals"
    }
  ];

  return (
    <div className={cn("min-h-full w-full flex flex-col relative transition-colors overflow-y-auto overflow-x-hidden", isDark ? "bg-slate-900" : "bg-slate-50")}>
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse", isDark ? "bg-emerald-500" : "bg-emerald-400")} 
             style={{ animationDuration: "4s" }}></div>
        <div className={cn("absolute -bottom-1/3 -left-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse", isDark ? "bg-blue-500" : "bg-blue-400")} 
             style={{ animationDuration: "5s", animationDelay: "1s" }}></div>
        <div className={cn("absolute top-1/3 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-10 animate-pulse", isDark ? "bg-purple-500" : "bg-purple-400")} 
             style={{ animationDuration: "6s", animationDelay: "2s" }}></div>
      </div>

      {/* Floating Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute top-20 left-10 w-16 h-16 rounded-2xl rotate-12 opacity-10 animate-float", isDark ? "bg-emerald-400" : "bg-emerald-300")}></div>
        <div className={cn("absolute top-40 right-16 w-12 h-12 rounded-full opacity-10 animate-float", isDark ? "bg-blue-400" : "bg-blue-300")} 
             style={{ animationDelay: "1s", animationDuration: "7s" }}></div>
        <div className={cn("absolute bottom-32 left-20 w-20 h-20 rounded-3xl -rotate-6 opacity-10 animate-float", isDark ? "bg-purple-400" : "bg-purple-300")} 
             style={{ animationDelay: "2s", animationDuration: "8s" }}></div>
        <div className={cn("absolute top-1/2 right-10 w-8 h-8 rounded-lg rotate-45 opacity-10 animate-float", isDark ? "bg-emerald-400" : "bg-emerald-300")} 
             style={{ animationDelay: "0.5s", animationDuration: "6s" }}></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 p-6 py-8 max-w-md mx-auto w-full">
        <div className={cn("mb-6", isDark ? "text-white" : "text-slate-800")}>
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg backdrop-blur-sm", isDark ? "bg-emerald-900/40" : "bg-emerald-100")}>
            <PiggyBank className={cn("h-6 w-6", isDark ? "text-emerald-400" : "text-emerald-600")} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">{t('Welcome Back') || "Welcome Back"}</h1>
          <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{t('Sign in to manage your finances') || "Sign in to manage your finances"}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={cn("text-sm font-medium block mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>{t('Email') || "Email"}</label>
            <div className="relative">
              <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", isDark ? "text-slate-500" : "text-slate-400")} />
              <input 
                type="email" 
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn("w-full h-12 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all backdrop-blur-sm", isDark ? "bg-slate-800/50 border border-slate-700 text-white" : "bg-white/70 border border-slate-200 text-slate-900")}
                required
              />
            </div>
          </div>
          
          <div>
            <label className={cn("text-sm font-medium block mb-1.5 flex justify-between", isDark ? "text-slate-300" : "text-slate-700")}>
              <span>{t('Password') || "Password"}</span>
            </label>
            <div className="relative">
              <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", isDark ? "text-slate-500" : "text-slate-400")} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn("w-full h-12 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all backdrop-blur-sm", isDark ? "bg-slate-800/50 border border-slate-700 text-white" : "bg-white/70 border border-slate-200 text-slate-900")}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-semibold mt-4 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? "Signing in..." : <>{t('Sign In') || "Sign In"} <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>

        <p className={cn("mt-5 text-center text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
          {t("Don't have an account?") || "Don't have an account?"} <Link href="/signup" className="text-emerald-500 font-semibold hover:underline">{t('Sign up') || "Sign up"}</Link>
        </p>

        {/* Benefits Section */}
        <div className="mt-8 pt-6 border-t border-slate-700/30">
          <h3 className={cn("text-sm font-semibold mb-3 text-center", isDark ? "text-slate-300" : "text-slate-700")}>
            Why choose our platform?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className={cn("p-3 rounded-xl backdrop-blur-sm transition-all hover:scale-105", isDark ? "bg-slate-800/30" : "bg-white/50")}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", isDark ? "bg-emerald-900/40" : "bg-emerald-100")}>
                    <Icon className={cn("h-4 w-4", isDark ? "text-emerald-400" : "text-emerald-600")} />
                  </div>
                  <h4 className={cn("font-semibold text-xs mb-0.5", isDark ? "text-slate-200" : "text-slate-800")}>
                    {benefit.title}
                  </h4>
                  <p className={cn("text-xs leading-tight", isDark ? "text-slate-400" : "text-slate-500")}>
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={cn("mt-5 mb-4 flex items-center justify-center gap-4 text-xs flex-wrap", isDark ? "text-slate-500" : "text-slate-400")}>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>256-bit SSL</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-current"></div>
          <div className="flex items-center gap-1">
            <span>10K+ Users</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-current"></div>
          <div className="flex items-center gap-1">
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
}