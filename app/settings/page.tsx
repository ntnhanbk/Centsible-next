"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe, Bell, Shield, Moon, LogOut, ChevronRight, Check, Settings as SettingsIcon, Key, Loader2 } from "lucide-react";
import { Header, PageContainer } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { useAppContext, LANGUAGES } from "@/lib/providers/AppProvider";

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, t } = useAppContext();
  const isDark = theme === "dark";
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserRole() {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        const data = await res.json();
        console.log("User data:", data);
        if (data.user?.role) {
          setUserRole(data.user.role);
          console.log("Role set to:", data.user.role);
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
    }
    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      sessionStorage.removeItem("centsible_access_token");
      sessionStorage.removeItem("centsible_user_id");
      router.push("/login");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t('Passwords do not match') || "Passwords do not match");
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError(t('Password must be at least 6 characters') || "Password must be at least 6 characters");
      return;
    }
    
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      
      if (data.success) {
        setPasswordSuccess(t('Password changed successfully') || "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(data.error || (t('Password change failed') || "Password change failed"));
      }
    } catch (err) {
      setPasswordError(t('Password change failed') || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <>
      <Header title={t('Settings') || "Settings"} />
      <PageContainer>
        <div className="space-y-6">
          
          {/* Language Settings */}
          <section>
            <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-3 px-2", isDark ? "text-slate-400" : "text-slate-500")}>{t('Preferences') || "Preferences"}</h2>
            <div className={cn("rounded-2xl border overflow-hidden shadow-sm transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
              <div 
                className={cn("p-4 flex items-center justify-between border-b cursor-pointer transition-colors", isDark ? "border-slate-700" : "border-slate-50", isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50")} 
                onClick={() => setShowLangMenu(!showLangMenu)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>{t('Language') || "Language"}</p>
                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{LANGUAGES.find(l => l.code === language)?.nativeName || language}</p>
                  </div>
                </div>
                <ChevronRight className={cn("h-5 w-5 text-slate-400 transition-transform", showLangMenu && "rotate-90")} />
              </div>

              {showLangMenu && (
                <div className={cn("p-2 space-y-1 max-h-80 overflow-y-auto", isDark ? "bg-slate-900/50" : "bg-slate-50")}>
                  {LANGUAGES.map((lang) => (
                    <button 
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code as any); setShowLangMenu(false); }}
                      className={cn("w-full flex items-center justify-between p-3 rounded-xl transition-colors", isDark ? "hover:bg-slate-800" : "hover:bg-white")}
                    >
                      <span className={cn("font-medium", language === lang.code ? "text-emerald-400" : isDark ? "text-slate-300" : "text-slate-600")}>
                        {lang.nativeName}
                        <span className={cn("text-xs ml-2", isDark ? "text-slate-500" : "text-slate-400")}>({lang.name})</span>
                      </span>
                      {language === lang.code && <Check className="h-4 w-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}

              <div 
                className={cn("p-4 flex items-center justify-between cursor-pointer transition-colors", isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50")}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", isDark ? "bg-purple-900/30 text-purple-400" : "bg-purple-50 text-purple-600")}>
                    <Moon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>{t('Dark Mode') || "Dark Mode"}</p>
                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{t('System default') || "System default"}</p>
                  </div>
                </div>
                <div className={cn("w-12 h-6 rounded-full relative cursor-pointer transition-colors", theme === 'dark' ? 'bg-purple-500' : 'bg-slate-200')}>
                  <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", theme === 'dark' ? 'left-7' : 'left-1')}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section>
            <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-3 px-2", isDark ? "text-slate-400" : "text-slate-500")}>{t('Security') || "Security"}</h2>
            <div className={cn("rounded-2xl border overflow-hidden shadow-sm transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
              <div 
                className={cn("p-4 flex items-center justify-between border-b cursor-pointer transition-colors", isDark ? "border-slate-700 hover:bg-slate-700/50" : "border-slate-50 hover:bg-slate-50")}
                onClick={() => setShowPasswordModal(true)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600")}>
                    <Key className="h-5 w-5" />
                  </div>
                  <p className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>{t('Change Password') || "Change Password"}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </section>
          {/* Admin Panel */}
          {userRole === "admin" && (
            <section>
              <h2 className={cn("text-sm font-semibold uppercase tracking-wider mb-3 px-2", isDark ? "text-slate-400" : "text-slate-500")}>Admin</h2>
              <div className={cn("rounded-2xl border overflow-hidden shadow-sm transition-colors", isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100")}>
                <div 
                  className={cn("p-4 flex items-center justify-between cursor-pointer transition-colors", isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50")}
                  onClick={() => router.push("/admin")}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-50 text-amber-600")}>
                      <SettingsIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>{t('Admin Panel') || "Admin Panel"}</p>
                      <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{t('User Management') || "User Management"}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </section>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn("w-full mt-6 rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold transition-colors", isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/40" : "bg-red-50 text-red-600 hover:bg-red-100")}
          >
            <LogOut className="h-5 w-5" />
            {t("Log Out") || "Log Out"}
          </button>
          
        </div>
      </PageContainer>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowPasswordModal(false)}>
          <div className={cn("w-full max-w-md mx-4 rounded-[24px] p-6", isDark ? "bg-slate-800" : "bg-white")} onClick={(e) => e.stopPropagation()}>
            <h2 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>{t('Change Password') || "Change Password"}</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className={cn("text-sm font-medium mb-1.5 block", isDark ? "text-slate-300" : "text-slate-700")}>{t('Current Password') || "Current Password"}</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={cn("w-full h-12 px-4 rounded-2xl outline-none", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")}
                  required
                />
              </div>
              <div>
                <label className={cn("text-sm font-medium mb-1.5 block", isDark ? "text-slate-300" : "text-slate-700")}>{t('New Password') || "New Password"}</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn("w-full h-12 px-4 rounded-2xl outline-none", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")}
                  required
                />
              </div>
              <div>
                <label className={cn("text-sm font-medium mb-1.5 block", isDark ? "text-slate-300" : "text-slate-700")}>{t('Confirm New Password') || "Confirm New Password"}</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn("w-full h-12 px-4 rounded-2xl outline-none", isDark ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-900")}
                  required
                />
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-emerald-500 text-sm">{passwordSuccess}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={cn("flex-1 h-12 rounded-2xl font-medium", isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600")}
                >
                  {t('Cancel') || "Cancel"}
                </button>
                <button 
                  type="submit"
                  disabled={changingPassword}
                  className={cn("flex-1 h-12 rounded-2xl font-medium bg-emerald-500 text-white", changingPassword && "opacity-50")}
                >
                  {changingPassword ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (t('Change Password') || "Change Password")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}