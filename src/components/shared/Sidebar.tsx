"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  Receipt,
  UtensilsCrossed,
  ClipboardList,
  Settings,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalStore } from "@/stores/use-modal-store";
import { useFlatStore } from "@/stores/use-flat-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app/home", label: "Home", icon: Home },
  { href: "/app/calendar", label: "Calendar", icon: Calendar },
  { href: "/app/expenses", label: "Expenses", icon: Receipt },
  { href: "/app/meals", label: "Meals", icon: UtensilsCrossed },
  { href: "/app/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const openNewEntry = useModalStore((s) => s.openNewEntry);
  const flat = useFlatStore((s) => s.flat);
  const members = useFlatStore((s) => s.members);

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-surface h-screen sticky top-0 py-6 px-4">
      {/* Flat Name */}
      <div className="px-3 mb-2">
        <Link href="/app/home" className="flex items-center gap-2.5">
          <Image src="/logo.ico" alt="Logo" width={28} height={28} className="rounded-[8px]" />
          <h1 className="font-heading text-lg font-bold text-on-surface">
            {flat?.name || "My Flat"}
          </h1>
        </Link>
      </div>
      <div className="px-3 mb-6">
        <p className="text-xs text-on-surface-variant/90">
          {members.length > 0 ? `${members.length} Member${members.length !== 1 ? "s" : ""} Active` : "No members yet"}
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors",
                  isActive
                    ? "bg-surface-container-lowest text-on-surface shadow-[0_12px_32px_rgba(48,51,46,0.06)]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <Link href="/app/profile" className="mx-1 mb-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
          <User className="h-4.5 w-4.5" />
          Profile
        </div>
      </Link>

      {/* New Entry Button — only on sidebar (desktop) */}
      <Button
        onClick={() => openNewEntry()}
        className="mx-1 bg-linear-to-r from-primary to-primary-dim text-primary-foreground rounded-[12px] h-10"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Entry
      </Button>
    </aside>
  );
}
