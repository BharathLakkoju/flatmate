import { create } from "zustand";
import type { ExpenseEntry } from "@/types";

interface ExpenseState {
  expenses: ExpenseEntry[];
  setExpenses: (expenses: ExpenseEntry[]) => void;
  addExpense: (expense: ExpenseEntry) => void;
  updateExpense: (id: string, updates: Partial<ExpenseEntry>) => void;
  removeExpense: (id: string) => void;
  getExpensesByDate: (date: string) => ExpenseEntry[];
  getTotalByDate: (date: string) => number;
  getMonthlyTotal: (year: number, month: number) => number;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),
  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),
  getExpensesByDate: (date) => get().expenses.filter((e) => e.date === date),
  getTotalByDate: (date) =>
    get()
      .expenses.filter((e) => e.date === date)
      .reduce((sum, e) => sum + Number(e.amount_inr), 0),
  getMonthlyTotal: (year, month) =>
    get()
      .expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, e) => sum + Number(e.amount_inr), 0),
}));
