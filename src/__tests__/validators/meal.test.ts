import { describe, it, expect } from "vitest";
import { mealSchema, mealTypes } from "@/lib/validators/meal";

describe("mealSchema", () => {
  const validMeal = {
    meal_type: "dinner" as const,
    content: "Spaghetti carbonara",
    date: "2024-06-15",
  };

  it("accepts a valid meal", () => {
    const result = mealSchema.safeParse(validMeal);
    expect(result.success).toBe(true);
  });

  it("accepts all valid meal types", () => {
    for (const meal_type of mealTypes) {
      const result = mealSchema.safeParse({ ...validMeal, meal_type });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid meal type", () => {
    const result = mealSchema.safeParse({ ...validMeal, meal_type: "brunch" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty content string", () => {
    const result = mealSchema.safeParse({ ...validMeal, content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects content exceeding 500 chars", () => {
    const result = mealSchema.safeParse({ ...validMeal, content: "x".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date format", () => {
    const result = mealSchema.safeParse({ ...validMeal, date: "June 15 2024" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing date", () => {
    const { date: _, ...rest } = validMeal;
    const result = mealSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("partial parse allows updating a single field", () => {
    const partial = mealSchema.partial();
    const result = partial.safeParse({ content: "Updated content" });
    expect(result.success).toBe(true);
  });
});
