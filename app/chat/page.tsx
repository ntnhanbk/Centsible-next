"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/providers/AppProvider";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const CHAT_STORAGE_KEY = "centsible_chat_history_v1";
const LEGACY_CHAT_STORAGE_KEY = "finai_chat_history_v1";
const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "ai",
    content:
      "Hi there! I'm your Centsible Assistant. How can I help you manage your finances today?",
  },
];

function readStoredMessages(): Message[] {
  if (typeof window === "undefined") return INITIAL_MESSAGES;

  try {
    const raw =
      window.localStorage.getItem(CHAT_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_CHAT_STORAGE_KEY);
    if (!raw) return INITIAL_MESSAGES;
    const parsed = JSON.parse(raw) as Message[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(CHAT_STORAGE_KEY);
  }

  return INITIAL_MESSAGES;
}

export default function ChatPage() {
  const { theme, language } = useAppContext();
  const isDark = theme === "dark";
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(() => readStoredMessages());
  const [input, setInput] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const latestMessagesRef = useRef(messages);

  useEffect(() => {
    latestMessagesRef.current = messages;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const persistMessages = () => {
      window.localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(latestMessagesRef.current),
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        persistMessages();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== CHAT_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch {
        // Ignore invalid storage payloads from other tabs.
      }
    };

    window.addEventListener("pagehide", persistMessages);
    window.addEventListener("beforeunload", persistMessages);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      persistMessages();
      window.removeEventListener("pagehide", persistMessages);
      window.removeEventListener("beforeunload", persistMessages);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isFetching) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsFetching(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history, language }),
      });
      
      if (res.status === 401) {
        router.push('/login?expired=1');
        return;
      }
      
      const data = await res.json();
      if (data.response) {
        const aiMessage: Message = { id: (Date.now() + 1).toString(), role: "ai", content: data.response };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className={cn("h-full w-full flex flex-col relative transition-colors", isDark ? "bg-slate-900" : "bg-slate-50")}>
      <header className={cn("px-5 py-4 flex items-center shrink-0 z-10 sticky top-0 transition-colors", isDark ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-100")}>
        <Link href="/" className={cn("h-10 w-10 flex items-center justify-center rounded-full mr-3 transition-colors", isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Centsible</h1>
            <Sparkles className={cn("h-4 w-4 fill-emerald-500/20", isDark ? "text-emerald-400" : "text-emerald-500")} />
          </div>
          <p className={cn("text-xs font-medium", isDark ? "text-emerald-400" : "text-emerald-600")}>Online</p>
        </div>
        <div className={cn("h-10 w-10 flex items-center justify-center rounded-full", isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
          <Bot className="h-6 w-6" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.role === "ai";
          return (
            <div key={msg.id} className={cn("flex w-full", isAi ? "justify-start" : "justify-end")}>
              <div className={cn("flex max-w-[85%] items-end gap-2", isAi ? "flex-row" : "flex-row-reverse")}>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  isAi ? (isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-600") : (isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600")
                )}>
                  {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className={cn(
                 "px-4 py-3 rounded-[20px] shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap",
                  isAi 
                    ? (isDark ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-white text-slate-700 border border-slate-100")
                    : "bg-emerald-600 text-white rounded-br-sm shadow-emerald-500/20"
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        {isFetching && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[85%] items-end gap-2 flex-row">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-600")}>
                <Bot className="h-5 w-5" />
              </div>
              <div className={cn("px-4 py-3 rounded-[20px] shadow-sm", isDark ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-white text-slate-700 border border-slate-100")}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className={cn("p-4 shrink-0 sticky bottom-0 z-10 w-full sm:mb-0 transition-colors", isDark ? "bg-slate-800 border-t border-slate-700" : "bg-white border-t border-slate-100")}>
        <div className="flex items-center gap-2 relative">
          <input 
            type="text" 
            placeholder="Ask about your budget..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className={cn("flex-1 h-12 pl-5 pr-12 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all", isDark ? "bg-slate-700 border border-slate-600 text-white" : "bg-slate-50 border border-slate-200 text-slate-900")}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isFetching}
            className={cn(
              "absolute right-1.5 h-9 w-9 flex items-center justify-center rounded-full transition-all",
              input.trim() 
                ? "bg-emerald-600 text-white shadow-md hover:scale-105 active:scale-95" 
                : (isDark ? "bg-slate-600 text-slate-500" : "bg-slate-200 text-slate-400")
            )}
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}