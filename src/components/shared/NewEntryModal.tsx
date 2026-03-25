"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalStore } from "@/stores/use-modal-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useTaskStore } from "@/stores/use-task-store";
import { useFlatStore } from "@/stores/use-flat-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Receipt, UtensilsCrossed, ClipboardList, CalendarIcon } from "lucide-react";
import { HarmonyMeter } from "@/components/shared/HarmonyMeter";

type TabType = "expense" | "meal" | "task" | "event";

const entryTabs = [
  { id: "expense" as const, label: "Expense", icon: Receipt },
  { id: "meal" as const, label: "Meal", icon: UtensilsCrossed },
  { id: "task" as const, label: "Task", icon: ClipboardList },
  { id: "event" as const, label: "Event", icon: CalendarIcon },
];

const categories = [
  { value: "groceries", label: "Groceries" },
  { value: "meals", label: "Meals/Food" },
  { value: "utilities", label: "Utilities" },
  { value: "outings", label: "Outings" },
  { value: "household", label: "Household" },
  { value: "other", label: "Other" },
];

const mealTypes = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "general", label: "General" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function NewEntryModal() {
  const { isNewEntryOpen, defaultTab, defaultDate, defaultMealType, closeNewEntry } =
    useModalStore();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const members = useFlatStore((s) => s.members);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const addMeal = useMealStore((s) => s.addMeal);
  const addTask = useTaskStore((s) => s.addTask);

  // Form states
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("groceries");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState(defaultMealType || "lunch");
  const [mealContent, setMealContent] = useState("");

  // Sync form state with store defaults when modal opens
  useEffect(() => {
    if (isNewEntryOpen) {
      setActiveTab(defaultTab);
      setDate(defaultDate);
      if (defaultMealType) setMealType(defaultMealType);
    }
  }, [isNewEntryOpen, defaultTab, defaultDate, defaultMealType]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");

  const resetForm = () => {
    setAmount("");
    setCategory("groceries");
    setPaidBy("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setMealType("lunch");
    setMealContent("");
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("normal");
    setAssignedTo("");
  };

  const handleSave = () => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    if (activeTab === "expense" && amount) {
      addExpense({
        id,
        flat_id: "",
        date,
        category: category as "groceries" | "meals" | "utilities" | "outings" | "household" | "other",
        amount_inr: parseFloat(amount),
        paid_by: paidBy || "unknown",
        note: description || null,
        created_at: now,
        updated_at: now,
      });
    } else if (activeTab === "meal" && mealContent) {
      addMeal({
        id,
        flat_id: "",
        date,
        meal_type: mealType as "breakfast" | "lunch" | "dinner" | "general",
        content: mealContent,
        created_at: now,
        updated_at: now,
      });
    } else if (activeTab === "task" && taskTitle) {
      addTask({
        id,
        flat_id: "",
        title: taskTitle,
        description: taskDescription || null,
        assigned_to: assignedTo || null,
        status: "pending",
        priority: taskPriority as "low" | "normal" | "high" | "urgent",
        category: null,
        due_date: date,
        completed_at: null,
        created_at: now,
        updated_at: now,
      });
    }

    resetForm();
    closeNewEntry();
  };

  const isDesktop = useMediaQuery("(min-width: 640px)");

  const formContent = (
    <>
      {/* Entry Type Tabs */}
      <div className="px-6 pb-4">
        <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium mb-2">
          Entry Type
        </p>
        <div className="flex gap-2">
          {entryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary-fixed text-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 pb-6 space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === "expense" && (
            <motion.div
              key="expense"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="bg-surface-container rounded-[12px] p-4">
                <Label className="text-xs text-on-surface-variant">Amount</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-on-surface-variant text-lg">₹</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-2xl font-heading font-bold text-on-surface h-auto p-0 border-0 focus-visible:ring-0 placeholder:text-on-surface-variant/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                    Category
                  </Label>
                  <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                    <SelectTrigger className="rounded-[12px] bg-surface-container-high h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                    Paid By
                  </Label>
                  <Select value={paidBy} onValueChange={(v) => v && setPaidBy(v)}>
                    <SelectTrigger className="rounded-[12px] bg-surface-container-high h-10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.display_name}
                        </SelectItem>
                      ))}
                      {members.length === 0 && (
                        <SelectItem value="self" disabled>No members yet</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-[12px] bg-surface-container-high h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Description
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this for? (Optional)"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none"
                />
              </div>

              {amount && (
                <div className="pt-2">
                  <HarmonyMeter
                    value={Math.min(100, (parseFloat(amount) / 500) * 100)}
                    label="Impact on Balance"
                    statusText={`+₹${amount || "0"} pending`}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "meal" && (
            <motion.div
              key="meal"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Meal Type
                </Label>
                <Select value={mealType} onValueChange={(v) => v && setMealType(v)}>
                  <SelectTrigger className="rounded-[12px] bg-surface-container-high h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-[12px] bg-surface-container-high h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  What&apos;s on the menu?
                </Label>
                <Textarea
                  value={mealContent}
                  onChange={(e) => setMealContent(e.target.value)}
                  placeholder="e.g. Quinoa & Roasted Veggie Bowl"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "task" && (
            <motion.div
              key="task"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Task Title
                </Label>
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Deep Clean Kitchen"
                  className="rounded-[12px] bg-surface-container-high h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                    Priority
                  </Label>
                  <Select value={taskPriority} onValueChange={(v) => v && setTaskPriority(v)}>
                    <SelectTrigger className="rounded-[12px] bg-surface-container-high h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                    Assign To
                  </Label>
                  <Select value={assignedTo} onValueChange={(v) => v && setAssignedTo(v)}>
                    <SelectTrigger className="rounded-[12px] bg-surface-container-high h-10">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Due Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-[12px] bg-surface-container-high h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Description
                </Label>
                <Textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Additional details (optional)"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "event" && (
            <motion.div
              key="event"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Event Title
                </Label>
                <Input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Movie Night"
                  className="rounded-[12px] bg-surface-container-high h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-[12px] bg-surface-container-high h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Description
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's the plan? (Optional)"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              closeNewEntry();
            }}
            className="flex-1 rounded-[12px] h-11 bg-surface-container-high text-on-surface"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 rounded-[12px] h-11 bg-linear-to-r from-primary to-primary-dim text-primary-foreground"
          >
            Save Entry
          </Button>
        </div>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog open={isNewEntryOpen} onOpenChange={(open) => !open && closeNewEntry()}>
        <DialogContent className="bg-surface-container-lowest rounded-[16px] w-full max-w-lg mx-auto p-0 gap-0 border-0 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-heading text-xl font-bold text-on-surface">
              New Entry
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              Add a new record to the household log
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isNewEntryOpen} onOpenChange={(open) => !open && closeNewEntry()}>
      <DrawerContent className="bg-surface-container-lowest">
        <div className="overflow-y-auto max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="font-heading text-xl font-bold text-on-surface">
              New Entry
            </DrawerTitle>
            <DrawerDescription className="text-sm text-on-surface-variant">
              Add a new record to the household log
            </DrawerDescription>
          </DrawerHeader>
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
