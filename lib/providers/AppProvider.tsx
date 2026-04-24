"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "vi" | "bg" | "cs" | "da" | "de" | "el" | "es" | "et" | "fi" | "fr" | "ga" | "hr" | "hu" | "it" | "lt" | "lv" | "mt" | "nl" | "pl" | "pt" | "ro" | "sk" | "sl" | "sv";

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
];

type Theme = "light" | "dark";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    Home: "Home",
    Transactions: "Transactions",
    Budget: "Budget",
    Categories: "Categories",
    Settings: "Settings",
    Profile: "Profile",
    Login: "Login",
    Signup: "Signup",
    Email: "Email",
    Password: "Password",
    "Available Balance": "Available Balance",
    Income: "Income",
    Expense: "Expense",
    "Add Transaction": "Add Transaction",
    "No transactions yet": "No transactions yet",
  },
  vi: {
    Home: "Trang chủ",
    Transactions: "Giao dịch",
    Budget: "Ngân sách",
    Categories: "Danh mục",
    Settings: "Cài đặt",
    Profile: "Hồ sơ",
    Login: "Đăng nhập",
    Signup: "Đăng ký",
    Email: "Email",
    Password: "Mật khẩu",
    "Available Balance": "Số dư khả dụng",
    Income: "Thu nhập",
    Expense: "Chi tiêu",
    "Add Transaction": "Thêm giao dịch",
    "No transactions yet": "Chưa có giao dịch",
    "Search...": "Tìm kiếm...",
    "All": "Tất cả",
    "Edit": "Sửa",
    "Delete": "Xóa",
    "Add Category": "Thêm danh mục",
    "Edit Category": "Sửa danh mục",
    "Save Category": "Lưu danh mục",
    "Update Category": "Cập nhật danh mục",
    "Add Budget": "Thêm ngân sách",
    "Edit Budget": "Sửa ngân sách",
    "Save Budget": "Lưu ngân sách",
    "Update Budget": "Cập nhật ngân sách",
    "Save Transaction": "Lưu giao dịch",
    "Update Transaction": "Cập nhật giao dịch",
    "Edit Transaction": "Sửa giao dịch",
    "Select category": "Chọn danh mục",
    "Note...": "Ghi chú...",
    "No income categories": "Chưa có danh mục thu nhập",
    "No fixed expense categories": "Chưa có danh mục chi cố định",
    "No variable expense categories": "Chưa có danh mục chi thay đổi",
    "Income Categories": "Danh mục thu nhập",
    "Fixed Expenses": "Chi cố định",
    "Variable Expenses": "Chi thay đổi",
    "Fixed": "Cố định",
    "Variable": "Thay đổi",
    "Type": "Loại",
    "New Category": "Danh mục mới",
    "Untitled": "Không có tiêu đề",
    "No budgets set yet": "Chưa có ngân sách",
    "Spent": "Đã chi",
    "Left": "Còn lại",
    "Loading...": "Đang tải...",
    "Manage your finances": "Quản lý tài chính",
    "Manage expenses": "Quản lý chi tiêu",
    "Preferences": "Tùy chọn",
    "Language": "Ngôn ngữ",
    "Dark Mode": "Chế độ tối",
    "System default": "Mặc định hệ thống",
    "Security": "Bảo mật",
    "Change Password": "Đổi mật khẩu",
    "Admin Panel": "Bảng quản trị",
    "User Management": "Quản lý người dùng",
    "Log Out": "Đăng xuất",
    "Current Password": "Mật khẩu hiện tại",
    "New Password": "Mật khẩu mới",
    "Confirm New Password": "Xác nhận mật khẩu mới",
    "Passwords do not match": "Mật khẩu không khớp",
    "Password must be at least 6 characters": "Mật khẩu phải có ít nhất 6 ký tự",
    "Password changed successfully": "Đổi mật khẩu thành công",
    "Password change failed": "Đổi mật khẩu thất bại",
    "Cancel": "Hủy",
    "User": "Người dùng",
    "Admin": "Quản trị",
    "Confirm delete user?": "Xác nhận xóa người dùng?",
    "Name": "Tên",
    "Monthly Income": "Thu nhập hàng tháng",
    "Financial Goal": "Mục tiêu tài chính",
    "Save Changes": "Lưu thay đổi",
    "Income/month": "Thu nhập/tháng",
    "Goal": "Mục tiêu",
    "Expenses by Category": "Chi tiêu theo danh mục",
    "Month Trend": "Xu hướng tháng",
    "Top Expenses": "Chi tiêu nhiều nhất",
    "No expenses yet": "Chưa có chi tiêu",
    "Sign in to manage your finances": "Đăng nhập để quản lý tài chính",
    "Welcome Back": "Chào mừng trở lại",
    "Don't have an account?": "Chưa có tài khoản?",
    "Sign up": "Đăng ký",
    "Sign In": "Đăng nhập",
  },
  de: {
    Home: "Startseite",
    Transactions: "Transaktionen",
    Budget: "Budget",
    Categories: "Kategorien",
    Settings: "Einstellungen",
    Profile: "Profil",
    Login: "Anmelden",
    Signup: "Registrieren",
    Email: "E-Mail",
    Password: "Passwort",
    "Available Balance": "Verfügbares Guthaben",
    Income: "Einkommen",
    Expense: "Ausgaben",
    "Add Transaction": "Transaktion hinzufügen",
    "No transactions yet": "Noch keine Transaktionen",
  },
  fr: {
    Home: "Accueil",
    Transactions: "Transactions",
    Budget: "Budget",
    Categories: "Catégories",
    Settings: "Paramètres",
    Profile: "Profil",
    Login: "Se connecter",
    Signup: "S'inscrire",
    Email: "E-mail",
    Password: "Mot de passe",
    "Available Balance": "Solde disponible",
    Income: "Revenus",
    Expense: "Dépenses",
    "Add Transaction": "Ajouter transaction",
    "No transactions yet": "Aucune transaction",
  },
  es: {
    Home: "Inicio",
    Transactions: "Transacciones",
    Budget: "Presupuesto",
    Categories: "Categorías",
    Settings: "Ajustes",
    Profile: "Perfil",
    Login: "Iniciar Sesión",
    Signup: "Registrarse",
    Email: "Email",
    Password: "Contraseña",
    "Available Balance": "Saldo disponible",
    Income: "Ingresos",
    Expense: "Gastos",
    "Add Transaction": "Añadir transacción",
    "No transactions yet": "Sin transacciones",
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const savedLang = localStorage.getItem("finManager_lang") as Language;
    if (savedLang && (translations as any)[savedLang]) setLanguageState(savedLang);

    const savedTheme = localStorage.getItem("finManager_theme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
      if (savedTheme === "dark") document.documentElement.classList.add("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("finManager_lang", lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("finManager_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const t = (key: string) => {
    const langTranslations = (translations as any)[language] || (translations as any).vi;
    if (langTranslations && langTranslations[key]) {
      return langTranslations[key];
    }
    return (translations as any).vi?.[key] || (translations as any).en?.[key] || key;
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}