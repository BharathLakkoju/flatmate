"use client";

import { useEffect, useRef } from "react";
import { useFlatStore } from "@/stores/use-flat-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useTaskStore } from "@/stores/use-task-store";
import { supabase } from "@/lib/supabase/client";
import type { Member } from "@/types";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const setFlat = useFlatStore((s) => s.setFlat);
  const setMembers = useFlatStore((s) => s.setMembers);
  const setCurrentMember = useFlatStore((s) => s.setCurrentMember);
  const setExpenses = useExpenseStore((s) => s.setExpenses);
  const setMeals = useMealStore((s) => s.setMeals);
  const setTasks = useTaskStore((s) => s.setTasks);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const flatId = localStorage.getItem("flatmate_flat_id");
    if (!flatId) return;

    // Fetch flat
    fetch(`/api/flats?id=${encodeURIComponent(flatId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((flat) => {
        if (flat) setFlat(flat);
      });

    // Fetch members + identify current user
    Promise.all([
      fetch(`/api/members?flat_id=${encodeURIComponent(flatId)}`).then((r) =>
        r.ok ? r.json() : []
      ),
      supabase.auth.getUser(),
    ]).then(([membersList, { data: { user } }]: [Member[], { data: { user: { id: string; user_metadata?: Record<string, string> } | null } }]) => {
      setMembers(membersList);
      if (user) {
        const me = membersList.find((m: Member) => m.user_id === user.id);
        if (me) {
          const realName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name;
          if (realName && me.display_name !== realName) {
            // Sync display_name from auth metadata
            fetch(`/api/members/${me.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ display_name: realName }),
            }).then((r) => {
              if (r.ok) {
                const updated = { ...me, display_name: realName };
                setCurrentMember(updated);
                setMembers(membersList.map((m) => (m.id === me.id ? updated : m)));
              } else {
                setCurrentMember(me);
              }
            });
          } else {
            setCurrentMember(me);
          }
        }
      }
    });

    // Fetch expenses
    fetch(`/api/expenses?flat_id=${encodeURIComponent(flatId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setExpenses);

    // Fetch meals
    fetch(`/api/meals?flat_id=${encodeURIComponent(flatId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMeals);

    // Fetch tasks
    fetch(`/api/tasks?flat_id=${encodeURIComponent(flatId)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setTasks);
  }, [setFlat, setMembers, setCurrentMember, setExpenses, setMeals, setTasks]);

  return <>{children}</>;
}
