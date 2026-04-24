import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Budget } from "@/models/Budget";
import { Transaction } from "@/models/Transaction";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_ACCESS_SECRET || "access-secret");

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

export async function GET(request: NextRequest) {
  await dbConnect();
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const budgets = await Budget.find({ userId, month }).populate("categoryId", "name icon color").lean();

  const transactions = await Transaction.find({
    userId,
    date: { $regex: `^${month}` },
    type: "expense",
  }).lean();

  const spentByCategory: Record<string, number> = {};
  transactions.forEach((t: any) => {
    const catId = t.category?.toString();
    if (catId) {
      spentByCategory[catId] = (spentByCategory[catId] || 0) + t.amount;
    }
  });

  const result = budgets.map((b: any) => {
    const catId = b.categoryId?._id?.toString() || b.categoryId?.toString();
    const spent = spentByCategory[catId] || 0;
    return {
      ...b,
      id: b._id,
      category: b.categoryId,
      spent,
      percent: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
    };
  });

  return NextResponse.json({ budgets: result });
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const budget = await Budget.create({
    userId,
    categoryId: body.categoryId,
    amount: Number(body.amount),
    month: body.month,
  });

  return NextResponse.json({ success: true, budget: { ...budget.toObject(), id: budget._id } });
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  await Budget.findByIdAndUpdate(body.id, {
    amount: Number(body.amount),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  await dbConnect();
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    await Budget.findByIdAndDelete(id);
  }

  return NextResponse.json({ success: true });
}