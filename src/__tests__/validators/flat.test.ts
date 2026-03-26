import { describe, it, expect } from "vitest";
import { flatSchema, joinFlatSchema } from "@/lib/validators/flat";

describe("flatSchema", () => {
  it("accepts a valid flat name", () => {
    const result = flatSchema.safeParse({ name: "Sunset Apartments" });
    expect(result.success).toBe(true);
  });

  it("accepts name with optional monthly_budget", () => {
    const result = flatSchema.safeParse({ name: "My Flat", monthly_budget: 20000 });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = flatSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a name exceeding 100 chars", () => {
    const result = flatSchema.safeParse({ name: "x".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects a negative monthly_budget", () => {
    const result = flatSchema.safeParse({ name: "My Flat", monthly_budget: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects monthly_budget exceeding 10000000", () => {
    const result = flatSchema.safeParse({ name: "My Flat", monthly_budget: 10000001 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer monthly_budget", () => {
    const result = flatSchema.safeParse({ name: "My Flat", monthly_budget: 1000.5 });
    expect(result.success).toBe(false);
  });
});

describe("joinFlatSchema", () => {
  it("accepts a valid invite code", () => {
    const result = joinFlatSchema.safeParse({ invite_code: "SUN-1A2B3C" });
    expect(result.success).toBe(true);
  });

  it("rejects a code shorter than 3 chars", () => {
    const result = joinFlatSchema.safeParse({ invite_code: "AB" });
    expect(result.success).toBe(false);
  });

  it("rejects a code longer than 20 chars", () => {
    const result = joinFlatSchema.safeParse({ invite_code: "x".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("rejects a missing invite_code", () => {
    const result = joinFlatSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
