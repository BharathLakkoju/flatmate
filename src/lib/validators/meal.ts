import { z } from "zod/v4";

export const mealTypes = ["breakfast", "lunch", "dinner", "general"] as const;

export const mealSchema = z.object({
  meal_type: z.enum(mealTypes),
  content: z.string().min(1, "Meal content is required").max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export type MealFormData = z.infer<typeof mealSchema>;
