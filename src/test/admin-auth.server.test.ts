import { describe, expect, it } from "vitest";
import { generateSessionToken, parseCookie, verifySessionToken } from "@/lib/admin-auth.server";

describe("admin-auth.server", () => {
  it("generates a session token with timestamp and signature", async () => {
    const token = await generateSessionToken();
    expect(token).toBeTypeOf("string");
    const parts = token.split(".");
    expect(parts).toHaveLength(2);
    expect(Number(parts[0])).toBeGreaterThan(0);
    expect(parts[1]?.length).toBe(64); // SHA-256 hex is 64 characters
  });

  it("verifies a valid generated session token", async () => {
    const token = await generateSessionToken();
    const isValid = await verifySessionToken(token);
    expect(isValid).toBe(true);
  });

  it("rejects tampered or forged session token", async () => {
    const token = await generateSessionToken();
    const [time] = token.split(".");
    const forgedToken = `${time}.forgedsignature0000000000000000000000000000000000000000000000000000`;
    const isValid = await verifySessionToken(forgedToken);
    expect(isValid).toBe(false);
  });

  it("rejects empty or malformed token strings", async () => {
    expect(await verifySessionToken(null)).toBe(false);
    expect(await verifySessionToken("")).toBe(false);
    expect(await verifySessionToken("invalid-format")).toBe(false);
    expect(await verifySessionToken("abc.def.ghi")).toBe(false);
  });

  it("parses cookies from Cookie header string correctly", () => {
    const header = "theme=dark; vvhc_admin_session=abc123token; other=xyz";
    expect(parseCookie(header, "vvhc_admin_session")).toBe("abc123token");
    expect(parseCookie(header, "theme")).toBe("dark");
    expect(parseCookie(header, "non_existent")).toBeNull();
    expect(parseCookie(null, "any")).toBeNull();
  });
});
