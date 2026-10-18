import { NextResponse } from "next/server";
import { generateSessionToken } from "@/lib/admin-auth.server";

const COOKIE_NAME = "vvhc_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    const password = body.password?.trim() || "";
    const expectedPassword = process.env["ADMIN_PASSWORD"];

    if (!expectedPassword) {
      console.error("[ADMIN AUTH ALERT]: ADMIN_PASSWORD is not configured on the server.");
      return NextResponse.json(
        {
          success: false,
          message: "Server chưa cấu hình biến môi trường ADMIN_PASSWORD.",
        },
        { status: 500 },
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Mật khẩu quản trị không chính xác.",
        },
        { status: 401 },
      );
    }

    const token = await generateSessionToken();
    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập quản trị thành công.",
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi đăng nhập." },
      { status: 500 },
    );
  }
}
