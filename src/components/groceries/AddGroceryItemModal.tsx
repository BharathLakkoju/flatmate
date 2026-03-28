"use client";

import { useState, useEffect } from "react";
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
import type { GroceryItem, GroceryUnitType } from "@/types";
import { cn } from "@/lib/utils";
import { Hash, Percent } from "lucide-react";

interface AddGroceryItemModalProps {
  open: boolean;
  onClose: () => void;
  editItem?: GroceryItem | null;
}

const UNIT_PRESETS: Record<
  GroceryUnitType,
  { label: string; defaultUnit: string }[]
> = {
  pieces: [
    { label: "pieces", defaultUnit: "pieces" },
    { label: "packs", defaultUnit: "packs" },
    { label: "bunches", defaultUnit: "bunches" },
  ],
  percentage: [{ label: "% (for bottles, jars…)", defaultUnit: "%" }],
};

function FormContent({
  editItem,
  onClose,
  flatId,
  memberId,
}: {
  editItem?: GroceryItem | null;
  onClose: () => void;
  flatId: string;
  memberId: string;
}) {
  const addItem = useGroceryStore((s) => s.addItem);
  const updateItem = useGroceryStore((s) => s.updateItem);

  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState(editItem?.name ?? "");
  const [unitType, setUnitType] = useState<GroceryUnitType>(
    editItem?.unit_type ?? "pieces",
  );
  const [unitLabel, setUnitLabel] = useState(editItem?.unit_label ?? "pieces");
  const [totalQty, setTotalQty] = useState(
    String(editItem?.total_quantity ?? ""),
  );
  const [priceInr, setPriceInr] = useState(
    editItem?.price_inr != null ? String(editItem.price_inr) : "",
  );
  const [purchaseDate, setPurchaseDate] = useState(
    editItem?.purchase_date ?? today,
  );
  const [estimatedDays, setEstimatedDays] = useState(
    editItem?.estimated_days ? String(editItem.estimated_days) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset unit_label when type changes
  useEffect(() => {
    if (unitType === "percentage") {
      setUnitLabel("%");
    } else {
      setUnitLabel("pieces");
    }
  }, [unitType]);

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const qty = parseFloat(totalQty);
    if (isNaN(qty) || qty <= 0) {
      setError("Quantity must be a positive number");
      return;
    }
    if (unitType === "percentage" && qty > 100) {
      setError("Percentage cannot exceed 100");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        flat_id: flatId,
        name: name.trim(),
        unit_type: unitType,
        unit_label: unitLabel,
        total_quantity: qty,
        remaining_quantity: editItem
          ? Number(editItem.remaining_quantity)
          : qty,
        price_inr: priceInr ? parseFloat(priceInr) : null,
        purchase_date: purchaseDate,
        estimated_days: estimatedDays ? parseInt(estimatedDays) : null,
      };

      if (editItem) {
        const res = await fetch(`/api/groceries/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        updateItem(editItem.id, updated);
      } else {
        const res = await fetch("/api/groceries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create");
        const created = await res.json();
        addItem(created);
      }
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 py-1">
      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
          Item Name
        </Label>
        <Input
          placeholder="e.g. Cauliflower, Tomatoes, Oil…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-[10px] bg-surface-container dark:bg-muted h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
          Tracking Type
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {(["pieces", "percentage"] as GroceryUnitType[]).map((type) => (
            <button
              key={type}
              onClick={() => setUnitType(type)}
              className={cn(
                "h-10 rounded-[10px] text-sm font-medium border transition-colors",
                unitType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface-container dark:bg-muted border-border text-on-surface-variant hover:text-on-surface",
              )}
            >
              {type === "pieces" ? (
                <div className="flex items-center gap-1 justify-center">
                  <Hash className="h-4 w-4" /> Count / Pieces
                </div>
              ) : (
                <div className="flex items-center gap-1 justify-center">
                  <Percent className="h-4 w-4" /> Percentage
                </div>
              )}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-on-surface-variant">
          {unitType === "percentage"
            ? "Use % for things like oil, curd, flour…"
            : "Use count for tomatoes, eggs, packs…"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            {unitType === "percentage" ? "Starting %" : "Quantity"}
          </Label>
          <Input
            type="number"
            min={0}
            max={unitType === "percentage" ? 100 : undefined}
            placeholder={unitType === "percentage" ? "100" : "e.g. 6"}
            value={totalQty}
            onChange={(e) => setTotalQty(e.target.value)}
            className="rounded-[10px] bg-surface-container dark:bg-muted h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            Unit Label
          </Label>
          <Input
            placeholder={unitType === "percentage" ? "%" : "pieces, kg, L…"}
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
            className="rounded-[10px] bg-surface-container dark:bg-muted h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            Price (₹)
          </Label>
          <Input
            type="number"
            min={0}
            placeholder="Optional"
            value={priceInr}
            onChange={(e) => setPriceInr(e.target.value)}
            className="rounded-[10px] bg-surface-container dark:bg-muted h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
            Est. days to finish
          </Label>
          <Input
            type="number"
            min={1}
            placeholder="Optional"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            className="rounded-[10px] bg-surface-container dark:bg-muted h-10"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium">
          Purchase Date
        </Label>
        <Input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="rounded-[10px] bg-surface-container dark:bg-muted h-10"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full rounded-[10px] bg-primary text-primary-foreground h-10"
      >
        {saving ? "Saving…" : editItem ? "Update Item" : "Add Item"}
      </Button>
    </div>
  );
}

export function AddGroceryItemModal({
  open,
  onClose,
  editItem,
}: AddGroceryItemModalProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const flat = useFlatStore((s) => s.flat);
  const currentMember = useFlatStore((s) => s.currentMember);

  if (!flat || !currentMember) return null;

  const title = editItem ? "Edit Item" : "Add Grocery Item";
  const description = editItem
    ? "Update the grocery item details."
    : "Manually add a grocery item to track.";

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <FormContent
            editItem={editItem}
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
        <div className="px-4 pb-8">
          <FormContent
            editItem={editItem}
            onClose={onClose}
            flatId={flat.id}
            memberId={currentMember.id}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
