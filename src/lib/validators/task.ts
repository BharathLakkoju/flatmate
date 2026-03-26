import { z } from "zod/v4";

export const taskStatuses = ["pending", "completed"] as const;
export const taskPriorities = ["low", "normal", "high", "urgent"] as const;

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  assigned_to: z.string().uuid("Invalid member ID").optional(),
  status: z.enum(taskStatuses).default("pending"),
  priority: z.enum(taskPriorities).default("normal"),
  category: z.string().max(100).optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
