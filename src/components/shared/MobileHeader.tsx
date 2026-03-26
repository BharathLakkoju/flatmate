"use client";

import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { useFlatStore } from "@/stores/use-flat-store";
import { NotificationBell } from "@/components/shared/NotificationBell";

export function MobileHeader() {
  const flat = useFlatStore((s) => s.flat);

  return (
    <header className="lg:hidden flex items-center justify-between h-12 px-4 bg-surface/80 backdrop-blur-[20px] shrink-0 relative z-50">
      <Link href="/app/home" className="flex items-center gap-2">
        <Image src="/logo.ico" alt="Logo" width={24} height={24} className="rounded-[6px]" />
        <h1 className="font-heading text-base font-bold text-on-surface">
          {flat?.name}
        </h1>
      </Link>
      <div className="flex items-center gap-2">
        <NotificationBell />
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
