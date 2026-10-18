import { authenticateAdminRequest, handleAdminAuthApi } from "./admin-auth.server";
import {
  deleteLessonFromGitHub,
  getLessonFileMetadata,
  saveLessonToGitHub,
} from "./github-cms.server";
import type { LessonDraft } from "./lesson-file";
import { lessons } from "./lessons";

export function getOriginFromRequest(request: Request): string {
  const envUrl = process.env["SITE_URL"] || process.env["NEXT_PUBLIC_SITE_URL"];
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https") ? "https" : "http");

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`;
  }

  if (host) {
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

export function handleSitemapRequest(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== "/sitemap.xml") return null;

  const origin = getOriginFromRequest(request);
  // Chỉ bao gồm các bài học đã xuất bản (completed: true), không chứa nháp hoặc trang quản trị!
  const publishedLessons = lessons.filter((l) => l.completed ?? true);
  const now = new Date().toISOString().split("T")[0];

  const urls = [
    { loc: `${origin}/`, priority: "1.0", changefreq: "daily", lastmod: now },
    { loc: `${origin}/journey`, priority: "0.9", changefreq: "daily", lastmod: now },
    { loc: `${origin}/vocabulary`, priority: "0.8", changefreq: "daily", lastmod: now },
    { loc: `${origin}/about`, priority: "0.7", changefreq: "monthly", lastmod: now },
    ...publishedLessons.map((l) => ({
      loc: `${origin}/journey/day/${l.day}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: l.date || now,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export function handleRobotsRequest(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== "/robots.txt") return null;

  const origin = getOriginFromRequest(request);
  const content = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: ${origin}/sitemap.xml
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

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

export async function handleLessonAdminApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  // POST /api/admin/lessons/save
  if (url.pathname === "/api/admin/lessons/save" && request.method === "POST") {
    const isAuth = await authenticateAdminRequest(request);
    if (!isAuth) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Yêu cầu không hợp lệ: Phiên quản trị hết hạn hoặc chưa đăng nhập.",
        }),
        { status: 401, headers: { "Content-Type": "application/json; charset=utf-8" } },
      );
    }

    if (!isSafeOrigin(request)) {
      return new Response(
        JSON.stringify({ success: false, message: "Yêu cầu bị từ chối do vi phạm an toàn CSRF." }),
        { status: 403, headers: { "Content-Type": "application/json; charset=utf-8" } },
      );
    }

    try {
      const body = (await request.json().catch(() => ({}))) as {
        draft?: unknown;
        expectedSha?: string | null | undefined;
        commitMessage?: string | undefined;
      };
      const { draft, expectedSha, commitMessage } = body;

      if (!draft || typeof draft !== "object" || !("day" in draft) || !("title" in draft)) {
        return new Response(
          JSON.stringify({ success: false, message: "Dữ liệu bài học không đầy đủ." }),
          { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } },
        );
      }

      const result = await saveLessonToGitHub(draft as unknown as LessonDraft, {
        expectedSha,
        commitMessage,
      });
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Lỗi máy chủ khi lưu: ${e instanceof Error ? e.message : String(e)}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } },
      );
    }
  }

  // POST /api/admin/lessons/delete
  if (url.pathname === "/api/admin/lessons/delete" && request.method === "POST") {
    const isAuth = await authenticateAdminRequest(request);
    if (!isAuth) {
      return new Response(
        JSON.stringify({ success: false, message: "Phiên quản trị hết hạn hoặc chưa đăng nhập." }),
        { status: 401, headers: { "Content-Type": "application/json; charset=utf-8" } },
      );
    }

    if (!isSafeOrigin(request)) {
      return new Response(JSON.stringify({ success: false, message: "Yêu cầu bị từ chối CSRF." }), {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    try {
      const body = (await request.json().catch(() => ({}))) as {
        day?: number | undefined;
        sha?: string | null | undefined;
        commitMessage?: string | undefined;
      };
      const { day, sha, commitMessage } = body;
      if (!day) {
        return new Response(
          JSON.stringify({ success: false, message: "Thiếu thông tin ngày học cần xóa." }),
          { status: 400, headers: { "Content-Type": "application/json; charset=utf-8" } },
        );
      }

      const result = await deleteLessonFromGitHub(Number(day), { sha, commitMessage });
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Lỗi khi xóa bài học: ${e instanceof Error ? e.message : String(e)}`,
        }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } },
      );
    }
  }

  // GET /api/admin/lessons/:day/metadata
  if (
    url.pathname.startsWith("/api/admin/lessons/") &&
    url.pathname.endsWith("/metadata") &&
    request.method === "GET"
  ) {
    const isAuth = await authenticateAdminRequest(request);
    if (!isAuth) {
      return new Response(JSON.stringify({ exists: false, sha: null }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const match = url.pathname.match(/\/api\/admin\/lessons\/(\d+)\/metadata/);
    const day = match ? Number(match[1]) : 0;
    const meta = await getLessonFileMetadata(day);
    return new Response(JSON.stringify(meta), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  return null;
}

export async function handleCustomServerRoutes(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  // 1. Admin Authentication API
  if (
    url.pathname.startsWith("/api/admin/auth/") ||
    url.pathname === "/api/admin/login" ||
    url.pathname === "/api/admin/session" ||
    url.pathname === "/api/admin/logout"
  ) {
    const authRes = await handleAdminAuthApi(request);
    if (authRes) return authRes;
  }

  // 2. Admin Lessons GitHub CMS API
  if (url.pathname.startsWith("/api/admin/lessons/")) {
    const lessonApiRes = await handleLessonAdminApi(request);
    if (lessonApiRes) return lessonApiRes;
  }

  // 3. Dynamic Sitemap (Chỉ chứa bài đã xuất bản, domain tự động từ request)
  if (url.pathname === "/sitemap.xml") {
    const sitemapRes = handleSitemapRequest(request);
    if (sitemapRes) return sitemapRes;
  }

  // 4. Dynamic Robots.txt
  if (url.pathname === "/robots.txt") {
    const robotsRes = handleRobotsRequest(request);
    if (robotsRes) return robotsRes;
  }

  return null;
}
