"use client";

import { motion } from "framer-motion";

interface HarmonyMeterProps {
  value: number; // 0-100
  label?: string;
  statusText?: string;
}

export function HarmonyMeter({
  value,
  label = "Balance Status",
  statusText,
}: HarmonyMeterProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
        <span>{label}</span>
        {statusText && (
          <span className="text-primary font-medium">{statusText}</span>
        )}
      </div>
      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-linear-to-r from-secondary to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
