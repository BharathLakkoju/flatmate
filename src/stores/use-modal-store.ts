import { create } from "zustand";

interface ModalState {
  isNewEntryOpen: boolean;
  defaultTab: "expense" | "meal" | "task" | "event";
  defaultDate: string;
  defaultMealType: string | null;
  openNewEntry: (tab?: "expense" | "meal" | "task" | "event", date?: string, mealType?: string) => void;
  closeNewEntry: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isNewEntryOpen: false,
  defaultTab: "expense",
  defaultDate: new Date().toISOString().split("T")[0],
  defaultMealType: null,
  openNewEntry: (tab = "expense", date, mealType) =>
    set({
      isNewEntryOpen: true,
      defaultTab: tab,
      defaultDate: date ?? new Date().toISOString().split("T")[0],
      defaultMealType: mealType ?? null,
    }),
  closeNewEntry: () => set({ isNewEntryOpen: false }),
}));
