"use client";

import { useState, useEffect, useRef } from "react";
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
import { useModalStore } from "@/stores/use-modal-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useTaskStore } from "@/stores/use-task-store";
import { useFlatStore } from "@/stores/use-flat-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Receipt,
  UtensilsCrossed,
  ClipboardList,
  CalendarIcon,
  ShoppingCart,
  Camera,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { HarmonyMeter } from "@/components/shared/HarmonyMeter";
import { useGroceryStore } from "@/stores/use-grocery-store";
import {
  PlatformLogo,
  PLATFORM_CONFIG,
} from "@/components/groceries/PlatformLogo";
import type { OCRParsedItem, GroceryPlatform } from "@/types";

type TabType = "expense" | "meal" | "task" | "event" | "grocery";

const GROCERY_PLATFORMS: GroceryPlatform[] = [
  "swiggy",
  "zepto",
  "blinkit",
  "dunzo",
  "bigbasket",
  "jiomart",
  "dmart",
  "other",
];

const entryTabs = [
  { id: "expense" as const, label: "Expense", icon: Receipt },
  { id: "meal" as const, label: "Meal", icon: UtensilsCrossed },
  { id: "task" as const, label: "Task", icon: ClipboardList },
  { id: "event" as const, label: "Event", icon: CalendarIcon },
  { id: "grocery" as const, label: "Grocery", icon: ShoppingCart },
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

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 200) + "px";
}

function scrollIntoViewAfterKeyboard(el: HTMLElement) {
  setTimeout(
    () => el.scrollIntoView({ behavior: "smooth", block: "center" }),
    320,
  );
}

export function NewEntryModal() {
  const {
    isNewEntryOpen,
    defaultTab,
    defaultDate,
    defaultMealType,
    editingEntry,
    closeNewEntry,
  } = useModalStore();
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
  const addGroceryItem = useGroceryStore((s) => s.addItem);
  const addGroceryItems = useGroceryStore((s) => s.addItems);
  const addGroceryOrder = useGroceryStore((s) => s.addOrder);

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

  // Grocery tab state
  const [grocerySubType, setGrocerySubType] = useState<"order" | "item">(
    "order",
  );
  const [groceryOrderItems, setGroceryOrderItems] = useState<OCRParsedItem[]>([
    {
      name: "",
      quantity: 1,
      unit_label: "pieces",
      unit_type: "pieces",
      price_inr: null,
    },
  ]);
  const [groceryPlatform, setGroceryPlatform] =
    useState<GroceryPlatform>("other");
  const [groceryPlatformLabel, setGroceryPlatformLabel] = useState("");
  const [groceryOcrStatus, setGroceryOcrStatus] = useState<"idle" | "loading">(
    "idle",
  );
  const [groceryItemName, setGroceryItemName] = useState("");
  const [groceryItemUnitType, setGroceryItemUnitType] = useState<
    "pieces" | "percentage"
  >("pieces");
  const [groceryItemUnitLabel, setGroceryItemUnitLabel] = useState("pcs");
  const [groceryItemQty, setGroceryItemQty] = useState("1");
  const [groceryItemPrice, setGroceryItemPrice] = useState("");
  const groceryFileRef = useRef<HTMLInputElement>(null);

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
    setGrocerySubType("order");
    setGroceryOrderItems([
      {
        name: "",
        quantity: 1,
        unit_label: "pieces",
        unit_type: "pieces",
        price_inr: null,
      },
    ]);
    setGroceryPlatform("other");
    setGroceryPlatformLabel("");
    setGroceryOcrStatus("idle");
    setGroceryItemName("");
    setGroceryItemUnitType("pieces");
    setGroceryItemUnitLabel("pcs");
    setGroceryItemQty("1");
    setGroceryItemPrice("");
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
            updateExpense(editingEntry.data.id, {
              ...updated,
              amount_inr: Number(updated.amount_inr),
            });
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
          status:
            isEditing && editingEntry?.type === "task"
              ? editingEntry.data.status
              : "pending",
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
      } else if (activeTab === "grocery") {
        if (grocerySubType === "order") {
          const validItems = groceryOrderItems.filter(
            (i) => i.name.trim().length > 0,
          );
          if (validItems.length === 0) return;
          const total = validItems.reduce(
            (sum, i) => sum + (i.price_inr ?? 0),
            0,
          );
          const res = await fetch("/api/groceries/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flat_id: flatId,
              platform: groceryPlatform,
              platform_label:
                groceryPlatform === "other" && groceryPlatformLabel.trim()
                  ? groceryPlatformLabel.trim()
                  : null,
              total_amount_inr: total > 0 ? total : 0.01,
              order_date: date,
              paid_by: paidBy || currentMember?.id,
              items: validItems.map((item) => ({
                name: item.name.trim(),
                unit_type: item.unit_type,
                unit_label: item.unit_label,
                total_quantity: item.quantity,
                price_inr: item.price_inr ?? null,
              })),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            addGroceryOrder(data.order);
            addGroceryItems(data.items);
            if (data.expense)
              addExpense({
                ...data.expense,
                amount_inr: Number(data.expense.amount_inr),
              });
          }
        } else if (grocerySubType === "item" && groceryItemName.trim()) {
          const qty = parseFloat(groceryItemQty) || 1;
          const res = await fetch("/api/groceries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              flat_id: flatId,
              name: groceryItemName.trim(),
              unit_type: groceryItemUnitType,
              unit_label: groceryItemUnitLabel || "pcs",
              total_quantity: qty,
              remaining_quantity: qty,
              price_inr: groceryItemPrice ? parseFloat(groceryItemPrice) : null,
              purchase_date: date,
            }),
          });
          if (res.ok) {
            const created = await res.json();
            addGroceryItem(created);
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
      const typeMap = {
        expense: "expenses",
        meal: "meals",
        task: "tasks",
      } as const;
      const endpoint = `/api/${typeMap[editingEntry.type]}/${editingEntry.data.id}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        if (editingEntry.type === "expense")
          removeExpense(editingEntry.data.id);
        else if (editingEntry.type === "meal") removeMeal(editingEntry.data.id);
        else if (editingEntry.type === "task") removeTask(editingEntry.data.id);
        resetForm();
        closeNewEntry();
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleGroceryOcr = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGroceryOcrStatus("loading");
    try {
      const toBase64 = (f: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
      const base64 = await toBase64(file);
      const res = await fetch("/api/groceries/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_data: base64,
          mime_type: file.type || "image/jpeg",
        }),
      });
      if (res.ok) {
        const { items } = await res.json();
        setGroceryOrderItems(items.length > 0 ? items : groceryOrderItems);
      }
    } catch {
      // ignore, user can fill manually
    } finally {
      setGroceryOcrStatus("idle");
      if (groceryFileRef.current) groceryFileRef.current.value = "";
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
        <div className="flex flex-wrap gap-2">
          {entryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all duration-100 touch-manipulation active:scale-[0.97] shrink-0 ${
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
                <Label className="text-xs text-on-surface-variant">
                  Amount
                </Label>
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

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Category
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`h-9 px-3 rounded-[10px] text-xs font-medium transition-all duration-100 touch-manipulation active:scale-[0.97] ${
                        category === c.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                  Paid By
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaidBy(m.id)}
                      className={`h-9 px-3 rounded-[10px] text-xs font-medium transition-all duration-100 touch-manipulation active:scale-[0.97] ${
                        paidBy === m.id
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
                  onInput={(e) => autoResize(e.currentTarget)}
                  onFocus={(e) => scrollIntoViewAfterKeyboard(e.currentTarget)}
                  placeholder="What was this for? (Optional)"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none overflow-hidden"
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
                <div className="flex gap-2">
                  {mealTypes.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMealType(m.value)}
                      className={`flex-1 h-9 rounded-[10px] text-xs font-medium transition-all duration-100 touch-manipulation active:scale-[0.97] ${
                        mealType === m.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
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
                  What&apos;s on the menu?
                </Label>
                <Textarea
                  value={mealContent}
                  onChange={(e) => setMealContent(e.target.value)}
                  onInput={(e) => autoResize(e.currentTarget)}
                  onFocus={(e) => scrollIntoViewAfterKeyboard(e.currentTarget)}
                  placeholder="e.g. Quinoa & Roasted Veggie Bowl"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none overflow-hidden"
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
                      className={`flex-1 h-9 rounded-[10px] text-xs font-medium transition-all duration-100 touch-manipulation active:scale-[0.97] ${
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
                    className={`h-9 px-3 rounded-[10px] text-xs font-medium transition-all duration-100 touch-manipulation active:scale-[0.97] ${
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
                      className={`h-9 px-3 rounded-[10px] text-xs font-medium transition-all duration-100 touch-manipulation active:scale-[0.97] ${
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
                  onInput={(e) => autoResize(e.currentTarget)}
                  onFocus={(e) => scrollIntoViewAfterKeyboard(e.currentTarget)}
                  placeholder="Additional details (optional)"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none overflow-hidden"
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
                  onInput={(e) => autoResize(e.currentTarget)}
                  onFocus={(e) => scrollIntoViewAfterKeyboard(e.currentTarget)}
                  placeholder="What's the plan? (Optional)"
                  className="rounded-[12px] bg-surface-container-high min-h-20 resize-none overflow-hidden"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "grocery" && (
            <motion.div
              key="grocery"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {/* Sub-type toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGrocerySubType("order")}
                  className={`flex-1 h-9 rounded-[10px] text-xs font-medium transition-all duration-100 ${grocerySubType === "order" ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"}`}
                >
                  Log Order
                </button>
                <button
                  type="button"
                  onClick={() => setGrocerySubType("item")}
                  className={`flex-1 h-9 rounded-[10px] text-xs font-medium transition-all duration-100 ${grocerySubType === "item" ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"}`}
                >
                  Add Item
                </button>
              </div>

              {grocerySubType === "order" && (
                <>
                  {/* Platform grid */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                      Platform
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {GROCERY_PLATFORMS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setGroceryPlatform(p)}
                          className={`flex flex-col items-center gap-1 py-2 px-1 rounded-[10px] border transition-all text-[10px] font-medium ${groceryPlatform === p ? "border-primary bg-primary-fixed text-primary" : "border-border bg-surface-container-high text-on-surface-variant hover:text-on-surface"}`}
                        >
                          {/* <PlatformLogo platform={p} size="sm" /> */}
                          <span className="leading-tight text-xs text-center line-clamp-1">
                            {PLATFORM_CONFIG[p].label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {groceryPlatform === "other" && (
                      <Input
                        placeholder="Store or app name (optional)"
                        value={groceryPlatformLabel}
                        onChange={(e) =>
                          setGroceryPlatformLabel(e.target.value)
                        }
                        className="rounded-[10px] bg-surface-container-high h-9 text-sm mt-2"
                      />
                    )}
                  </div>

                  {/* Date + Paid By */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                        Date
                      </Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-[10px] bg-surface-container-high h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                        Paid By
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {members.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaidBy(m.id)}
                            className={`h-8 px-3 rounded-[8px] text-xs font-medium transition-all ${paidBy === m.id ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"}`}
                          >
                            {m.display_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scan button */}
                  <div>
                    <input
                      ref={groceryFileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleGroceryOcr}
                    />
                    <button
                      type="button"
                      onClick={() => groceryFileRef.current?.click()}
                      disabled={groceryOcrStatus === "loading"}
                      className="flex items-center gap-2 h-9 px-4 rounded-[10px] bg-secondary/10 text-secondary hover:bg-secondary/20 font-medium text-xs transition-colors disabled:opacity-60"
                    >
                      {groceryOcrStatus === "loading" ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                          Scanning…
                        </>
                      ) : (
                        <>
                          <Camera className="h-3.5 w-3.5" /> Scan Receipt
                        </>
                      )}
                    </button>
                  </div>

                  {/* Items rows */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                        Items (
                        {groceryOrderItems.filter((i) => i.name.trim()).length})
                      </Label>
                      <span className="text-xs font-semibold text-on-surface">
                        Total ₹
                        {groceryOrderItems
                          .reduce((s, i) => s + (i.price_inr ?? 0), 0)
                          .toFixed(0)}
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {groceryOrderItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[1fr_48px_48px_48px_24px] gap-1 items-center"
                        >
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) =>
                              setGroceryOrderItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, name: e.target.value }
                                    : it,
                                ),
                              )
                            }
                            className="rounded-[8px] bg-surface-container-high h-8 text-xs"
                          />
                          <Input
                            type="number"
                            min={0}
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) =>
                              setGroceryOrderItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        quantity:
                                          parseFloat(e.target.value) || 1,
                                      }
                                    : it,
                                ),
                              )
                            }
                            className="rounded-[8px] bg-surface-container-high h-8 text-xs text-center"
                          />
                          <Input
                            placeholder="Unit"
                            value={item.unit_label}
                            onChange={(e) =>
                              setGroceryOrderItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? { ...it, unit_label: e.target.value }
                                    : it,
                                ),
                              )
                            }
                            className="rounded-[8px] bg-surface-container-high h-8 text-xs text-center"
                          />
                          <Input
                            type="number"
                            min={0}
                            placeholder="₹"
                            value={item.price_inr ?? ""}
                            onChange={(e) =>
                              setGroceryOrderItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        price_inr: e.target.value
                                          ? parseFloat(e.target.value)
                                          : null,
                                      }
                                    : it,
                                ),
                              )
                            }
                            className="rounded-[8px] bg-surface-container-high h-8 text-xs text-center"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setGroceryOrderItems((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="h-8 w-6 flex items-center justify-center rounded-[6px] text-on-surface-variant hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setGroceryOrderItems((prev) => [
                          ...prev,
                          {
                            name: "",
                            quantity: 1,
                            unit_label: "pieces",
                            unit_type: "pieces",
                            price_inr: null,
                          },
                        ])
                      }
                      className="w-full h-8 rounded-[8px] flex items-center justify-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-dashed border-border transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add row
                    </button>
                  </div>
                </>
              )}

              {grocerySubType === "item" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                      Item Name
                    </Label>
                    <Input
                      placeholder="e.g. Amul Milk"
                      value={groceryItemName}
                      onChange={(e) => setGroceryItemName(e.target.value)}
                      className="rounded-[12px] bg-surface-container-high h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                      Type
                    </Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setGroceryItemUnitType("pieces");
                          setGroceryItemUnitLabel("pcs");
                        }}
                        className={`flex-1 h-9 rounded-[10px] text-xs font-medium transition-all ${groceryItemUnitType === "pieces" ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"}`}
                      >
                        Countable (pcs)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGroceryItemUnitType("percentage");
                          setGroceryItemUnitLabel("kg");
                        }}
                        className={`flex-1 h-9 rounded-[10px] text-xs font-medium transition-all ${groceryItemUnitType === "percentage" ? "bg-primary text-primary-foreground" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"}`}
                      >
                        Weight / Volume
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                        Unit
                      </Label>
                      <Input
                        placeholder="kg / L / pcs"
                        value={groceryItemUnitLabel}
                        onChange={(e) =>
                          setGroceryItemUnitLabel(e.target.value)
                        }
                        className="rounded-[10px] bg-surface-container-high h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                        Qty
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="1"
                        value={groceryItemQty}
                        onChange={(e) => setGroceryItemQty(e.target.value)}
                        className="rounded-[10px] bg-surface-container-high h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                        Price (₹)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={groceryItemPrice}
                        onChange={(e) => setGroceryItemPrice(e.target.value)}
                        className="rounded-[10px] bg-surface-container-high h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
                      Purchase Date
                    </Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-[12px] bg-surface-container-high h-10"
                    />
                  </div>
                </>
              )}
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
      <Dialog
        open={isNewEntryOpen}
        onOpenChange={(open) => !open && closeNewEntry()}
      >
        <DialogContent className="bg-surface-container-lowest rounded-[16px] w-full max-w-lg mx-auto p-0 gap-0 border-0 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="font-heading text-xl font-bold text-on-surface">
              {isEditing ? "Edit Entry" : "New Entry"}
            </DialogTitle>
            <DialogDescription className="text-sm text-on-surface-variant">
              {isEditing
                ? "Update the record details"
                : "Add a new record to the household log"}
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={isNewEntryOpen}
      onOpenChange={(open) => !open && closeNewEntry()}
      repositionInputs={false}
    >
      <DrawerContent className="bg-surface-container-lowest flex flex-col max-h-[92svh]">
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
          data-vaul-no-drag
        >
          <DrawerHeader>
            <DrawerTitle className="font-heading text-xl font-bold text-on-surface">
              {isEditing ? "Edit Entry" : "New Entry"}
            </DrawerTitle>
            <DrawerDescription className="text-sm text-on-surface-variant">
              {isEditing
                ? "Update the record details"
                : "Add a new record to the household log"}
            </DrawerDescription>
          </DrawerHeader>
          {formContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
