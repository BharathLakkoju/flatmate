"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowRight,
  TrendingUp,
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
import { HarmonyMeter } from "@/components/shared/HarmonyMeter";
import { supabase } from "@/lib/supabase/client";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function HomePage() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(
          user?.identities?.[0]?.identity_data?.display_name
        );
      }
    });
  }, []);

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const greeting =
    today.getHours() < 12
      ? "Good Morning"
      : today.getHours() < 17
        ? "Good Afternoon"
        : "Good Evening";

  const getMonthlyTotal = useExpenseStore((s) => s.getMonthlyTotal);
  const getTotalByDate = useExpenseStore((s) => s.getTotalByDate);
  const expenses = useExpenseStore((s) => s.expenses);
  const getMealsByDate = useMealStore((s) => s.getMealsByDate);
  const getDueTodayTasks = useTaskStore((s) => s.getDueTodayTasks);
  const openNewEntry = useModalStore((s) => s.openNewEntry);

  const monthlyTotal = getMonthlyTotal(today.getFullYear(), today.getMonth());
  const todayTotal = getTotalByDate(todayStr);
  const todayMeals = getMealsByDate(todayStr);
  const dueTasks = getDueTodayTasks();

  // Recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const budgetCap = 15000;
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
        <p className="font-heading text-3xl font-bold text-on-surface">
          {greeting}{userName ? `, ${userName}` : ""} 👋
        </p>
        <p className="text-on-surface-variant mt-1">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* Summary Cards Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly Budget */}
        <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Monthly Budget
            </p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-heading font-bold text-on-surface">
            ₹{monthlyTotal.toLocaleString("en-IN")}
          </p>
          <HarmonyMeter
            value={budgetPercent}
            label=""
            statusText={`of ₹${budgetCap.toLocaleString("en-IN")} cap`}
          />
        </div>

        {/* Today's Spend */}
        <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Today&apos;s Spend
            </p>
            <Receipt className="h-4 w-4 text-secondary" />
          </div>
          <p className="text-2xl font-heading font-bold text-on-surface">
            ₹{todayTotal.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-on-surface-variant">
            {recentExpenses.length > 0
              ? `${recentExpenses.length} entries this month`
              : "No entries yet"}
          </p>
        </div>

        {/* Due Tasks */}
        <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
              Due Today
            </p>
            <ClipboardList className="h-4 w-4 text-tertiary" />
          </div>
          <p className="text-2xl font-heading font-bold text-on-surface">
            {dueTasks.length}
          </p>
          <p className="text-xs text-on-surface-variant">
            {dueTasks.length === 0
              ? "All clear! Nothing pending"
              : `${dueTasks.length} task${dueTasks.length > 1 ? "s" : ""} need attention`}
          </p>
        </div>
      </motion.div>

      {/* Meal Spotlight + Quick Add */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Meals */}
        <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              <p className="font-heading font-semibold text-on-surface">
                Today&apos;s Meals
              </p>
            </div>
            <Link
              href="/app/meals"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {todayMeals.length > 0 ? (
            <div className="space-y-2">
              {todayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="flex items-start gap-3 bg-surface-container rounded-[8px] p-3"
                >
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium w-16 shrink-0 pt-0.5">
                    {meal.meal_type}
                  </span>
                  <p className="text-sm text-on-surface">{meal.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-on-surface-variant mb-3">
                No meals planned for today
              </p>
              <button
                onClick={() => openNewEntry("meal", todayStr)}
                className="text-sm text-primary font-medium hover:underline"
              >
                + Add a meal plan
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
          <p className="font-heading font-semibold text-on-surface">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Log Expense",
                icon: Receipt,
                tab: "expense" as const,
                color: "bg-primary-fixed text-primary",
              },
              {
                label: "Add Meal",
                icon: UtensilsCrossed,
                tab: "meal" as const,
                color: "bg-secondary-container text-on-secondary-container",
              },
              {
                label: "Create Task",
                icon: ClipboardList,
                tab: "task" as const,
                color: "bg-tertiary-container text-on-tertiary-container",
              },
              {
                label: "Monthly Summary",
                icon: TrendingDown,
                tab: undefined,
                color: "bg-surface-container-high text-on-surface",
                href: "/app/expenses",
              },
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
                className={`flex items-center gap-2.5 rounded-[12px] p-3.5 text-left transition-colors hover:opacity-80 ${action.color}`}
              >
                <action.icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
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
