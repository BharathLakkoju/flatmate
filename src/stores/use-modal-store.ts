import { create } from "zustand";
import type { ExpenseEntry, MealPlanEntry, Task } from "@/types";

type EditableEntry =
  | { type: "expense"; data: ExpenseEntry }
  | { type: "meal"; data: MealPlanEntry }
  | { type: "task"; data: Task };

interface ModalState {
  isNewEntryOpen: boolean;
  defaultTab: "expense" | "meal" | "task" | "event";
  defaultDate: string;
  defaultMealType: string | null;
  editingEntry: EditableEntry | null;
  openNewEntry: (tab?: "expense" | "meal" | "task" | "event", date?: string, mealType?: string) => void;
  openEditEntry: (entry: EditableEntry) => void;
  closeNewEntry: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isNewEntryOpen: false,
  defaultTab: "expense",
  defaultDate: new Date().toISOString().split("T")[0],
  defaultMealType: null,
  editingEntry: null,
  openNewEntry: (tab = "expense", date, mealType) =>
    set({
      isNewEntryOpen: true,
      defaultTab: tab,
      defaultDate: date ?? new Date().toISOString().split("T")[0],
      defaultMealType: mealType ?? null,
      editingEntry: null,
    }),
  openEditEntry: (entry) =>
    set({
      isNewEntryOpen: true,
      defaultTab: entry.type === "expense" ? "expense" : entry.type === "meal" ? "meal" : "task",
      defaultDate:
        entry.type === "expense"
          ? entry.data.date
          : entry.type === "meal"
            ? entry.data.date
            : entry.data.due_date ?? new Date().toISOString().split("T")[0],
      defaultMealType: entry.type === "meal" ? entry.data.meal_type : null,
      editingEntry: entry,
    }),
  closeNewEntry: () => set({ isNewEntryOpen: false, editingEntry: null }),
}));
