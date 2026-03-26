"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarStore } from "@/stores/use-calendar-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useTaskStore } from "@/stores/use-task-store";
import { DayDetailPanel } from "@/components/calendar/DayDetailPanel";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const weekDaysShort = ["S", "M", "T", "W", "T", "F", "S"];

const mealTypeOrder: Record<string, number> = { breakfast: 0, lunch: 1, dinner: 2, general: 3 };

const mealColors: Record<string, string> = {
  breakfast: "text-amber-700 bg-amber-50",
  lunch: "text-green-700 bg-green-50",
  dinner: "text-indigo-700 bg-indigo-50",
  general: "text-slate-600 bg-slate-50",
};

const expenseCategoryColors: Record<string, string> = {
  groceries: "text-emerald-700 bg-emerald-50",
  meals: "text-orange-700 bg-orange-50",
  utilities: "text-violet-700 bg-violet-50",
  outings: "text-pink-700 bg-pink-50",
  household: "text-cyan-700 bg-cyan-50",
  other: "text-slate-600 bg-slate-50",
};
const mealDotColors: Record<string, string> = {
  breakfast: "bg-amber-500",
  lunch: "bg-green-500",
  dinner: "bg-indigo-500",
  general: "bg-slate-400",
};

const expenseDotColors: Record<string, string> = {
  groceries: "bg-emerald-500",
  meals: "bg-orange-500",
  utilities: "bg-violet-500",
  outings: "bg-pink-500",
  household: "bg-cyan-500",
  other: "bg-slate-400",
};

export default function CalendarPage() {
  const { currentMonth, prevMonth, nextMonth } = useCalendarStore();
  const { selectedDate, setSelectedDate } = useCalendarStore();
  const expenses = useExpenseStore((s) => s.expenses);
  const meals = useMealStore((s) => s.meals);
  const tasks = useTaskStore((s) => s.tasks);

  const [panelOpen, setPanelOpen] = useState(false);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = gridStart;
    while (day <= gridEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(format(day, "yyyy-MM-dd"));
    setPanelOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            {format(currentMonth, "MMMM yyyy")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Household calendar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="h-9 w-9 rounded-[8px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              useCalendarStore.setState({
                currentMonth: new Date(),
                selectedDate: format(new Date(), "yyyy-MM-dd"),
              });
            }}
            className="px-3 py-1.5 text-sm font-medium text-primary bg-primary-fixed rounded-[8px] hover:opacity-80 transition-opacity"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="h-9 w-9 rounded-[8px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d, i) => (
            <div
              key={d}
              className="text-center text-[10px] uppercase tracking-wider text-on-surface-variant font-medium py-2"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{weekDaysShort[i]}</span>
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentMonth, "yyyy-MM")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-7 gap-1"
          >
            {calendarDays.map((day, idx) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const inMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate === dateStr && panelOpen;
              const isCurrentDay = isToday(day);
              const dayExpenses = expenses.filter((e) => e.date === dateStr);
              const dayMeals = [...meals.filter((m) => m.date === dateStr)]
                .sort((a, b) => (mealTypeOrder[a.meal_type] ?? 9) - (mealTypeOrder[b.meal_type] ?? 9));
              const dayTasks = tasks.filter((t) => t.due_date === dateStr && t.status !== "completed");

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.008, duration: 0.2 }}
                  className={`relative min-h-16 sm:min-h-24 lg:min-h-28 rounded-[8px] p-1 sm:p-1.5 text-left transition-colors group overflow-hidden border flex flex-col ${
                    !inMonth
                      ? "opacity-30 border-transparent"
                      : isSelected
                        ? "bg-primary-fixed/40 border-primary/30"
                        : isCurrentDay
                          ? "bg-primary-fixed/20 border-primary/20"
                          : "bg-surface-container-lowest border-surface-container-high/50 hover:bg-surface-container-low"
                  }`}
                >
                  {/* Date number - top right */}
                  <div className="flex justify-end">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrentDay
                          ? "bg-primary text-primary-foreground h-5 w-5 rounded-full inline-flex items-center justify-center text-[11px]"
                          : "text-on-surface-variant group-hover:text-on-surface"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Rich content area */}
                  {inMonth && (
                    <>
                      {/* Desktop: text chips (sm+) */}
                      <div className="hidden sm:block space-y-0.5 overflow-hidden">
                        {/* Expense entries */}
                        {dayExpenses.slice(0, 2).map((expense) => (
                          <div
                            key={expense.id}
                            className={`flex items-center gap-0.5 rounded-[4px] px-1 py-0.5 text-[10px] font-medium leading-tight truncate ${expenseCategoryColors[expense.category] || "text-slate-600 bg-slate-50"}`}
                          >
                            <span className="shrink-0">₹{Number(expense.amount_inr) >= 1000 ? `${(Number(expense.amount_inr) / 1000).toFixed(1)}k` : Number(expense.amount_inr)}</span>
                            <span className="truncate capitalize">{expense.category}</span>
                          </div>
                        ))}

                        {/* Meal entries */}
                        {dayMeals.slice(0, 2).map((meal) => (
                          <div
                            key={meal.id}
                            className={`flex items-center gap-0.5 rounded-[4px] px-1 py-0.5 text-[10px] leading-tight truncate ${mealColors[meal.meal_type] || "text-slate-600 bg-slate-50"}`}
                          >
                            <span className="opacity-60 shrink-0">●</span>
                            <span className="truncate capitalize">{meal.meal_type}: {meal.content}</span>
                          </div>
                        ))}

                        {/* Task indicator */}
                        {dayTasks.length > 0 && (dayExpenses.length + dayMeals.length) < 3 && (
                          <div className="flex items-center gap-0.5 rounded-[4px] px-1 py-0.5 text-[10px] leading-tight text-tertiary bg-tertiary/10 truncate">
                            <span className="opacity-60 shrink-0">✓</span>
                            <span className="truncate">{dayTasks.length} task{dayTasks.length > 1 ? "s" : ""}</span>
                          </div>
                        )}

                        {/* Overflow indicator */}
                        {(dayExpenses.length + dayMeals.length + (dayTasks.length > 0 ? 1 : 0)) > 4 && (
                          <p className="text-[9px] text-on-surface-variant/60 px-1">
                            +{dayExpenses.length + dayMeals.length + dayTasks.length - 4} more
                          </p>
                        )}
                      </div>

                      {/* Mobile: colored dots */}
                      <div className="sm:hidden mt-auto flex flex-wrap gap-[3px] pt-1">
                        {dayExpenses.slice(0, 3).map((expense) => (
                          <span
                            key={expense.id}
                            className={`h-1.5 w-1.5 rounded-full ${expenseDotColors[expense.category] || "bg-slate-400"}`}
                          />
                        ))}
                        {dayMeals.slice(0, 2).map((meal) => (
                          <span
                            key={meal.id}
                            className={`h-1.5 w-1.5 rounded-full ${mealDotColors[meal.meal_type] || "bg-slate-400"}`}
                          />
                        ))}
                        {dayTasks.length > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                        )}
                      </div>
                    </>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Day Detail Panel */}
      <DayDetailPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        date={selectedDate}
      />
    </div>
  );
}
