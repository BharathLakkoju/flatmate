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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useFlatStore } from "@/stores/use-flat-store";
import { useGroceryStore } from "@/stores/use-grocery-store";
import type { GroceryItem } from "@/types";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";

interface UsageModalProps {
  item: GroceryItem | null;
  onClose: () => void;
}

function UsageForm({
  item,
  onClose,
  flatId,
}: {
  item: GroceryItem;
  onClose: () => void;
  flatId: string;
}) {
  const logUsage = useGroceryStore((s) => s.logUsage);
  const removeItem = useGroceryStore((s) => s.removeItem);

  const remaining = Number(item.remaining_quantity);
  const total = Number(item.total_quantity);
  const isPct = item.unit_type === "percentage";

  const today = new Date().toISOString().split("T")[0];

  // For percentage: slider value = amount remaining after use
  // For pieces: counter = amount used
  const [sliderValue, setSliderValue] = useState(
    isPct ? Math.round((remaining / total) * 100) : remaining,
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Derived amount_used
  const amountUsed = isPct
    ? Math.max(0, remaining - (sliderValue / 100) * total)
    : Math.min(sliderValue, remaining);

  const handleSubmit = async () => {
    if (amountUsed <= 0) {
      setError("No usage recorded. Move the slider or enter a value.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/groceries/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flat_id: flatId,
          item_id: item.id,
          log_date: today,
          amount_used: amountUsed,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to log usage");
      const data = await res.json();
      if (data.deleted) {
        removeItem(item.id);
      } else {
        logUsage(item.id, amountUsed);
      }
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const pctRemaining = isPct
    ? sliderValue
    : total > 0
      ? Math.round(((remaining - amountUsed) / total) * 100)
      : 0;

  const barColor =
    pctRemaining > 25
      ? "bg-primary"
      : pctRemaining > 0
        ? "bg-amber-500"
        : "bg-destructive";

  return (
    <div className="space-y-5 py-1">
      {/* Item name */}
      <div className="bg-surface-container dark:bg-muted rounded-[10px] p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-[8px] bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-lg">
          <ShoppingCart className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-on-surface text-sm">{item.name}</p>
          <p className="text-xs text-on-surface-variant">
            {isPct
              ? `${Math.round((remaining / total) * 100)}% remaining`
              : `${remaining} of ${total} ${item.unit_label} remaining`}
          </p>
        </div>
      </div>

      {/* Input */}
      {isPct ? (
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            How much is left now?
          </Label>

          {/* Big readout */}
          <div className="text-center py-1">
            <span className="text-3xl font-bold text-on-surface tabular-nums">
              {sliderValue}%
            </span>
            <span className="text-sm text-on-surface-variant ml-1.5">
              remaining
            </span>
          </div>

          {/* Custom slider track */}
          {(() => {
            const max = Math.max(1, Math.round((remaining / total) * 100));
            const pct = (sliderValue / max) * 100;
            // Offset keeps thumb within track bounds for a 20px thumb
            const thumbLeft = `calc(${pct}% + ${10 - pct * 0.2}px)`;
            return (
              <div className="relative flex items-center h-6">
                {/* Track */}
                <div className="w-full h-2.5 rounded-full bg-surface-container-high">
                  {/* Fill */}
                  <div
                    className={cn(
                      "h-full rounded-full transition-colors duration-150",
                      barColor,
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {/* Thumb */}
                <div
                  className="absolute h-5 w-5 rounded-full bg-white border-[3px] border-primary shadow-md pointer-events-none"
                  style={{
                    left: thumbLeft,
                    transform: "translateX(-50%) translateY(-50%)",
                    top: "50%",
                  }}
                />
                {/* Invisible interactive input */}
                <input
                  type="range"
                  min={0}
                  max={max}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            );
          })()}

          {/* Labels */}
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Empty</span>
            <span>Full ({Math.round((remaining / total) * 100)}%)</span>
          </div>

          {amountUsed > 0 && (
            <p className="text-xs text-on-surface-variant text-center bg-surface-container rounded-[8px] py-2">
              Recording usage of{" "}
              <span className="font-semibold text-on-surface">
                {Math.round(amountUsed * 10) / 10}{" "}
                {item.unit_label === "%" ? "%" : item.unit_label}
              </span>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            How many {item.unit_label} did you use?
          </Label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSliderValue((v) => Math.max(0, v - 1))}
              className="h-10 w-10 rounded-[10px] bg-surface-container dark:bg-muted text-on-surface text-xl font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center"
            >
              −
            </button>
            <Input
              type="number"
              min={0}
              max={remaining}
              value={sliderValue}
              onChange={(e) =>
                setSliderValue(
                  Math.min(remaining, Math.max(0, Number(e.target.value))),
                )
              }
              className="flex-1 text-center rounded-[10px] bg-surface-container dark:bg-muted h-10 text-lg font-semibold"
            />
            <button
              onClick={() => setSliderValue((v) => Math.min(remaining, v + 1))}
              className="h-10 w-10 rounded-[10px] bg-surface-container dark:bg-muted text-on-surface text-xl font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
          <p className="text-xs text-on-surface-variant text-center">
            {remaining - sliderValue} {item.unit_label} will remain
          </p>
        </div>
      )}

      {/* Note */}
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
          Note (optional)
        </Label>
        <Input
          placeholder="e.g. used for dinner"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-[10px] bg-surface-container dark:bg-muted h-10"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={saving || amountUsed <= 0}
        className="w-full rounded-[10px] bg-primary text-primary-foreground h-10"
      >
        {saving ? "Saving…" : "Log Usage"}
      </Button>
    </div>
  );
}

export function UsageModal({ item, onClose }: UsageModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const flat = useFlatStore((s) => s.flat);

  if (!item || !flat) return null;

  const title = `Log Use — ${item.name}`;
  const description = "Record how much you used today.";

  if (isDesktop) {
    return (
      <Dialog
        open={!!item}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <UsageForm item={item} onClose={onClose} flatId={flat.id} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={!!item}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8">
          <UsageForm item={item} onClose={onClose} flatId={flat.id} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
