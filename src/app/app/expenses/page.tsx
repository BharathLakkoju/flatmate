"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, TrendingUp, Users, Receipt } from "lucide-react";
import { useCalendarStore } from "@/stores/use-calendar-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useFlatStore } from "@/stores/use-flat-store";
import { useModalStore } from "@/stores/use-modal-store";
import { HarmonyMeter } from "@/components/shared/HarmonyMeter";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const categoryLabels: Record<string, string> = {
  groceries: "Groceries",
  meals: "Meals/Food",
  utilities: "Utilities",
  outings: "Outings",
  household: "Household",
  other: "Other",
};

const categoryColors: Record<string, string> = {
  groceries: "bg-primary-fixed text-primary",
  meals: "bg-secondary-container text-on-secondary-container",
  utilities: "bg-tertiary-container text-on-tertiary-container",
  outings: "bg-primary/10 text-primary",
  household: "bg-surface-container-high text-on-surface",
  other: "bg-surface-container text-on-surface-variant",
};

export default function ExpensesPage() {
  const { currentMonth, prevMonth, nextMonth } = useCalendarStore();
  const expenses = useExpenseStore((s) => s.expenses);
  const members = useFlatStore((s) => s.members);
  const openEditEntry = useModalStore((s) => s.openEditEntry);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Filter expenses for current month
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [expenses, year, month]);

  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount_inr, 0);

  // Per-category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount_inr;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, total]) => ({
        category: cat,
        label: categoryLabels[cat] || cat,
        total,
        percent: monthTotal > 0 ? (total / monthTotal) * 100 : 0,
      }));
  }, [monthExpenses, monthTotal]);

  // Per-person breakdown
  const personBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.paid_by] = (map[e.paid_by] || 0) + e.amount_inr;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([person, total]) => {
        const member = members.find((m) => m.id === person);
        return {
          id: person,
          name: member?.display_name || person,
          total,
          percent: monthTotal > 0 ? (total / monthTotal) * 100 : 0,
        };
      });
  }, [monthExpenses, monthTotal, members]);

  const budgetCap = 15000;
  const budgetPercent = Math.min(100, (monthTotal / budgetCap) * 100);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Monthly Summary
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Spending breakdown & insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="h-9 w-9 rounded-[8px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-on-surface min-w-25 text-center">
            {format(currentMonth, "MMM yyyy")}
          </span>
          <button
            onClick={nextMonth}
            className="h-9 w-9 rounded-[8px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Top Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Total Spend
            </p>
          </div>
          <p className="text-3xl font-heading font-bold text-on-surface">
            ₹{monthTotal.toLocaleString("en-IN")}
          </p>
          <div className="mt-3">
            <HarmonyMeter value={budgetPercent} label="" statusText={`${budgetPercent.toFixed(0)}% of budget`} />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Receipt className="h-4 w-4 text-secondary" />
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Total Entries
            </p>
          </div>
          <p className="text-3xl font-heading font-bold text-on-surface">
            {monthExpenses.length}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            {categoryBreakdown.length} categories used
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-tertiary" />
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Contributors
            </p>
          </div>
          <p className="text-3xl font-heading font-bold text-on-surface">
            {personBreakdown.length}
          </p>
          <p className="text-xs text-on-surface-variant mt-2">
            {personBreakdown.length > 0
              ? `Top: ${personBreakdown[0].name}`
              : "No spending yet"}
          </p>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <p className="font-heading font-semibold text-on-surface">
          Category Breakdown
        </p>

        {categoryBreakdown.length > 0 ? (
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-[8px] text-xs font-medium ${
                      categoryColors[cat.category] || "bg-surface-container text-on-surface"
                    }`}
                  >
                    {cat.label}
                  </span>
                  <span className="font-bold text-on-surface">
                    ₹{cat.total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-linear-to-r from-secondary to-primary"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant text-right">
                  {cat.percent.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-on-surface-variant">
              No expenses for {format(currentMonth, "MMMM yyyy")}
            </p>
          </div>
        )}
      </motion.div>

      {/* Per-Person Breakdown */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <p className="font-heading font-semibold text-on-surface">
          Per-Person Paid Out
        </p>

        {personBreakdown.length > 0 ? (
          <div className="space-y-3">
            {personBreakdown.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-4 bg-surface-container rounded-[12px] p-4"
              >
                <div className="h-10 w-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-on-surface truncate">
                      {person.name}
                    </p>
                    <p className="text-sm font-bold text-on-surface shrink-0">
                      ₹{person.total.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${person.percent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    {person.percent.toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-on-surface-variant">
              No spending recorded for this month
            </p>
          </div>
        )}
      </motion.div>

      {/* All Entries Table */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <p className="font-heading font-semibold text-on-surface">
          All Entries
        </p>

        {monthExpenses.length > 0 ? (
          <div className="space-y-1">
            {[...monthExpenses]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <div
                  key={expense.id}
                  onClick={() => openEditEntry({ type: "expense", data: expense })}
                  className="flex items-center justify-between bg-surface-container rounded-[8px] p-3 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-[8px] flex items-center justify-center ${
                        categoryColors[expense.category] || "bg-surface-container-high"
                      }`}
                    >
                      <Receipt className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface capitalize">
                        {expense.category}
                      </p>
                      {expense.note && (
                        <p className="text-xs text-on-surface-variant truncate max-w-45">
                          {expense.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-on-surface">
                      ₹{expense.amount_inr.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      {format(new Date(expense.date), "dd MMM")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-on-surface-variant">
              No entries for this month
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
