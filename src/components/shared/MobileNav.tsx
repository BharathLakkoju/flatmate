"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Calendar,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useModalStore } from "@/stores/use-modal-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/home", label: "Home", icon: Home },
  { href: "/app/calendar", label: "Calendar", icon: Calendar },
  { href: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/app/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/app/groceries", label: "Groceries", icon: ShoppingCart },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const openNewEntry = useModalStore((s) => s.openNewEntry);

  return (
    <>
      {/* Floating Action Button — above nav bar, bottom-right */}
      <button
        onClick={() => openNewEntry()}
        className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[0_4px_20px_rgba(48,51,46,0.30)] active:scale-95 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-surface-container-high pb-safe">
        <div className="flex items-center h-16 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center"
              >
                <div
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors",
                    isActive && "bg-primary/10 px-3 py-2",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary" : "text-on-surface-variant",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-primary" : "text-on-surface-variant",
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
