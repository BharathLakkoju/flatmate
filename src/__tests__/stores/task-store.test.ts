import { describe, it, expect, beforeEach } from "vitest";
import { useTaskStore } from "@/stores/use-task-store";
import type { Task } from "@/types";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  flat_id: "flat-1",
  title: "Clean kitchen",
  description: null,
  assigned_to: null,
  status: "pending",
  priority: "normal",
  category: null,
  due_date: null,
  completed_at: null,
  created_at: "2024-06-15T10:00:00Z",
  updated_at: "2024-06-15T10:00:00Z",
  ...overrides,
});

describe("useTaskStore", () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], resources: [] });
  });

  it("starts empty", () => {
    expect(useTaskStore.getState().tasks).toEqual([]);
  });

  it("setTasks replaces list", () => {
    useTaskStore.getState().setTasks([makeTask()]);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });

  it("addTask appends correctly", () => {
    useTaskStore.getState().addTask(makeTask({ id: "t1" }));
    useTaskStore.getState().addTask(makeTask({ id: "t2" }));
    expect(useTaskStore.getState().tasks).toHaveLength(2);
  });

  it("updateTask updates matching task", () => {
    useTaskStore.getState().setTasks([makeTask({ id: "t1", status: "pending" })]);
    useTaskStore.getState().updateTask("t1", { status: "completed" });
    expect(useTaskStore.getState().tasks[0].status).toBe("completed");
  });

  it("removeTask removes the matching task", () => {
    useTaskStore.getState().setTasks([makeTask({ id: "t1" }), makeTask({ id: "t2" })]);
    useTaskStore.getState().removeTask("t1");
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0].id).toBe("t2");
  });

  it("getTasksByStatus filters correctly", () => {
    useTaskStore.getState().setTasks([
      makeTask({ id: "t1", status: "pending" }),
      makeTask({ id: "t2", status: "completed" }),
      makeTask({ id: "t3", status: "pending" }),
    ]);
    const pending = useTaskStore.getState().getTasksByStatus("pending");
    expect(pending).toHaveLength(2);
    const completed = useTaskStore.getState().getTasksByStatus("completed");
    expect(completed).toHaveLength(1);
  });

  it("getDueTodayTasks returns only non-completed tasks due today", () => {
    const today = new Date().toISOString().split("T")[0];
    useTaskStore.getState().setTasks([
      makeTask({ id: "t1", due_date: today, status: "pending" }),
      makeTask({ id: "t2", due_date: today, status: "completed" }),
      makeTask({ id: "t3", due_date: "2020-01-01", status: "pending" }),
    ]);
    const due = useTaskStore.getState().getDueTodayTasks();
    expect(due).toHaveLength(1);
    expect(due[0].id).toBe("t1");
  });

  it("getDueTodayTasks returns empty when no tasks due today", () => {
    useTaskStore.getState().setTasks([
      makeTask({ id: "t1", due_date: "2020-01-01", status: "pending" }),
    ]);
    expect(useTaskStore.getState().getDueTodayTasks()).toHaveLength(0);
  });
});
