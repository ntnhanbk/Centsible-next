import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { jwtVerify, SignJWT } from "jose";
import { randomUUID } from "crypto";

const ACCESS_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_ACCESS_SECRET || "access-secret");
const REFRESH_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_REFRESH_SECRET || "refresh-secret");

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();

  try {
    const existing = await User.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const user = await User.create({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    const tokenId = randomUUID();
    const accessToken = await new SignJWT({ type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject((user as any)._id.toString())
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 900)
      .sign(ACCESS_SECRET);

    const refreshToken = await new SignJWT({ type: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject((user as any)._id.toString())
      .setJti(tokenId)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 2592000)
      .sign(REFRESH_SECRET);

    const response = NextResponse.json({
      success: true,
      user: {
        id: (user as any)._id,
        name: (user as any).name,
        email: (user as any).email,
      },
      accessToken,
    });

    response.cookies.set("centsible_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900,
      path: "/",
    });

    response.cookies.set("centsible_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 2592000,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}