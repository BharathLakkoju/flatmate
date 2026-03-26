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
  const { isNewEntryOpen, defaultTab, defaultDate, defaultMealType, editingEntry, closeNewEntry } =
    useModalStore();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const flat = useFlatStore((s) => s.flat);
  const members = useFlatStore((s) => s.members);
  const currentMember = useFlatStore((s) => s.currentMember);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);
  const removeExpense = useExpenseStore((s) => s.removeExpense);
  const addMeal = useMealStore((s) => s.addMeal);
  const updateMeal = useMealStore((s) => s.updateMeal);
  const removeMeal = useMealStore((s) => s.removeMeal);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const removeTask = useTaskStore((s) => s.removeTask);

  const isEditing = !!editingEntry;

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

      // Populate form fields when editing
      if (editingEntry) {
        if (editingEntry.type === "expense") {
          setAmount(String(editingEntry.data.amount_inr));
          setCategory(editingEntry.data.category);
          setPaidBy(editingEntry.data.paid_by);
          setDescription(editingEntry.data.note || "");
        } else if (editingEntry.type === "meal") {
          setMealType(editingEntry.data.meal_type);
          setMealContent(editingEntry.data.content);
        } else if (editingEntry.type === "task") {
          setTaskTitle(editingEntry.data.title);
          setTaskDescription(editingEntry.data.description || "");
          setTaskPriority(editingEntry.data.priority);
          setAssignedTo(editingEntry.data.assigned_to || "");
        }
      }
    }
  }, [isNewEntryOpen, defaultTab, defaultDate, defaultMealType, editingEntry]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleSave = async () => {
    const flatId = flat?.id;
    if (!flatId) return;

    setSaving(true);
    try {
      if (activeTab === "expense" && amount) {
        const payload = {
          date,
          category,
          amount_inr: parseFloat(amount),
          paid_by: paidBy || currentMember?.id || undefined,
          note: description || undefined,
        };

        if (isEditing && editingEntry?.type === "expense") {
          const res = await fetch(`/api/expenses/${editingEntry.data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const updated = await res.json();
            updateExpense(editingEntry.data.id, { ...updated, amount_inr: Number(updated.amount_inr) });
          }
        } else {
          const res = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flat_id: flatId, ...payload }),
          });
          if (res.ok) {
            const created = await res.json();
            addExpense({ ...created, amount_inr: Number(created.amount_inr) });
          }
        }
      } else if (activeTab === "meal" && mealContent) {
        const payload = {
          date,
          meal_type: mealType,
          content: mealContent,
        };

        if (isEditing && editingEntry?.type === "meal") {
          const res = await fetch(`/api/meals/${editingEntry.data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const updated = await res.json();
            updateMeal(editingEntry.data.id, updated);
          }
        } else {
          const res = await fetch("/api/meals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flat_id: flatId, ...payload }),
          });
          if (res.ok) {
            const created = await res.json();
            addMeal(created);
          }
        }
      } else if (activeTab === "task" && taskTitle) {
        const payload = {
          title: taskTitle,
          description: taskDescription || undefined,
          assigned_to: assignedTo || undefined,
          priority: taskPriority,
          due_date: date || undefined,
          status: isEditing && editingEntry?.type === "task" ? editingEntry.data.status : "pending",
        };

        if (isEditing && editingEntry?.type === "task") {
          const res = await fetch(`/api/tasks/${editingEntry.data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const updated = await res.json();
            updateTask(editingEntry.data.id, updated);
          }
        } else {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flat_id: flatId, ...payload }),
          });
          if (res.ok) {
            const created = await res.json();
            addTask(created);
          }
        }
      }

      resetForm();
      closeNewEntry();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !editingEntry) return;
    setDeleting(true);
    try {
      const typeMap = { expense: "expenses", meal: "meals", task: "tasks" } as const;
      const endpoint = `/api/${typeMap[editingEntry.type]}/${editingEntry.data.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        if (editingEntry.type === "expense") removeExpense(editingEntry.data.id);
        else if (editingEntry.type === "meal") removeMeal(editingEntry.data.id);
        else if (editingEntry.type === "task") removeTask(editingEntry.data.id);
        resetForm();
        closeNewEntry();
      }
    } finally {
      setDeleting(false);
    }
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
                      <SelectValue placeholder="Select">
                        {paidBy ? members.find((m) => m.id === paidBy)?.display_name : null}
                      </SelectValue>
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

              {/* Priority — inline button group avoids portal issues inside Drawer on mobile */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Priority
                </Label>
                <div className="flex gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setTaskPriority(p.value)}
                      className={`flex-1 h-9 rounded-[10px] text-xs font-medium transition-colors ${
                        taskPriority === p.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign To — scrollable chip list avoids portal issues inside Drawer on mobile */}
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Assign To
                </Label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAssignedTo("")}
                    className={`h-9 px-3 rounded-[10px] text-xs font-medium transition-colors ${
                      !assignedTo
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Unassigned
                  </button>
                  {members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAssignedTo(m.id)}
                      className={`h-9 px-3 rounded-[10px] text-xs font-medium transition-colors ${
                        assignedTo === m.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {m.display_name}
                    </button>
                  ))}
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
          {isEditing && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="rounded-[12px] h-11 px-4 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              closeNewEntry();
            }}
            className={`rounded-[12px] h-11 bg-surface-container-high text-on-surface ${isEditing ? "" : "flex-1"}`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || deleting}
            className="flex-1 rounded-[12px] h-11 bg-linear-to-r from-primary to-primary-dim text-primary-foreground"
          >
            {saving ? "Saving…" : isEditing ? "Update" : "Save Entry"}
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
              {isEditing ? "Edit Entry" : "New Entry"}
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              {isEditing ? "Update the record details" : "Add a new record to the household log"}
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
              {isEditing ? "Edit Entry" : "New Entry"}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-on-surface-variant">
              {isEditing ? "Update the record details" : "Add a new record to the household log"}
            </DrawerDescription>
          </DrawerHeader>
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
