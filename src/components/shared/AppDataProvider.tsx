"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFlatStore } from "@/stores/use-flat-store";
import { useExpenseStore } from "@/stores/use-expense-store";
import { useMealStore } from "@/stores/use-meal-store";
import { useTaskStore } from "@/stores/use-task-store";
import { useGroceryStore } from "@/stores/use-grocery-store";
import { useAppStore } from "@/stores/use-app-store";
import { supabase } from "@/lib/supabase/client";
import type { Member } from "@/types";

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const setFlat = useFlatStore((s) => s.setFlat);
  const setMembers = useFlatStore((s) => s.setMembers);
  const setCurrentMember = useFlatStore((s) => s.setCurrentMember);
  const setExpenses = useExpenseStore((s) => s.setExpenses);
  const setMeals = useMealStore((s) => s.setMeals);
  const setTasks = useTaskStore((s) => s.setTasks);
  const setGroceryItems = useGroceryStore((s) => s.setItems);
  const setGroceryOrders = useGroceryStore((s) => s.setOrders);
  const setAppReady = useAppStore((s) => s.setAppReady);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const flatId = localStorage.getItem("flatmate_flat_id");
    if (!flatId) {
      setAppReady(true);
      return;
    }

    // Fetch flat
    const flatPromise = fetch(`/api/flats?id=${encodeURIComponent(flatId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((flat) => {
        if (flat) setFlat(flat);
      });

    // Fetch members + identify current user
    const membersPromise = Promise.all([
      fetch(`/api/members?flat_id=${encodeURIComponent(flatId)}`).then((r) =>
        r.ok ? r.json() : [],
      ),
      supabase.auth.getUser(),
    ]).then(
      ([
        membersList,
        {
          data: { user },
        },
      ]: [
        Member[],
        {
          data: {
            user: { id: string; user_metadata?: Record<string, string> } | null;
          };
        },
      ]) => {
        setMembers(membersList);
        if (user) {
          const me = membersList.find((m: Member) => m.user_id === user.id);

          // If the members list is loaded but this user is not in it, they were kicked
          if (!me && membersList.length > 0) {
            localStorage.removeItem("flatmate_flat_id");
            router.replace("/onboarding");
            return;
          }

          if (me) {
            const realName =
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.user_metadata?.display_name;
            if (realName && me.display_name !== realName) {
              // Sync display_name from auth metadata
              return fetch(`/api/members/${me.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ display_name: realName }),
              }).then((r) => {
                if (r.ok) {
                  const updated = { ...me, display_name: realName };
                  setCurrentMember(updated);
                  setMembers(
                    membersList.map((m) => (m.id === me.id ? updated : m)),
                  );
                } else {
                  setCurrentMember(me);
                }
              });
            } else {
              setCurrentMember(me);
            }
          }
        }
      },
    );

    // Fetch expenses
    const expensesPromise = fetch(
      `/api/expenses?flat_id=${encodeURIComponent(flatId)}`,
    )
      .then((r) => (r.ok ? r.json() : []))
      .then(setExpenses);

    // Fetch meals
    const mealsPromise = fetch(
      `/api/meals?flat_id=${encodeURIComponent(flatId)}`,
    )
      .then((r) => (r.ok ? r.json() : []))
      .then(setMeals);

    // Fetch tasks
    const tasksPromise = fetch(
      `/api/tasks?flat_id=${encodeURIComponent(flatId)}`,
    )
      .then((r) => (r.ok ? r.json() : []))
      .then(setTasks);

    // Fetch grocery items
    const groceryItemsPromise = fetch(
      `/api/groceries?flat_id=${encodeURIComponent(flatId)}`,
    )
      .then((r) => (r.ok ? r.json() : []))
      .then(setGroceryItems);

    // Fetch grocery orders
    const groceryOrdersPromise = fetch(
      `/api/groceries/orders?flat_id=${encodeURIComponent(flatId)}`,
    )
      .then((r) => (r.ok ? r.json() : []))
      .then(setGroceryOrders);

    // Mark app as ready once all data is loaded
    Promise.all([
      flatPromise,
      membersPromise,
      expensesPromise,
      mealsPromise,
      tasksPromise,
      groceryItemsPromise,
      groceryOrdersPromise,
    ]).finally(() => setAppReady(true));
  }, [
    setFlat,
    setMembers,
    setCurrentMember,
    setExpenses,
    setMeals,
    setTasks,
    setGroceryItems,
    setGroceryOrders,
    setAppReady,
  ]);

  return <>{children}</>;
}
