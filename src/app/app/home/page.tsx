"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowRight,
  TrendingDown,
  UtensilsCrossed,
  ClipboardList,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useTaskStore } from "@/stores/use-task-store";
import { useModalStore } from "@/stores/use-modal-store";
import { useFlatStore } from "@/stores/use-flat-store";

const mealTypeOrder: Record<string, number> = { breakfast: 0, lunch: 1, dinner: 2, general: 3 };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function HomePage() {
  const currentMember = useFlatStore((s) => s.currentMember);
  const flat = useFlatStore((s) => s.flat);
  const userName = currentMember?.display_name || "";

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const hour = today.getHours();
  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : hour < 21
          ? "Good Evening"
          : "Still planning at this hour?";

  const expenses = useExpenseStore((s) => s.expenses);
  const meals = useMealStore((s) => s.meals);
  const tasks = useTaskStore((s) => s.tasks);
  const openNewEntry = useModalStore((s) => s.openNewEntry);

  const monthlyTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
    })
    .reduce((sum, e) => sum + Number(e.amount_inr), 0);
  const todayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + Number(e.amount_inr), 0);
  const todayMeals = meals
    .filter((m) => m.date === todayStr)
    .sort((a, b) => (mealTypeOrder[a.meal_type] ?? 9) - (mealTypeOrder[b.meal_type] ?? 9));
  const dueTasks = tasks.filter(
    (t) => t.due_date === todayStr && t.status !== "completed"
  );

  // Recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const budgetCap = flat?.monthly_budget ?? 15000;
  const budgetPercent = Math.min(100, (monthlyTotal / budgetCap) * 100);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Greeting */}
      <motion.div variants={fadeUp}>
        <p className="font-heading text-2xl sm:text-3xl font-bold text-on-surface">
          {greeting} {hour < 21 ? "👋" : "🌙"}
        </p>
        {userName && (
          <p className="font-heading text-lg sm:text-xl font-semibold text-on-surface-variant mt-0.5">
            {userName}
          </p>
        )}
        <p className="text-on-surface-variant text-sm mt-1">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Expense", icon: Receipt, tab: "expense" as const, color: "bg-primary-fixed text-primary" },
            { label: "Meal", icon: UtensilsCrossed, tab: "meal" as const, color: "bg-secondary-container text-on-secondary-container" },
            { label: "Task", icon: ClipboardList, tab: "task" as const, color: "bg-tertiary-container text-on-tertiary-container" },
            { label: "History", icon: TrendingDown, tab: undefined, color: "bg-surface-container-high text-on-surface", href: "/app/expenses" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => {
                if (action.href) {
                  window.location.href = action.href;
                } else if (action.tab) {
                  openNewEntry(action.tab, todayStr);
                }
              }}
              className={`flex flex-col items-center gap-1.5 rounded-[12px] p-3 text-center transition-colors hover:opacity-80 ${action.color}`}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Compact Stats Strip */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[16px] flex divide-x divide-surface-container-high py-3">
        <div className="flex-1 px-4">
          <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">Budget</p>
          <p className="text-base font-heading font-bold text-on-surface mt-0.5">₹{monthlyTotal.toLocaleString("en-IN")}</p>
          <div className="h-1 bg-surface-container-high rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full" style={{ width: `${budgetPercent}%` }} />
          </div>
          <p className="text-[9px] text-on-surface-variant mt-1">of ₹{budgetCap.toLocaleString("en-IN")}</p>
        </div>
        <div className="flex-1 px-4">
          <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">Today</p>
          <p className="text-base font-heading font-bold text-on-surface mt-0.5">₹{todayTotal.toLocaleString("en-IN")}</p>
          <p className="text-[9px] text-on-surface-variant mt-4.5">{expenses.filter((e) => e.date === todayStr).length} entries</p>
        </div>
        <div className="flex-1 px-4">
          <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">Due Today</p>
          <p className="text-base font-heading font-bold text-on-surface mt-0.5">{dueTasks.length}</p>
          <p className="text-[9px] text-on-surface-variant mt-4.5">{dueTasks.length === 0 ? "All clear" : "pending"}</p>
        </div>
      </motion.div>

      {/* Today's Meals */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            <p className="font-heading font-semibold text-on-surface">Today&apos;s Meals</p>
          </div>
          <Link href="/app/meals" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {todayMeals.length > 0 ? (
          <div className="space-y-2">
            {todayMeals.map((meal) => (
              <div key={meal.id} className="flex items-start gap-3 bg-surface-container rounded-[8px] p-3">
                <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium w-16 shrink-0 pt-0.5">
                  {meal.meal_type}
                </span>
                <p className="text-sm text-on-surface">{meal.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-on-surface-variant mb-3">No meals planned for today</p>
            <button onClick={() => openNewEntry("meal", todayStr)} className="text-sm text-primary font-medium hover:underline">
              + Add a meal plan
            </button>
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={fadeUp} className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-heading font-semibold text-on-surface">
            Recent Activity
          </p>
          <Link
            href="/app/expenses"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-1">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between bg-surface-container rounded-[8px] p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-[8px] bg-primary-fixed flex items-center justify-center">
                    <Receipt className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface capitalize">
                      {expense.category}
                    </p>
                    {expense.note && (
                      <p className="text-xs text-on-surface-variant truncate max-w-50">
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
                    {expense.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-on-surface-variant mb-3">
              No expenses recorded yet
            </p>
            <button
              onClick={() => openNewEntry("expense", todayStr)}
              className="text-sm text-primary font-medium hover:underline"
            >
              + Log your first expense
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
