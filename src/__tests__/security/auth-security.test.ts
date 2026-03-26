/**
 * Security unit tests — verifies the open redirect sanitization logic
 * independently from the Next.js Request/Response runtime.
 */
import { describe, it, expect } from "vitest";

/** Extracted pure logic from auth/callback/route.ts for unit testing */
const ALLOWED_NEXT_PREFIXES = ["/app/", "/onboarding", "/join"];

function sanitizeNext(next: string | null): string {
  if (!next) return "/onboarding";
  if (next.startsWith("http") || next.startsWith("//")) return "/onboarding";
  const isAllowed = ALLOWED_NEXT_PREFIXES.some((prefix) => next.startsWith(prefix));
  return isAllowed ? next : "/onboarding";
}

describe("sanitizeNext — open redirect prevention", () => {
  it("allows /onboarding", () => {
    expect(sanitizeNext("/onboarding")).toBe("/onboarding");
  });

  it("allows /app/ paths", () => {
    expect(sanitizeNext("/app/dashboard")).toBe("/app/dashboard");
  });

  it("allows /join paths", () => {
    expect(sanitizeNext("/join")).toBe("/join");
  });

  it("blocks http absolute URL (open redirect)", () => {
    expect(sanitizeNext("http://evil.com")).toBe("/onboarding");
  });

  it("blocks https absolute URL (open redirect)", () => {
    expect(sanitizeNext("https://attacker.io/steal")).toBe("/onboarding");
  });

  it("blocks protocol-relative URL // (open redirect)", () => {
    expect(sanitizeNext("//evil.com")).toBe("/onboarding");
  });

  it("blocks arbitrary internal path not in allow-list", () => {
    expect(sanitizeNext("/admin")).toBe("/onboarding");
  });

  it("falls back to /onboarding for null", () => {
    expect(sanitizeNext(null)).toBe("/onboarding");
  });

  it("falls back to /onboarding for empty string", () => {
    expect(sanitizeNext("")).toBe("/onboarding");
  });
});

/** Invite code entropy tests */
describe("invite code format", () => {
  /**
   * Simulate the new invite code generation logic:
   *   Array.from({length:6}, () => Math.floor(Math.random()*16).toString(16))
   */
  const generateInviteCode = (prefix: string) => {
    const randomSuffix = Array.from(
      { length: 6 },
      () => Math.floor(Math.random() * 16).toString(16)
    )
      .join("")
      .toUpperCase();
    return `${prefix}-${randomSuffix}`;
  };

  it("invite code matches expected pattern PREFIX-XXXXXX", () => {
    const code = generateInviteCode("FLT");
    expect(code).toMatch(/^[A-Z]{2,5}-[0-9A-F]{6}$/);
  });

  it("generates unique codes (entropy check over 1000 samples)", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateInviteCode("TST")));
    // With 16^6 = 16,777,216 combinations, no duplicates expected in 1000 samples
    expect(codes.size).toBe(1000);
  });

  it("suffix is always 6 characters long", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateInviteCode("XYZ");
      const suffix = code.split("-")[1];
      expect(suffix).toHaveLength(6);
    }
  });
});
