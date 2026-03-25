import { z } from "zod/v4";

export const expenseCategories = [
  "groceries",
  "meals",
  "utilities",
  "outings",
  "household",
  "other",
] as const;

export const expenseSchema = z.object({
  category: z.enum(expenseCategories),
  amount_inr: z.number().positive("Amount must be positive"),
  paid_by: z.string().uuid("Invalid member ID"),
  note: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
