import { z } from "zod/v4";

export const groceryUnitTypes = ["pieces", "percentage"] as const;
export const groceryItemStatuses = ["in_stock", "low"] as const;
export const groceryPlatforms = [
  "swiggy",
  "zepto",
  "blinkit",
  "dunzo",
  "bigbasket",
  "jiomart",
  "dmart",
  "other",
  "manual",
] as const;

export const createGroceryItemSchema = z.object({
  name: z.string().min(1).max(200),
  unit_type: z.enum(groceryUnitTypes),
  unit_label: z.string().min(1).max(50),
  total_quantity: z.number().positive(),
  remaining_quantity: z.number().min(0),
  price_inr: z.number().positive().nullable().optional(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  estimated_days: z.number().int().positive().nullable().optional(),
  order_id: z.string().uuid().nullable().optional(),
});

export const updateGroceryItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  unit_type: z.enum(groceryUnitTypes).optional(),
  unit_label: z.string().min(1).max(50).optional(),
  total_quantity: z.number().positive().optional(),
  remaining_quantity: z.number().min(0).optional(),
  price_inr: z.number().positive().nullable().optional(),
  purchase_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estimated_days: z.number().int().positive().nullable().optional(),
  status: z.enum(groceryItemStatuses).optional(),
});

export const createGroceryOrderSchema = z.object({
  platform: z.enum(groceryPlatforms),
  platform_label: z.string().max(100).nullable().optional(),
  total_amount_inr: z.number().positive(),
  order_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  paid_by: z.string().uuid("Invalid member ID"),
  items: z.array(
    z.object({
      name: z.string().min(1).max(200),
      unit_type: z.enum(groceryUnitTypes),
      unit_label: z.string().min(1).max(50),
      total_quantity: z.number().positive(),
      price_inr: z.number().positive().nullable().optional(),
      estimated_days: z.number().int().positive().nullable().optional(),
    })
  ).min(1),
});

export const logGroceryUsageSchema = z.object({
  item_id: z.string().uuid(),
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  amount_used: z.number().positive(),
  note: z.string().max(500).optional(),
});

export type CreateGroceryItemData = z.infer<typeof createGroceryItemSchema>;
export type CreateGroceryOrderData = z.infer<typeof createGroceryOrderSchema>;
export type LogGroceryUsageData = z.infer<typeof logGroceryUsageSchema>;
