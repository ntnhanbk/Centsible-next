import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Transaction } from "@/models/Transaction";
import { Category } from "@/models/Category";
import { Budget } from "@/models/Budget";
import { User } from "@/models/User";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_ACCESS_SECRET || "access-secret");

const CURRENCY_SYMBOLS: Record<string, string> = {
  vi: "₫", en: "$", de: "€", fr: "€", es: "€", it: "€", nl: "€", pt: "€",
  pl: "zł", cs: "Kč", hu: "Ft", ro: "lei", bg: "лв.", dk: "kr", se: "kr",
};

const CURRENCY_LOCALES: Record<string, string> = {
  vi: "vi-VN", en: "en-US", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT",
  nl: "nl-NL", pt: "pt-PT", pl: "pl-PL", cs: "cs-CZ", hu: "hu-HU", ro: "ro-RO",
};

function formatAmount(amount: number, lang: string): string {
  const locale = CURRENCY_LOCALES[lang] || "vi-VN";
  const symbol = CURRENCY_SYMBOLS[lang] || "₫";
  const decimals = lang === "vi" || lang === "hu" ? 0 : 2;
  return symbol + new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

async function getUserId(request: NextRequest) {
  const token = request.cookies.get("centsible_access_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return (payload as any).sub;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userMessage = body.message as string;
  const history = (body.history || []) as Array<{ role: string; content: string }>;
  const userLang = (body.language || "vi") as string;

  if (!userMessage) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!openAiKey) {
    return NextResponse.json({ error: "OpenAI API key missing" }, { status: 500 });
  }

  try {
    const { getFinancialSummary, getCategorySpending, searchTransactions } = await import("@/lib/tools");

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "get_financial_summary",
          description: "Get monthly overview - total income, expense, balance",
          parameters: { type: "object" as const, properties: {}, required: [] },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "get_category_spending",
          description: "Get spending breakdown by category",
          parameters: { type: "object" as const, properties: {}, required: [] },
        },
      },
      {
        type: "function" as const,
        function: {
          name: "search_transactions",
          description: "Search transactions by keyword",
          parameters: {
            type: "object" as const,
            properties: {
              keyword: { type: "string" as const, description: "Search keyword" },
              limit: { type: "number" as const, description: "Max results", default: 10 },
            },
            required: [],
          },
        },
      },
    ];

    const systemPrompt = `Bạn là Centsible, trợ lý AI quản lý tài chính cá nhân.

Quy tắc:
- Dùng tools để lấy dữ liệu thực trước khi trả lời
- Trả lời ngắn gọn, có cấu trúc
- Dùng emoji (📊💰✅⚠️💡)
- Ngôn ngữ: tiếng Việt
- Map từ khóa: coffee/cafe→cà phê, food→ăn uống, transport/taxi→đi lại, shopping→mua sắm

Format ví dụ:
📊 TÓM TẮT
Thu nhập: 15,000,000 ₫
Chi tiêu: 12,000,000 ₫
Còn lại: 3,000,000 ₫

💡 NHẬN XÉT
Bạn tiết kiệm 20% thu nhập - rất tốt!`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: userMessage },
    ];

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: openAiKey });

    let completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 600,
      messages: messages as any,
      tools,
    });

    const response = completion.choices[0]?.message;

    if (response?.tool_calls?.length) {
      const toolCall = response.tool_calls[0] as any;
      const toolName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments || "{}");

      let toolResult;
      if (toolName === "get_financial_summary") {
        toolResult = await getFinancialSummary(userId, userLang);
      } else if (toolName === "get_category_spending") {
        toolResult = await getCategorySpending(userId, userLang);
      } else if (toolName === "search_transactions") {
        toolResult = await searchTransactions(userId, args.keyword, args.limit || 10, userLang);
      }

      messages.push({ role: "assistant" as const, content: response.content || "", tool_calls: [toolCall as any] });
      messages.push({ role: "tool" as const, tool_call_id: (toolCall as any).id, content: JSON.stringify(toolResult) });

      completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 600,
        messages: messages as any,
      });
    }

    const finalResponse = completion.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời.";

    return NextResponse.json({ response: finalResponse.replace(/\*\*/g, "") });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}