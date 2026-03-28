"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { GroceryItem } from "@/types";
import { GroceryItemCard } from "./GroceryItemCard";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "in_stock" | "low";

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in_stock", label: "In Stock" },
  { value: "low", label: "Running Low" },
];

interface GroceryListProps {
  items: GroceryItem[];
  onLogUse: (item: GroceryItem) => void;
  onDelete: (item: GroceryItem) => void;
}

export function GroceryList({ items, onLogUse, onDelete }: GroceryListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered =
    activeTab === "all" ? items : items.filter((i) => i.status === activeTab);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-container rounded-[10px] p-1">
        {TABS.map((tab) => {
          const count =
            tab.value === "all"
              ? items.length
              : items.filter((i) => i.status === tab.value).length;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex-1 text-xs font-medium px-2 py-1.5 rounded-[8px] transition-colors flex items-center justify-center gap-1",
                activeTab === tab.value
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "text-[10px] px-1 py-0.5 rounded-full",
                  activeTab === tab.value
                    ? "bg-primary/10 text-primary"
                    : "bg-surface-container-high dark:bg-border text-on-surface-variant",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Item grid */}
      {filtered.length === 0 ? (
        <div className="py-16 flex flex-col items-center text-center">
          <span className="text-4xl mb-3">🛒</span>
          <p className="font-medium text-on-surface">No items here</p>
          <p className="text-sm text-on-surface-variant mt-1">
            {activeTab === "all"
              ? "Upload an order screenshot or add items manually"
              : `No items with status "${activeTab.replace("_", " ")}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <GroceryItemCard
                key={item.id}
                item={item}
                onLogUse={onLogUse}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
