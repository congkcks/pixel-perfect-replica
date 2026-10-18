import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth.server";
import { getLessonFileMetadata } from "@/lib/github-cms.server";

export async function GET(request: Request, { params }: { params: Promise<{ day: string }> }) {
  const isAuth = await authenticateAdminRequest(request);
  if (!isAuth) {
    return NextResponse.json({ exists: false, sha: null }, { status: 401 });
  }

  const { day: dayParam } = await params;
  const day = Number(dayParam);
  const meta = await getLessonFileMetadata(day);

  return NextResponse.json(meta);
}
