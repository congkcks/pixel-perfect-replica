// Server-only Admin Authentication Module
// Mật khẩu và token chỉ tồn tại và được xác thực tại máy chủ.
// Không bao giờ import module này vào code chạy trên client!

const COOKIE_NAME = "vvhc_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 giờ (giây)

function getAdminSecret(): string {
  // Lấy secret từ biến môi trường máy chủ
  return (
    process.env["SESSION_SECRET"] ||
    process.env["ADMIN_PASSWORD"] ||
    "vvhc-default-secret-change-in-production"
  );
}

function getExpectedAdminPassword(): string | null {
  // Tuyệt đối không đọc từ VITE_ prefix. Chỉ đọc biến môi trường phía server!
  return process.env["ADMIN_PASSWORD"] || null;
}

// Tạo chữ ký HMAC-SHA256 cho chuỗi
async function createHmacSha256(message: string, secret: string): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  const messageBytes = new TextEncoder().encode(message);

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, messageBytes as unknown as BufferSource);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Tạo session token: "<timestamp>.<signature>"
export async function generateSessionToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const secret = getAdminSecret();
  const sig = await createHmacSha256(timestamp, secret);
  return `${timestamp}.${sig}`;
}

// Xác thực session token
export async function verifySessionToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, providedSig] = parts;
  if (!timestampStr || !providedSig) return false;

  const timestamp = Number(timestampStr);
  if (isNaN(timestamp)) return false;

  // Kiểm tra thời hạn hết hạn 24 giờ
  const now = Date.now();
  if (now - timestamp > SESSION_MAX_AGE * 1000 || timestamp > now + 60000) {
    return false;
  }

  const secret = getAdminSecret();
  const expectedSig = await createHmacSha256(timestampStr, secret);

  // So sánh an toàn độ dài cố định
  if (expectedSig.length !== providedSig.length) return false;
  let match = true;
  for (let i = 0; i < expectedSig.length; i++) {
    if (expectedSig[i] !== providedSig[i]) match = false;
  }
  return match;
}

// Đọc cookie từ header Request
export function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  for (const c of cookies) {
    const [k, ...v] = c.trim().split("=");
    if (k === name) {
      return decodeURIComponent(v.join("="));
    }
  }
  return null;
}

export async function authenticateAdminRequest(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");
  const token = parseCookie(cookieHeader, COOKIE_NAME);
  return verifySessionToken(token);
}

// Xử lý các API endpoint xác thực Admin
export async function handleAdminAuthApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);

  // 1. POST /api/admin/login
  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    try {
      const body = (await request.json().catch(() => ({}))) as { password?: string };
      const password = body.password?.trim() ?? "";

      const expectedPassword = getExpectedAdminPassword();

      if (!expectedPassword) {
        console.error(
          "[ADMIN AUTH SECURITY ALERT]: Biến môi trường ADMIN_PASSWORD chưa được thiết lập trên server! Vui lòng cấu hình ADMIN_PASSWORD trong tệp .env hoặc dashboard Vercel.",
        );
        return new Response(
          JSON.stringify({
            success: false,
            message:
              "Hệ thống chưa thiết lập ADMIN_PASSWORD trên máy chủ. Vui lòng cấu hình biến môi trường ADMIN_PASSWORD.",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          },
        );
      }

      // So sánh mật khẩu an toàn
      const isValid = password === expectedPassword;

      if (!isValid) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Mật khẩu quản trị không chính xác.",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          },
        );
      }

      // Tạo session token và HttpOnly cookie
      const token = await generateSessionToken();
      const isHttps = url.protocol === "https:";
      const cookieHeader = `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}; ${isHttps ? "Secure;" : ""}`;

      return new Response(
        JSON.stringify({
          success: true,
          message: "Xác thực thành công.",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Set-Cookie": cookieHeader,
          },
        },
      );
    } catch (e) {
      console.error("Lỗi khi xử lý đăng nhập admin:", e);
      return new Response(
        JSON.stringify({ success: false, message: "Lỗi máy chủ khi đăng nhập." }),
        { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } },
      );
    }
  }

  // 2. GET /api/admin/session
  if (url.pathname === "/api/admin/session" && request.method === "GET") {
    const cookieHeader = request.headers.get("cookie");
    const token = parseCookie(cookieHeader, COOKIE_NAME);
    const isAuthenticated = await verifySessionToken(token);

    return new Response(JSON.stringify({ authenticated: isAuthenticated }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  // 3. POST /api/admin/logout
  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    const isHttps = url.protocol === "https:";
    const expiredCookie = `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${isHttps ? "Secure;" : ""}`;

    return new Response(JSON.stringify({ success: true, message: "Đã đăng xuất." }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": expiredCookie,
      },
    });
  }

  return null;
}
