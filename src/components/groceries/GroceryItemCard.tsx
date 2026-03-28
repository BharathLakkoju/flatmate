"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GroceryItem } from "@/types";

interface GroceryItemCardProps {
  item: GroceryItem;
  onLogUse: (item: GroceryItem) => void;
  onDelete: (item: GroceryItem) => void;
}

function statusColor(status: GroceryItem["status"]) {
  switch (status) {
    case "in_stock":
      return "bg-primary";
    case "low":
      return "bg-amber-500";
  }
}

function statusLabel(status: GroceryItem["status"]) {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low":
      return "Running Low";
  }
}

function statusBadgeClass(status: GroceryItem["status"]) {
  switch (status) {
    case "in_stock":
      return "bg-green-100 text-green-700";
    case "low":
      return "bg-amber-100 text-amber-700";
  }
}

export function GroceryItemCard({
  item,
  onLogUse,
  onDelete,
}: GroceryItemCardProps) {
  const remaining = Number(item.remaining_quantity);
  const total = Number(item.total_quantity);
  const pct =
    total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;

  const isPieces = item.unit_type === "pieces";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-surface-container-lowest rounded-[12px] p-4 space-y-3 border border-border/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-on-surface text-sm leading-tight truncate">
            {item.name}
          </p>
          {item.price_inr != null && (
            <p className="text-xs text-on-surface-variant mt-0.5">
              ₹{Number(item.price_inr).toFixed(0)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              statusBadgeClass(item.status),
            )}
          >
            {statusLabel(item.status)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <span>
            {isPieces
              ? `${remaining} of ${total} ${item.unit_label}`
              : `${Math.round(pct)}% remaining`}
          </span>
          <span className="text-[10px] opacity-70">{item.purchase_date}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              statusColor(item.status),
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onLogUse(item)}
          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[8px] text-xs font-medium transition-colors bg-primary/10 text-primary hover:bg-primary/20"
        >
          <MinusCircle className="h-3.5 w-3.5" />
          Log Use
        </button>
        <button
          onClick={() => onDelete(item)}
          className="h-8 w-8 rounded-[8px] flex items-center justify-center text-on-surface-variant hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
