"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import { MobileHeader } from "@/components/shared/MobileHeader";
import { NewEntryModal } from "@/components/shared/NewEntryModal";
import { AppDataProvider } from "@/components/shared/AppDataProvider";
import { useFlatStore } from "@/stores/use-flat-store";
import { useAppStore } from "@/stores/use-app-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const flat = useFlatStore((s) => s.flat);
  const isAppReady = useAppStore((s) => s.isAppReady);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // If Zustand already has the flat loaded (e.g. client-side navigation), skip
    if (flat) {
      setChecked(true);
      return;
    }

    // Always verify membership via /api/me — handles stale localStorage & new users
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.flat?.id) {
          localStorage.setItem("flatmate_flat_id", data.flat.id);
          setChecked(true);
        } else {
          localStorage.removeItem("flatmate_flat_id");
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        localStorage.removeItem("flatmate_flat_id");
        router.replace("/onboarding");
      });
  }, [flat, router]);

  if (!checked) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-surface gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col items-center gap-3"
        >
          <Image
            src="/logo.ico"
            alt="Flatmate"
            width={48}
            height={48}
            className="rounded-[12px]"
          />
          <p className="font-heading text-lg font-bold text-on-surface">
            Flatmate
          </p>
        </motion.div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <AppDataProvider>
      <div className="flex h-screen bg-surface overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Mobile Header — profile & notifications */}
          <MobileHeader />

          {/* Page Content */}
          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6"
          >
            {children}
          </motion.main>
        </div>

        {/* Mobile Bottom Nav */}
        <MobileNav />

        {/* New Entry Modal (shared across all pages) */}
        <NewEntryModal />
      </div>
    </AppDataProvider>
  );
}
