import { describe, it, expect, beforeEach } from "vitest";
import { useExpenseStore } from "@/stores/use-expense-store";
import type { ExpenseEntry } from "@/types";

const makeExpense = (overrides: Partial<ExpenseEntry> = {}): ExpenseEntry => ({
  id: "exp-1",
  flat_id: "flat-1",
  category: "groceries",
  amount_inr: 500,
  paid_by: "member-1",
  date: "2024-06-15",
  note: null,
  created_at: "2024-06-15T10:00:00Z",
  updated_at: "2024-06-15T10:00:00Z",
  ...overrides,
});

describe("useExpenseStore", () => {
  beforeEach(() => {
    useExpenseStore.setState({ expenses: [] });
  });

  it("starts with an empty expenses list", () => {
    expect(useExpenseStore.getState().expenses).toEqual([]);
  });

  it("setExpenses replaces the list", () => {
    const e = makeExpense();
    useExpenseStore.getState().setExpenses([e]);
    expect(useExpenseStore.getState().expenses).toHaveLength(1);
  });

  it("addExpense appends to the list", () => {
    const e1 = makeExpense({ id: "exp-1" });
    const e2 = makeExpense({ id: "exp-2", amount_inr: 200 });
    useExpenseStore.getState().addExpense(e1);
    useExpenseStore.getState().addExpense(e2);
    expect(useExpenseStore.getState().expenses).toHaveLength(2);
  });

  it("updateExpense mutates only the matching entry", () => {
    const e = makeExpense({ id: "exp-1", amount_inr: 100 });
    useExpenseStore.getState().setExpenses([e]);
    useExpenseStore.getState().updateExpense("exp-1", { amount_inr: 999 });
    expect(useExpenseStore.getState().expenses[0].amount_inr).toBe(999);
  });

  it("updateExpense ignores non-matching ids", () => {
    const e = makeExpense({ id: "exp-1", amount_inr: 100 });
    useExpenseStore.getState().setExpenses([e]);
    useExpenseStore.getState().updateExpense("exp-99", { amount_inr: 999 });
    expect(useExpenseStore.getState().expenses[0].amount_inr).toBe(100);
  });

  it("removeExpense deletes the matching entry", () => {
    const e = makeExpense({ id: "exp-1" });
    useExpenseStore.getState().setExpenses([e]);
    useExpenseStore.getState().removeExpense("exp-1");
    expect(useExpenseStore.getState().expenses).toHaveLength(0);
  });

  it("getExpensesByDate filters correctly", () => {
    useExpenseStore.getState().setExpenses([
      makeExpense({ id: "e1", date: "2024-06-15" }),
      makeExpense({ id: "e2", date: "2024-06-16" }),
    ]);
    const results = useExpenseStore.getState().getExpensesByDate("2024-06-15");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("e1");
  });

  it("getTotalByDate sums correctly", () => {
    useExpenseStore.getState().setExpenses([
      makeExpense({ id: "e1", date: "2024-06-15", amount_inr: 100 }),
      makeExpense({ id: "e2", date: "2024-06-15", amount_inr: 250 }),
      makeExpense({ id: "e3", date: "2024-06-16", amount_inr: 999 }),
    ]);
    expect(useExpenseStore.getState().getTotalByDate("2024-06-15")).toBe(350);
  });

  it("getTotalByDate returns 0 for a date with no entries", () => {
    useExpenseStore.getState().setExpenses([]);
    expect(useExpenseStore.getState().getTotalByDate("2024-01-01")).toBe(0);
  });

  it("getMonthlyTotal sums only the correct month", () => {
    useExpenseStore.getState().setExpenses([
      makeExpense({ id: "e1", date: "2024-06-01", amount_inr: 100 }),
      makeExpense({ id: "e2", date: "2024-06-30", amount_inr: 200 }),
      makeExpense({ id: "e3", date: "2024-07-01", amount_inr: 999 }),
    ]);
    // month is 0-indexed in Date: June = 5
    expect(useExpenseStore.getState().getMonthlyTotal(2024, 5)).toBe(300);
    expect(useExpenseStore.getState().getMonthlyTotal(2024, 6)).toBe(999);
  });
});
