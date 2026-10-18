import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth.server";
import { deleteLessonFromGitHub } from "@/lib/github-cms.server";

function isSafeOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const isAuth = await authenticateAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, message: "Phiên quản trị hết hạn hoặc chưa đăng nhập." },
      { status: 401 },
    );
  }

  if (!isSafeOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Yêu cầu bị từ chối CSRF." },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      day?: number | undefined;
      sha?: string | null | undefined;
      commitMessage?: string | undefined;
    };

    const { day, sha, commitMessage } = body;
    if (!day) {
      return NextResponse.json(
        { success: false, message: "Thiếu ngày học cần xóa." },
        { status: 400 },
      );
    }

    const result = await deleteLessonFromGitHub(Number(day), { sha, commitMessage });
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: `Lỗi khi xóa bài học: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 },
    );
  }
}
