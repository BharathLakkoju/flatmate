import { z } from "zod/v4";

export const flatSchema = z.object({
  name: z.string().min(1, "Flat name is required").max(100),
  monthly_budget: z.number().int().min(0).max(10000000).optional(),
});

export const joinFlatSchema = z.object({
  invite_code: z.string().min(3, "Invalid invite code").max(20),
});

export type FlatFormData = z.infer<typeof flatSchema>;
export type JoinFlatFormData = z.infer<typeof joinFlatSchema>;
