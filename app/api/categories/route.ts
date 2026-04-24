import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Category } from "@/models/Category";
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
  const type = searchParams.get("type");

  const query: any = { userId };
  if (type) query.type = type;

  const categories = await Category.find(query).sort({ name: 1 }).lean();

  return NextResponse.json({
    categories: categories.map((c: any) => ({
      ...c,
      id: c._id,
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

  const category = await Category.create({
    userId,
    name: body.name,
    icon: body.icon || "briefcase",
    color: body.color || "#888888",
    type: body.type,
    isFixed: body.isFixed || false,
  });

  return NextResponse.json({ success: true, category: { ...category.toObject(), id: category._id } });
}

export async function PUT(request: NextRequest) {
  await dbConnect();
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  await Category.findByIdAndUpdate(body.id, {
    name: body.name,
    icon: body.icon,
    color: body.color,
    type: body.type,
    isFixed: body.isFixed,
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
    await Category.findByIdAndDelete(id);
  }

  return NextResponse.json({ success: true });
}