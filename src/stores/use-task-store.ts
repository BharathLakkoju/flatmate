import { create } from "zustand";
import type { Task, Resource } from "@/types";

interface TaskState {
  tasks: Task[];
  resources: Resource[];
  setTasks: (tasks: Task[]) => void;
  setResources: (resources: Resource[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  addResource: (resource: Resource) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  getTasksByStatus: (status: Task["status"]) => Task[];
  getDueTodayTasks: () => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  resources: [],
  setTasks: (tasks) => set({ tasks }),
  setResources: (resources) => set({ resources }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  removeTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
  addResource: (resource) =>
    set((state) => ({ resources: [...state.resources, resource] })),
  updateResource: (id, updates) =>
    set((state) => ({
      resources: state.resources.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
  getDueTodayTasks: () => {
    const today = new Date().toISOString().split("T")[0];
    return get().tasks.filter(
      (t) => t.due_date === today && t.status !== "completed"
    );
  },
}));
