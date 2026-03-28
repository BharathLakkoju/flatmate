"use client";

import { useGroceryStore } from "@/stores/use-grocery-store";

interface GroceryStatsProps {
  flatId: string;
}

export function GroceryStats({ flatId }: GroceryStatsProps) {
  const items = useGroceryStore((s) => s.items);

  const inStock = items.filter((i) => i.status === "in_stock").length;
  const low = items.filter((i) => i.status === "low").length;
  const total = items.length;

  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-1 text-sm">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-on-surface-variant">
          <span className="font-semibold text-on-surface">{inStock}</span> in
          stock
        </span>
      </div>
      {low > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-on-surface-variant">
            <span className="font-semibold text-amber-600">{low}</span> running
            low
          </span>
        </div>
      )}
    </div>
  );
}
