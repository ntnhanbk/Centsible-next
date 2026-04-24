import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { Category } from "@/models/Category";
import { Budget } from "@/models/Budget";
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

async function isAdmin(request: NextRequest) {
  const userId = await getUserId(request);
  if (!userId) return false;
  const user = await User.findById(userId).lean();
  return user?.role === "admin";
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();

  const users = await User.find({}).select("-password").sort({ createdAt: -1 }).lean();

  const usersWithStats = await Promise.all(
    users.map(async (user: any) => {
      const [txCount, catCount, budgetCount] = await Promise.all([
        Transaction.countDocuments({ userId: user._id }),
        Category.countDocuments({ userId: user._id }),
        Budget.countDocuments({ userId: user._id }),
      ]);
      return {
        ...user,
        id: user._id,
        transactionCount: txCount,
        categoryCount: catCount,
        budgetCount: budgetCount,
      };
    })
  );

  return NextResponse.json({ users: usersWithStats });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await dbConnect();
  const body = await request.json();
  const { intent, userId } = body;

  try {
    if (intent === "delete") {
      await User.findByIdAndDelete(userId);
      await Transaction.deleteMany({ userId });
      await Category.deleteMany({ userId });
      await Budget.deleteMany({ userId });
      return NextResponse.json({ success: true });
    }

    if (intent === "promote") {
      await User.findByIdAndUpdate(userId, { role: "admin" });
      return NextResponse.json({ success: true });
    }

    if (intent === "demote") {
      await User.findByIdAndUpdate(userId, { role: "user" });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid intent" }, { status: 400 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}