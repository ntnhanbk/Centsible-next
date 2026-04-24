"use client";

import { useState, useEffect } from "react";
import { Users, Shield, Trash2, ArrowUpDown, Loader2 } from "lucide-react";
import { useAppContext } from "@/lib/providers/AppProvider";
import { formatDate } from "@/lib/utils";
import { Header, PageContainer } from "@/components/AppShell";
import { cn } from "@/lib/utils";

type UserWithStats = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  transactionCount: number;
  categoryCount: number;
  budgetCount: number;
};

export default function AdminPage() {
  const { theme, t } = useAppContext();
  const isDark = theme === "dark";
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (data.users) setUsers(data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm(t('Confirm delete user?') || "Confirm delete user?")) return;
    
    setDeletingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "delete", userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const intent = newRole === "admin" ? "promote" : "demote";
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch (err) {
      console.error("Role update error:", err);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title={t('Admin Panel') || "Admin Panel"} subtitle={t('User Management') || "User Management"} />
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
      <Header title={t('Admin Panel') || "Admin Panel"} subtitle={t('User Management') || "User Management"} />
      <PageContainer>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className={cn("text-center py-8", isDark ? "text-slate-500" : "text-slate-400")}>
              No users found
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className={cn(
                  "rounded-2xl p-4 border flex items-center justify-between",
                  isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    isDark ? "bg-slate-700" : "bg-slate-100"
                  )}>
                    <Users className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
                      {user.name}
                    </p>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                      {user.email}
                    </p>
                    <p className={cn("text-xs mt-1", isDark ? "text-slate-500" : "text-slate-400")}>
                      Joined: {formatDate(user.createdAt)} • 
                      {user.transactionCount} tx • 
                      {user.categoryCount} cat • 
                      {user.budgetCount} budget
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className={cn(
                      "h-10 px-3 rounded-xl text-sm font-medium border outline-none ring-0",
                      isDark ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"
                    )}
                  >
                    <option value="user">{t('User') || "User"}</option>
                    <option value="admin">{t('Admin') || "Admin"}</option>
                  </select>
                  <button
                    onClick={() => handleDelete(user._id)}
                    disabled={deletingId === user._id}
                    className={cn(
                      "h-10 px-4 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center",
                      deletingId === user._id ? "bg-slate-400" : "bg-red-500 hover:bg-red-600"
                    )}
                  >
                    {deletingId === user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PageContainer>
    </>
  );
}
