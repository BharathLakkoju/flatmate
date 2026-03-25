"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Calendar,
  UtensilsCrossed,
  ClipboardList,
  Plus,
} from "lucide-react";
import { useModalStore } from "@/stores/use-modal-store";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/app/home", label: "Home", icon: Home },
  { href: "/app/calendar", label: "Calendar", icon: Calendar },
  { href: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/app/tasks", label: "Tasks", icon: ClipboardList },
];

export function MobileNav() {
  const pathname = usePathname();
  const openNewEntry = useModalStore((s) => s.openNewEntry);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-[20px] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="flex flex-col items-center gap-1">
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-on-surface-variant"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    isActive
                      ? "text-primary font-medium"
                      : "text-on-surface-variant"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Central FAB — mobile only */}
        <button
          onClick={() => openNewEntry()}
          className="shrink-0 -mt-6 w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary-dim text-primary-foreground flex items-center justify-center shadow-[0_12px_32px_rgba(48,51,46,0.15)]"
        >
          <Plus className="h-5 w-5" />
        </button>

        {mobileNavItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="flex flex-col items-center gap-1">
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-on-surface-variant"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    isActive
                      ? "text-primary font-medium"
                      : "text-on-surface-variant"
                  )}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
