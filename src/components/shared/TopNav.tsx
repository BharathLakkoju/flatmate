"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";

const topNavItems = [
  { href: "/app/home", label: "Home" },
  { href: "/app/expenses", label: "Summary" },
  { href: "/app/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden lg:flex items-center justify-between h-14 px-8 bg-surface">
      <div className="flex items-center gap-1">
        <span className="font-heading text-sm font-bold text-on-surface mr-4">
          Flatmate
        </span>
        {topNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm px-3 py-1.5 ${
                isActive
                  ? "text-on-surface font-semibold underline underline-offset-8 decoration-2 decoration-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
          <Bell className="h-4 w-4 text-on-surface-variant" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
          <User className="h-4 w-4 text-on-surface-variant" />
        </button>
      </div>
    </header>
  );
}
