import { describe, it, expect } from "vitest";
import { taskSchema, taskStatuses, taskPriorities } from "@/lib/validators/task";

describe("taskSchema", () => {
  const validTask = {
    title: "Buy groceries",
    status: "pending" as const,
    priority: "normal" as const,
  };

  it("accepts a minimal valid task (title only with defaults)", () => {
    const result = taskSchema.safeParse({ title: "Clean bathroom" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("pending");
      expect(result.data.priority).toBe("normal");
    }
  });

  it("accepts a fully specified valid task", () => {
    const result = taskSchema.safeParse({
      ...validTask,
      description: "Get milk, eggs, and bread",
      assigned_to: "550e8400-e29b-41d4-a716-446655440000",
      category: "household",
      due_date: "2024-07-01",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = taskSchema.safeParse({ ...validTask, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a title exceeding 200 chars", () => {
    const result = taskSchema.safeParse({ ...validTask, title: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of taskStatuses) {
      const result = taskSchema.safeParse({ ...validTask, status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid status", () => {
    const result = taskSchema.safeParse({ ...validTask, status: "done" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid priorities", () => {
    for (const priority of taskPriorities) {
      const result = taskSchema.safeParse({ ...validTask, priority });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid priority", () => {
    const result = taskSchema.safeParse({ ...validTask, priority: "critical" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid UUID for assigned_to", () => {
    const result = taskSchema.safeParse({ ...validTask, assigned_to: "member-abc" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid due_date format", () => {
    const result = taskSchema.safeParse({ ...validTask, due_date: "01/07/2024" });
    expect(result.success).toBe(false);
  });

  it("rejects a description exceeding 1000 chars", () => {
    const result = taskSchema.safeParse({ ...validTask, description: "x".repeat(1001) });
    expect(result.success).toBe(false);
  });

  it("partial parse allows updating status only", () => {
    const partial = taskSchema.partial();
    const result = partial.safeParse({ status: "completed" });
    expect(result.success).toBe(true);
  });
});
