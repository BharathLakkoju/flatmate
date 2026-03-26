"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, UtensilsCrossed, Plus } from "lucide-react";
import { useCalendarStore } from "@/stores/use-calendar-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useModalStore } from "@/stores/use-modal-store";
import { useAppStore } from "@/stores/use-app-store";
import { MealsPageSkeleton } from "@/components/shared/Skeletons";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const mealSlots = ["breakfast", "lunch", "dinner"] as const;
const mealEmoji: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
};

export default function MealsPage() {
  const isAppReady = useAppStore((s) => s.isAppReady);
  const { currentMonth, prevMonth, nextMonth, selectedDate, setSelectedDate } =
    useCalendarStore();
  const meals = useMealStore((s) => s.meals);
  const openNewEntry = useModalStore((s) => s.openNewEntry);
  const openEditEntry = useModalStore((s) => s.openEditEntry);

  const getMealsByDate = (date: string) => meals.filter((m) => m.date === date);

  // Current week starting from Sunday
  const selectedDt = new Date(selectedDate);
  const weekStart = startOfWeek(selectedDt);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [weekStart.toISOString()],
  );

  const goToPrevWeek = () => {
    setSelectedDate(format(addDays(weekStart, -7), "yyyy-MM-dd"));
  };
  const goToNextWeek = () => {
    setSelectedDate(format(addDays(weekStart, 7), "yyyy-MM-dd"));
  };

  if (!isAppReady) return <MealsPageSkeleton />;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Meal Planner
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {format(weekDays[0], "MMM d")} –{" "}
            {format(weekDays[6], "MMM d, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="h-9 w-9 rounded-[8px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedDate(format(new Date(), "yyyy-MM-dd"))}
            className="px-3 py-1.5 text-sm font-medium text-primary bg-primary-fixed rounded-[8px] hover:opacity-80 transition-opacity"
          >
            This Week
          </button>
          <button
            onClick={goToNextWeek}
            className="h-9 w-9 rounded-[8px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Week Grid */}
      <motion.div variants={fadeUp}>
        {/* Desktop: horizontal grid — today gets 2 columns */}
        <div className="hidden lg:grid grid-cols-8 gap-3">
          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const meals = getMealsByDate(dateStr);
            const current = isToday(day);

            if (current) {
              return (
                <div
                  key={dateStr}
                  className="col-span-2 rounded-[16px] p-4 space-y-3 min-h-70 bg-surface-container-lowest ring-2 ring-primary/20 shadow-[0_4px_24px_rgba(48,51,46,0.08)]"
                >
                  {/* Date header */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[10px] bg-primary flex items-center justify-center">
                      <p className="text-base font-heading font-bold text-primary-foreground">
                        {format(day, "d")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-heading font-bold text-on-surface">
                        {format(day, "EEEE")}
                      </p>
                      <p className="text-[10px] text-primary font-medium">
                        Today&apos;s Plan
                      </p>
                    </div>
                  </div>

                  {/* Meal slots — spacious */}
                  <div className="space-y-2">
                    {mealSlots.map((slot) => {
                      const meal = meals.find((m) => m.meal_type === slot);
                      return (
                        <div key={slot}>
                          {meal ? (
                            <div
                              onClick={() =>
                                openEditEntry({ type: "meal", data: meal })
                              }
                              className="bg-surface-container rounded-[10px] p-3 flex items-start gap-2.5 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
                            >
                              <span className="text-lg mt-0.5">
                                {mealEmoji[slot]}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">
                                  {slot}
                                </p>
                                <p className="text-sm text-on-surface mt-0.5 font-medium">
                                  {meal.content}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                openNewEntry("meal", dateStr, slot)
                              }
                              className="w-full bg-surface-container/50 rounded-[10px] p-3 flex items-center gap-2.5 hover:bg-surface-container transition-colors group"
                            >
                              <span className="text-lg opacity-40 group-hover:opacity-70">
                                {mealEmoji[slot]}
                              </span>
                              <div className="text-left">
                                <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/50 group-hover:text-on-surface-variant font-medium">
                                  {slot}
                                </p>
                                <p className="text-[10px] text-on-surface-variant/40 group-hover:text-on-surface-variant mt-0.5">
                                  Click to add
                                </p>
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => openNewEntry("meal", dateStr)}
                    className="w-full text-center flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add meal
                  </button>
                </div>
              );
            }

            return (
              <div
                key={dateStr}
                className="rounded-[12px] p-3 space-y-3 min-h-70 bg-surface-container"
              >
                {/* Date header */}
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                    {format(day, "EEE")}
                  </p>
                  <p className="text-lg font-heading font-bold mt-0.5 text-on-surface">
                    {format(day, "d")}
                  </p>
                </div>

                {/* Meal slots */}
                <div className="space-y-2">
                  {mealSlots.map((slot) => {
                    const meal = meals.find((m) => m.meal_type === slot);
                    return (
                      <div key={slot}>
                        {meal ? (
                          <div
                            onClick={() =>
                              openEditEntry({ type: "meal", data: meal })
                            }
                            className="bg-surface-container-lowest rounded-[8px] p-2.5 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant">
                              {mealEmoji[slot]} {slot}
                            </p>
                            <p className="text-xs text-on-surface mt-0.5 line-clamp-2">
                              {meal.content}
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={() => openNewEntry("meal", dateStr, slot)}
                            className="w-full bg-surface-container-high/50 rounded-[8px] p-2 text-center hover:bg-surface-container-high transition-colors group"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/50 group-hover:text-on-surface-variant">
                              {mealEmoji[slot]} {slot}
                            </p>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add button */}
                <button
                  onClick={() => openNewEntry("meal", dateStr)}
                  className="w-full text-center flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical list — today's card is prominent */}
        <div className="lg:hidden space-y-3 mb-20">
          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const meals = getMealsByDate(dateStr);
            const current = isToday(day);

            if (current) {
              return (
                <div
                  key={dateStr}
                  className="rounded-[16px] p-5 bg-surface-container-lowest ring-2 ring-primary/20 shadow-[0_4px_24px_rgba(48,51,46,0.08)]"
                >
                  {/* Today header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-[12px] bg-primary flex items-center justify-center">
                        <p className="text-lg font-heading font-bold text-primary-foreground">
                          {format(day, "d")}
                        </p>
                      </div>
                      <div>
                        <p className="text-base font-heading font-bold text-on-surface">
                          {format(day, "EEEE")}
                        </p>
                        <p className="text-xs text-primary font-medium">
                          Today&apos;s Plan
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openNewEntry("meal", dateStr)}
                      className="h-9 w-9 rounded-[10px] bg-primary/10 flex items-center justify-center text-primary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Today's meal slots — vertical and spacious */}
                  <div className="space-y-2.5">
                    {mealSlots.map((slot) => {
                      const meal = meals.find((m) => m.meal_type === slot);
                      return (
                        <div key={slot}>
                          {meal ? (
                            <div
                              onClick={() =>
                                openEditEntry({ type: "meal", data: meal })
                              }
                              className="bg-surface-container rounded-[12px] p-4 flex items-start gap-3 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
                            >
                              <span className="text-xl mt-0.5">
                                {mealEmoji[slot]}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                                  {slot}
                                </p>
                                <p className="text-sm text-on-surface mt-0.5 font-medium">
                                  {meal.content}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                openNewEntry("meal", dateStr, slot)
                              }
                              className="w-full bg-surface-container/50 rounded-[12px] p-4 flex items-center gap-3 hover:bg-surface-container transition-colors group"
                            >
                              <span className="text-xl opacity-40 group-hover:opacity-70">
                                {mealEmoji[slot]}
                              </span>
                              <div className="text-left">
                                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/50 group-hover:text-on-surface-variant font-medium">
                                  {slot}
                                </p>
                                <p className="text-xs text-on-surface-variant/40 group-hover:text-on-surface-variant mt-0.5">
                                  Tap to add
                                </p>
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={dateStr}
                className="rounded-[12px] p-3 bg-surface-container"
              >
                {/* Compact day header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-heading font-bold text-on-surface">
                      {format(day, "d")}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {format(day, "EEE")}
                    </p>
                  </div>
                  <button
                    onClick={() => openNewEntry("meal", dateStr)}
                    className="h-6 w-6 rounded-[6px] bg-primary/10 flex items-center justify-center text-primary"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Compact meal slots */}
                <div className="grid grid-cols-3 gap-1.5">
                  {mealSlots.map((slot) => {
                    const meal = meals.find((m) => m.meal_type === slot);
                    return (
                      <div key={slot}>
                        {meal ? (
                          <div
                            onClick={() =>
                              openEditEntry({ type: "meal", data: meal })
                            }
                            className="bg-surface-container-lowest rounded-[8px] p-2 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant">
                              {mealEmoji[slot]} {slot}
                            </p>
                            <p className="text-[11px] text-on-surface mt-0.5 line-clamp-1">
                              {meal.content}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-surface-container-high/40 rounded-[8px] p-2 text-center">
                            <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/30">
                              {mealEmoji[slot]} {slot}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
