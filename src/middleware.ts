import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin UI and Admin Lesson APIs
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin/lessons")) {
    const sessionCookie = request.cookies.get("vvhc_admin_session");

    // Allow requests that have a session cookie
    if (!sessionCookie?.value) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          {
            success: false,
            message: "Yêu cầu bị từ chối: Chưa đăng nhập tài khoản quản trị.",
          },
          { status: 401 },
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/lessons/:path*"],
};
