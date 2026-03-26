import { describe, it, expect } from "vitest";
import { expenseSchema, expenseCategories } from "@/lib/validators/expense";

describe("expenseSchema", () => {
  const validExpense = {
    category: "groceries" as const,
    amount_inr: 250,
    paid_by: "550e8400-e29b-41d4-a716-446655440000",
    date: "2024-06-15",
  };

  it("accepts a valid expense", () => {
    const result = expenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it("accepts an optional note", () => {
    const result = expenseSchema.safeParse({ ...validExpense, note: "milk and eggs" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing category", () => {
    const { category: _, ...rest } = validExpense;
    const result = expenseSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category", () => {
    const result = expenseSchema.safeParse({ ...validExpense, category: "food" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid categories", () => {
    for (const category of expenseCategories) {
      const result = expenseSchema.safeParse({ ...validExpense, category });
      expect(result.success).toBe(true);
    }
  });

  it("rejects zero amount", () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount_inr: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount_inr: -50 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid UUID for paid_by", () => {
    const result = expenseSchema.safeParse({ ...validExpense, paid_by: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date format", () => {
    const result = expenseSchema.safeParse({ ...validExpense, date: "15-06-2024" });
    expect(result.success).toBe(false);
  });

  it("rejects a note that exceeds 500 chars", () => {
    const result = expenseSchema.safeParse({ ...validExpense, note: "x".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("treats partial parse correctly for PATCH — amount only", () => {
    const partial = expenseSchema.partial();
    const result = partial.safeParse({ amount_inr: 100 });
    expect(result.success).toBe(true);
  });

  it("partial parse still rejects invalid fields", () => {
    const partial = expenseSchema.partial();
    const result = partial.safeParse({ amount_inr: -1 });
    expect(result.success).toBe(false);
  });
});
