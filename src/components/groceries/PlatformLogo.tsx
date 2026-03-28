import { cn } from "@/lib/utils";
import type { GroceryPlatform } from "@/types";

export const PLATFORM_CONFIG: Record<
  GroceryPlatform,
  { color: string; bg: string; label: string; abbr: string }
> = {
  swiggy: {
    color: "#FC8019",
    bg: "#fff2e9",
    label: "Swiggy Instamart",
    abbr: "S",
  },
  zepto: { color: "#7B2FBE", bg: "#f3e9ff", label: "Zepto", abbr: "Z" },
  blinkit: { color: "#cc9900", bg: "#fffadf", label: "Blinkit", abbr: "B" },
  dunzo: { color: "#00897B", bg: "#e6fff9", label: "Dunzo", abbr: "D" },
  bigbasket: {
    color: "#6aaa0d",
    bg: "#edf7e0",
    label: "BigBasket",
    abbr: "BB",
  },
  jiomart: { color: "#0052A5", bg: "#e6eeff", label: "JioMart", abbr: "JM" },
  dmart: { color: "#D32F2F", bg: "#fce8e8", label: "D-Mart", abbr: "DM" },
  other: { color: "#64748B", bg: "#f1f5f9", label: "Other", abbr: "?" },
  manual: { color: "#64748B", bg: "#f1f5f9", label: "Manual", abbr: "✎" },
};

const sizeClasses = {
  sm: "h-7 w-7 text-[9px]",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
};

interface PlatformLogoProps {
  platform: GroceryPlatform | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PlatformLogo({
  platform,
  size = "md",
  className,
}: PlatformLogoProps) {
  const config =
    PLATFORM_CONFIG[platform as GroceryPlatform] ?? PLATFORM_CONFIG.other;

  return (
    <div
      className={cn(
        "rounded-[8px] flex items-center justify-center font-bold leading-none shrink-0",
        sizeClasses[size],
        className,
      )}
      style={{ background: config.bg, color: config.color }}
    >
      {config.abbr}
    </div>
  );
}
