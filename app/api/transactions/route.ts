import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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
  const month = searchParams.get("month");

  const query: any = { userId };
  if (month) {
    query.date = { $regex: `^${month}` };
  }

  const transactions = await Transaction.find(query)
    .populate("category", "name icon color")
    .sort({ date: -1 })
    .lean();

  return NextResponse.json({
    transactions: transactions.map((t: any) => ({
      ...t,
      id: t._id,
      category: t.category,
    })),
  });
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const transaction = await Transaction.create({
    userId,
    amount: Number(body.amount),
    type: body.type,
    category: body.category,
    date: body.date,
    note: body.note || "",
  });

  return NextResponse.json({ success: true, transaction: { ...transaction.toObject(), id: transaction._id } });
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  await Transaction.findByIdAndUpdate(body.id, {
    amount: Number(body.amount),
    type: body.type,
    category: body.category,
    date: body.date,
    note: body.note,
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
    await Transaction.findByIdAndDelete(id);
  }

  return NextResponse.json({ success: true });
}