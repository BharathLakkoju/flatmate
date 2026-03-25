"use client";

import Link from "next/link";
import { Bell, User } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="lg:hidden flex items-center justify-between h-12 px-4 bg-surface/80 backdrop-blur-[20px] shrink-0">
      <Link href="/app/home">
        <h1 className="font-heading text-base font-bold text-on-surface italic">
          Harmony Habitat
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors">
          <Bell className="h-4 w-4 text-on-surface-variant" />
        </button>
        <Link
          href="/app/profile"
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
        >
          <User className="h-4 w-4 text-on-surface-variant" />
        </Link>
      </div>
    </header>
  );
}
