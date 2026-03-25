import { create } from "zustand";
import type { MealPlanEntry } from "@/types";

interface MealState {
  meals: MealPlanEntry[];
  setMeals: (meals: MealPlanEntry[]) => void;
  addMeal: (meal: MealPlanEntry) => void;
  updateMeal: (id: string, updates: Partial<MealPlanEntry>) => void;
  removeMeal: (id: string) => void;
  getMealsByDate: (date: string) => MealPlanEntry[];
}

export const useMealStore = create<MealState>((set, get) => ({
  meals: [],
  setMeals: (meals) => set({ meals }),
  addMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
  updateMeal: (id, updates) =>
    set((state) => ({
      meals: state.meals.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  removeMeal: (id) =>
    set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),
  getMealsByDate: (date) => get().meals.filter((m) => m.date === date),
}));
