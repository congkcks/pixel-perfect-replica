import { describe, expect, it } from "vitest";
import { getOriginFromRequest, handleRobotsRequest, handleSitemapRequest } from "@/lib/server-api";

describe("server-api dynamic routes", () => {
  it("resolves request origin dynamically from host and protocol headers", () => {
    const req = new Request("https://example.com/sitemap.xml", {
      headers: {
        host: "custom-domain.com",
        "x-forwarded-proto": "https",
      },
    });
    expect(getOriginFromRequest(req)).toBe("https://custom-domain.com");
  });

  it("serves dynamic robots.txt disallowing admin and pointing to dynamic sitemap", async () => {
    const req = new Request("https://my-app.vercel.app/robots.txt", {
      headers: { host: "my-app.vercel.app" },
    });
    const res = handleRobotsRequest(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);
    const text = await res!.text();
    expect(text).toContain("User-agent: *");
    expect(text).toContain("Disallow: /admin");
    expect(text).toContain("Sitemap: https://my-app.vercel.app/sitemap.xml");
  });

  it("serves dynamic sitemap.xml containing published lessons and no admin routes", async () => {
    const req = new Request("https://custom.vn/sitemap.xml", {
      headers: { host: "custom.vn", "x-forwarded-proto": "https" },
    });
    const res = handleSitemapRequest(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);
    expect(res?.headers.get("Content-Type")).toContain("application/xml");
    const xml = await res!.text();
    expect(xml).toContain("https://custom.vn/");
    expect(xml).toContain("https://custom.vn/journey");
    expect(xml).toContain("https://custom.vn/vocabulary");
    expect(xml).toContain("https://custom.vn/about");
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("vuvanhacong.vercel.app");
  });

  it("returns null for non-matching URLs", () => {
    const req = new Request("https://custom.vn/other-page");
    expect(handleRobotsRequest(req)).toBeNull();
    expect(handleSitemapRequest(req)).toBeNull();
  });
});
