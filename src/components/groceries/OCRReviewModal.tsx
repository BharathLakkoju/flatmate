"use client";

import { useState } from "react";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import { useFlatStore } from "@/stores/use-flat-store";
import { useGroceryStore } from "@/stores/use-grocery-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import type { OCRParsedItem, GroceryPlatform, GroceryUnitType } from "@/types";
import {
  PlatformLogo,
  PLATFORM_CONFIG,
} from "@/components/groceries/PlatformLogo";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface OCRReviewModalProps {
  open: boolean;
  items: OCRParsedItem[];
  rawText: string;
  onClose: () => void;
}

const SELECTABLE_PLATFORMS: GroceryPlatform[] = [
  "swiggy",
  "zepto",
  "blinkit",
  "dunzo",
  "bigbasket",
  "jiomart",
  "dmart",
  "other",
];

function ReviewForm({
  initialItems,
  onClose,
  flatId,
  memberId,
}: {
  initialItems: OCRParsedItem[];
  onClose: () => void;
  flatId: string;
  memberId: string;
}) {
  const addItems = useGroceryStore((s) => s.addItems);
  const addOrder = useGroceryStore((s) => s.addOrder);
  const addExpense = useExpenseStore((s) => s.addExpense);

  const today = new Date().toISOString().split("T")[0];

  const [items, setItems] = useState<OCRParsedItem[]>(
    initialItems.length > 0
      ? initialItems
      : [
          {
            name: "",
            quantity: 1,
            unit_label: "pieces",
            unit_type: "pieces",
            price_inr: null,
          },
        ],
  );
  const [platform, setPlatform] = useState<GroceryPlatform>("other");
  const [customPlatformName, setCustomPlatformName] = useState("");
  const [orderDate, setOrderDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const members = useFlatStore((s) => s.members);
  const currentMember = useFlatStore((s) => s.currentMember);
  const [paidBy, setPaidBy] = useState(currentMember?.id ?? "");

  const computedTotal = items.reduce(
    (sum, item) => sum + (item.price_inr ?? 0),
    0,
  );

  const updateItem = (
    idx: number,
    field: keyof OCRParsedItem,
    value: string | number | null,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        quantity: 1,
        unit_label: "pieces",
        unit_type: "pieces",
        price_inr: null,
      },
    ]);
  };

  const handleConfirm = async () => {
    setError("");
    const validItems = items.filter((i) => i.name.trim().length > 0);
    if (validItems.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (!paidBy) {
      setError("Select who paid.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/groceries/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flat_id: flatId,
          platform,
          platform_label:
            platform === "other" && customPlatformName.trim()
              ? customPlatformName.trim()
              : null,
          total_amount_inr: computedTotal > 0 ? computedTotal : 0.01,
          order_date: orderDate,
          paid_by: paidBy,
          items: validItems.map((item) => ({
            name: item.name.trim(),
            unit_type: item.unit_type,
            unit_label: item.unit_label,
            total_quantity: item.quantity,
            price_inr: item.price_inr ?? null,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to save order");

      const data = await res.json();

      // Update stores
      addOrder(data.order);
      addItems(data.items);
      if (data.expense) addExpense(data.expense);

      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 py-1">
      {/* Platform selector */}
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
          Platform
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {SELECTABLE_PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-1 rounded-[10px] border transition-all text-[10px] font-medium",
                platform === p
                  ? "border-primary bg-primary-fixed text-primary"
                  : "border-border bg-surface-container text-on-surface-variant hover:text-on-surface",
              )}
            >
              {/* <PlatformLogo platform={p} size="sm" /> */}
              <span className="leading-tight text-center text-xs line-clamp-1">
                {PLATFORM_CONFIG[p].label}
              </span>
            </button>
          ))}
        </div>
        {platform === "other" && (
          <Input
            placeholder="Store or app name (optional)"
            value={customPlatformName}
            onChange={(e) => setCustomPlatformName(e.target.value)}
            className="rounded-[10px] bg-surface-container h-9 text-sm mt-2"
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
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="rounded-[10px] bg-surface-container h-10"
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
                className={cn(
                  "h-8 px-3 rounded-[8px] text-xs font-medium transition-all",
                  paidBy === m.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-container text-on-surface-variant hover:text-on-surface",
                )}
              >
                {m.display_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            Items ({items.filter((i) => i.name.trim()).length})
          </Label>
          <span className="text-xs font-semibold text-on-surface">
            Total ₹{computedTotal.toFixed(0)}
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_56px_56px_56px_28px] gap-1.5 items-center"
            >
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => updateItem(idx, "name", e.target.value)}
                className="rounded-[8px] bg-surface-container dark:bg-muted h-8 text-xs"
              />
              <Input
                type="number"
                min={0}
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(idx, "quantity", parseFloat(e.target.value) || 1)
                }
                className="rounded-[8px] bg-surface-container dark:bg-muted h-8 text-xs text-center"
              />
              <Input
                placeholder="Unit"
                value={item.unit_label}
                onChange={(e) => updateItem(idx, "unit_label", e.target.value)}
                className="rounded-[8px] bg-surface-container dark:bg-muted h-8 text-xs text-center"
              />
              <Input
                type="number"
                min={0}
                placeholder="₹"
                value={item.price_inr ?? ""}
                onChange={(e) =>
                  updateItem(
                    idx,
                    "price_inr",
                    e.target.value ? parseFloat(e.target.value) : null,
                  )
                }
                className="rounded-[8px] bg-surface-container dark:bg-muted h-8 text-xs text-center"
              />
              <button
                onClick={() => removeItem(idx)}
                className="h-8 w-7 flex items-center justify-center rounded-[6px] text-on-surface-variant hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addRow}
          className="w-full h-8 rounded-[8px] flex items-center justify-center gap-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container dark:hover:bg-muted border border-dashed border-border transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add row
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="bg-surface-container dark:bg-muted rounded-[8px] px-3 py-2 text-xs text-on-surface-variant">
        An expense entry (₹{computedTotal.toFixed(0)} · groceries) will also be
        created automatically.
      </div>

      <Button
        onClick={handleConfirm}
        disabled={saving}
        className="w-full rounded-[10px] bg-primary text-primary-foreground h-10"
      >
        {saving ? "Saving…" : "Confirm & Save"}
      </Button>
    </div>
  );
}

export function OCRReviewModal({
  open,
  items,
  rawText,
  onClose,
}: OCRReviewModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const flat = useFlatStore((s) => s.flat);
  const currentMember = useFlatStore((s) => s.currentMember);

  if (!flat || !currentMember) return null;

  const title = "Review Order Items";
  const description =
    "We extracted these items from your screenshot. Edit any mistakes before confirming.";

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ReviewForm
            initialItems={items}
            onClose={onClose}
            flatId={flat.id}
            memberId={currentMember.id}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8 overflow-y-auto max-h-[80vh]">
          <ReviewForm
            initialItems={items}
            onClose={onClose}
            flatId={flat.id}
            memberId={currentMember.id}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
