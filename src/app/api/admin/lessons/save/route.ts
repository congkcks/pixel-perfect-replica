import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth.server";
import { saveLessonToGitHub } from "@/lib/github-cms.server";
import type { LessonDraft } from "@/lib/lesson-file";

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
  // 1. Verify admin session
  const isAuth = await authenticateAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json(
      {
        success: false,
        message: "Yêu cầu không hợp lệ: Phiên quản trị hết hạn hoặc chưa đăng nhập.",
      },
      { status: 401 },
    );
  }

  // 2. CSRF verification
  if (!isSafeOrigin(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Yêu cầu bị từ chối do vi phạm quy định CSRF.",
      },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      draft?: LessonDraft | undefined;
      expectedSha?: string | null | undefined;
      commitMessage?: string | undefined;
    };

    const { draft, expectedSha, commitMessage } = body;

    if (!draft || !draft.day || !draft.title) {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu bài học không hợp lệ: Thiếu số ngày hoặc tiêu đề.",
        },
        { status: 400 },
      );
    }

    const result = await saveLessonToGitHub(draft, { expectedSha, commitMessage });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: `Lỗi máy chủ khi lưu bài học: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 },
    );
  }
}
