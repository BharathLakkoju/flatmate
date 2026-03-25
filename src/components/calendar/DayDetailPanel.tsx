"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X, Receipt, UtensilsCrossed, Plus, CheckSquare } from "lucide-react";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useTaskStore } from "@/stores/use-task-store";
import { useModalStore } from "@/stores/use-modal-store";

interface DayDetailPanelProps {
  open: boolean;
  onClose: () => void;
  date: string;
}

export function DayDetailPanel({ open, onClose, date }: DayDetailPanelProps) {
  const getExpensesByDate = useExpenseStore((s) => s.getExpensesByDate);
  const getTotalByDate = useExpenseStore((s) => s.getTotalByDate);
  const getMealsByDate = useMealStore((s) => s.getMealsByDate);
  const tasks = useTaskStore((s) => s.tasks);
  const openNewEntry = useModalStore((s) => s.openNewEntry);

  const dayExpenses = getExpensesByDate(date);
  const dayTotal = getTotalByDate(date);
  const dayMeals = getMealsByDate(date);
  const dayTasks = tasks.filter((t) => t.due_date === date);

  const formattedDate = (() => {
    try {
      return format(parseISO(date), "EEEE, MMMM d, yyyy");
    } catch {
      return date;
    }
  })();

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-surface p-0 border-0 [&>button]:hidden"
      >
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <SheetHeader className="p-5 pb-4 border-b-0">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="font-heading text-lg font-bold text-on-surface">
                  {formattedDate}
                </SheetTitle>
                <p className="text-2xl font-heading font-bold text-primary mt-1">
                  ₹{dayTotal.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium mt-0.5">
                  total for the day
                </p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-[8px] bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Meal Plan Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-on-surface">Meal Plan</p>
                </div>
                <button
                  onClick={() => openNewEntry("meal", date)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {dayMeals.length > 0 ? (
                <AnimatePresence>
                  {dayMeals.map((meal, i) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface-container-lowest rounded-[12px] p-3.5"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium mb-1">
                        {meal.meal_type}
                      </p>
                      <p className="text-sm text-on-surface">{meal.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="bg-surface-container rounded-[12px] p-4 text-center">
                  <p className="text-sm text-on-surface-variant">No meals planned</p>
                </div>
              )}
            </section>

            {/* Expense Log Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-secondary" />
                  <p className="text-sm font-semibold text-on-surface">Expense Log</p>
                </div>
                <button
                  onClick={() => openNewEntry("expense", date)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {dayExpenses.length > 0 ? (
                <AnimatePresence>
                  {dayExpenses.map((expense, i) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface-container-lowest rounded-[12px] p-3.5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-[8px] bg-secondary-container flex items-center justify-center">
                          <Receipt className="h-3.5 w-3.5 text-on-secondary-container" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface capitalize">
                            {expense.category}
                          </p>
                          {expense.note && (
                            <p className="text-xs text-on-surface-variant">{expense.note}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-on-surface">
                        ₹{expense.amount_inr.toLocaleString("en-IN")}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="bg-surface-container rounded-[12px] p-4 text-center">
                  <p className="text-sm text-on-surface-variant">No expenses logged</p>
                </div>
              )}
            </section>

            {/* Tasks Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-tertiary" />
                  <p className="text-sm font-semibold text-on-surface">Tasks</p>
                </div>
                <button
                  onClick={() => openNewEntry("task", date)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {dayTasks.length > 0 ? (
                <AnimatePresence>
                  {dayTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-surface-container-lowest rounded-[12px] p-3.5 flex items-center gap-3"
                    >
                      <div
                        className={`h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 ${
                          task.status === "completed"
                            ? "bg-primary/10"
                            : "bg-tertiary-container"
                        }`}
                      >
                        <CheckSquare
                          className={`h-3.5 w-3.5 ${
                            task.status === "completed"
                              ? "text-primary"
                              : "text-on-tertiary-container"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium text-on-surface ${
                            task.status === "completed" ? "line-through opacity-60" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.assigned_member && (
                          <p className="text-xs text-on-surface-variant truncate">
                            {task.assigned_member.display_name}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${
                          task.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : task.priority === "high"
                            ? "bg-error/10 text-error"
                            : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {task.status === "completed" ? "done" : task.priority}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="bg-surface-container rounded-[12px] p-4 text-center">
                  <p className="text-sm text-on-surface-variant">No tasks due</p>
                </div>
              )}
            </section>
          </div>

          {/* Bottom Action */}
          <div className="p-5 pt-3">
            <button
              onClick={() => openNewEntry("expense", date)}
              className="w-full rounded-[12px] h-11 bg-linear-to-r from-primary to-primary-dim text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Add Entry
            </button>
          </div>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
