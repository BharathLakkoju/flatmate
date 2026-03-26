"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Receipt, UtensilsCrossed, ClipboardList, Users, X } from "lucide-react";
import { useFlatStore } from "@/stores/use-flat-store";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  created_at: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  expense: <Receipt className="h-4 w-4 text-primary" />,
  meal: <UtensilsCrossed className="h-4 w-4 text-secondary" />,
  task: <ClipboardList className="h-4 w-4 text-tertiary" />,
  member_joined: <Users className="h-4 w-4 text-on-surface-variant" />,
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const flat = useFlatStore((s) => s.flat);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [lastReadAt, setLastReadAt] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Load last-read timestamp from localStorage once flat is known
  useEffect(() => {
    if (flat?.id) {
      const stored = localStorage.getItem(`notif_read_${flat.id}`) ?? "";
      setLastReadAt(stored);
    }
  }, [flat?.id]);

  // Poll for notifications every 30 s
  useEffect(() => {
    if (!flat?.id) return;

    const load = () => {
      fetch(`/api/notifications?flat_id=${flat.id}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: Notification[]) => setNotifs(data))
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [flat?.id]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = notifs.filter(
    (n) => !lastReadAt || n.created_at > lastReadAt
  ).length;

  const handleOpen = () => {
    const isOpening = !open;
    setOpen(isOpening);
    if (isOpening && flat?.id) {
      const now = new Date().toISOString();
      localStorage.setItem(`notif_read_${flat.id}`, now);
      setLastReadAt(now);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 text-on-surface-variant" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 max-h-[70vh] overflow-y-auto bg-surface-container-lowest rounded-[16px] shadow-[0_16px_48px_rgba(48,51,46,0.16)] border border-surface-container z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container sticky top-0 bg-surface-container-lowest">
              <p className="font-heading font-semibold text-sm text-on-surface">Notifications</p>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
              >
                <X className="h-3.5 w-3.5 text-on-surface-variant" />
              </button>
            </div>

            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-on-surface-variant/30 mx-auto mb-2" />
                <p className="text-sm text-on-surface-variant">No notifications yet</p>
                <p className="text-xs text-on-surface-variant/60 mt-1">
                  Expenses, meals, and tasks will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-surface-container">
                {notifs.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container/50 transition-colors">
                    <div className="mt-0.5 h-8 w-8 rounded-[8px] bg-surface-container flex items-center justify-center shrink-0">
                      {typeIcon[n.type] ?? <Bell className="h-4 w-4 text-on-surface-variant" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-on-surface-variant/60 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
