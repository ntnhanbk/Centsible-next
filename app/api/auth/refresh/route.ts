import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { randomUUID } from "crypto";

const ACCESS_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_ACCESS_SECRET || "access-secret");
const REFRESH_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_REFRESH_SECRET || "refresh-secret");

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("centsible_refresh_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    const userId = (payload as any).sub;

    const newAccessToken = await new SignJWT({ type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 900)
      .sign(ACCESS_SECRET);

    const response = NextResponse.json({
      success: true,
      userId,
      accessToken: newAccessToken,
    });

    response.cookies.set("centsible_access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 900,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}