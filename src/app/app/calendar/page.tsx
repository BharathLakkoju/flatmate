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
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarStore } from "@/stores/use-calendar-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { DayDetailPanel } from "@/components/calendar/DayDetailPanel";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { currentMonth, prevMonth, nextMonth } = useCalendarStore();
  const { selectedDate, setSelectedDate } = useCalendarStore();
  const getExpensesByDate = useExpenseStore((s) => s.getExpensesByDate);
  const getTotalByDate = useExpenseStore((s) => s.getTotalByDate);
  const getMealsByDate = useMealStore((s) => s.getMealsByDate);

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
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] uppercase tracking-wider text-on-surface-variant font-medium py-2"
            >
              {d}
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
              const dayTotal = getTotalByDate(dateStr);
              const dayMeals = getMealsByDate(dateStr);
              const firstMeal = dayMeals.length > 0 ? dayMeals[0] : null;

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.008, duration: 0.2 }}
                  className={`relative min-h-20 lg:min-h-25 rounded-[12px] p-2 text-left transition-colors group ${
                    !inMonth
                      ? "opacity-40"
                      : isSelected
                        ? "bg-primary-fixed ring-2 ring-primary/20"
                        : isCurrentDay
                          ? "bg-surface-container-lowest"
                          : "bg-surface-container hover:bg-surface-container-low"
                  }`}
                >
                  {/* Date number */}
                  <span
                    className={`text-xs font-medium ${
                      isCurrentDay
                        ? "bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center"
                        : "text-on-surface-variant group-hover:text-on-surface"
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Meal preview */}
                  {firstMeal && inMonth && (
                    <p className="text-[10px] text-on-surface-variant mt-1 truncate leading-tight">
                      {firstMeal.content}
                    </p>
                  )}

                  {/* Spend badge */}
                  {dayTotal > 0 && inMonth && (
                    <span className="absolute bottom-2 right-2 bg-on-surface text-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      ₹{dayTotal >= 1000 ? `${(dayTotal / 1000).toFixed(1)}k` : dayTotal}
                    </span>
                  )}

                  {/* Meal dot indicator */}
                  {dayMeals.length > 0 && inMonth && (
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
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
