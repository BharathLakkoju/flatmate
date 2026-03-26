"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileNav } from "@/components/shared/MobileNav";
import { MobileHeader } from "@/components/shared/MobileHeader";
import { NewEntryModal } from "@/components/shared/NewEntryModal";
import { AppDataProvider } from "@/components/shared/AppDataProvider";
import { useFlatStore } from "@/stores/use-flat-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const flat = useFlatStore((s) => s.flat);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const flatId = localStorage.getItem("flatmate_flat_id");
    if (flatId || flat) {
      setChecked(true);
      return;
    }

    // No flat in localStorage — check if user already has a membership (e.g. new device login)
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.flat?.id) {
          // Restore the flat_id so AppDataProvider can load it
          localStorage.setItem("flatmate_flat_id", data.flat.id);
          setChecked(true);
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => router.replace("/onboarding"));
  }, [flat, router]);

  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
