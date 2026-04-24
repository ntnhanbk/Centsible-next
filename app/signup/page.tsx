"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiggyBank, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";

export default function SignupPage() {
  const { theme, t } = useAppContext();
  const isDark = theme === "dark";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen w-full flex flex-col p-6 transition-colors relative overflow-hidden overflow-y-auto", isDark ? "bg-slate-900" : "bg-slate-50")}>
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={cn("absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse", isDark ? "bg-emerald-500" : "bg-emerald-400")} 
             style={{ animationDuration: "4s" }}></div>
        <div className={cn("absolute -bottom-1/3 -left-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 animate-pulse", isDark ? "bg-blue-500" : "bg-blue-400")} 
             style={{ animationDuration: "5s", animationDelay: "1s" }}></div>
      </div>

      <Link href="/login" className={cn("flex items-center gap-2 text-sm font-medium mb-8 relative z-10", isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800")}>
        <ArrowLeft className="h-4 w-4" /> Back to login
      </Link>

      <div className={cn("mb-8 relative z-10", isDark ? "text-white" : "text-slate-800")}>
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", isDark ? "bg-emerald-900/30" : "bg-emerald-100")}>
          <PiggyBank className={cn("h-6 w-6", isDark ? "text-emerald-400" : "text-emerald-600")} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>Start your financial journey with us</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-5 max-w-md relative z-10">
        <div>
          <label className={cn("text-sm font-medium block mb-2", isDark ? "text-slate-300" : "text-slate-700")}>Full Name</label>
          <div className="relative">
            <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", isDark ? "text-slate-500" : "text-slate-400")} />
            <input 
              type="text" 
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn("w-full h-12 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all backdrop-blur-sm", isDark ? "bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500" : "bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-400")}
              required
            />
          </div>
        </div>

        <div>
          <label className={cn("text-sm font-medium block mb-2", isDark ? "text-slate-300" : "text-slate-700")}>Email</label>
          <div className="relative">
            <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", isDark ? "text-slate-500" : "text-slate-400")} />
            <input 
              type="email" 
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn("w-full h-12 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all backdrop-blur-sm", isDark ? "bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500" : "bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-400")}
              required
            />
          </div>
        </div>
        
        <div>
          <label className={cn("text-sm font-medium block mb-2", isDark ? "text-slate-300" : "text-slate-700")}>Password</label>
          <div className="relative">
            <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", isDark ? "text-slate-500" : "text-slate-400")} />
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn("w-full h-12 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all backdrop-blur-sm", isDark ? "bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500" : "bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-400")}
              required
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className={cn("text-sm font-medium block mb-2", isDark ? "text-slate-300" : "text-slate-700")}>Confirm Password</label>
          <div className="relative">
            <Lock className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", isDark ? "text-slate-500" : "text-slate-400")} />
            <input 
              type="password" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn("w-full h-12 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all backdrop-blur-sm", isDark ? "bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500" : "bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-400")}
              required
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-xl font-semibold mt-6 shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {isLoading ? "Creating account..." : <>Create Account <ArrowRight className="h-5 w-5" /></>}
        </button>
      </form>

      <p className={cn("mt-8 text-center text-sm relative z-10", isDark ? "text-slate-400" : "text-slate-500")}>
        Already have an account? <Link href="/login" className="text-emerald-500 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}