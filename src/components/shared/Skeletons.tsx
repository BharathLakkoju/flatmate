"use client";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[8px] bg-surface-container-high/60",
        className,
      )}
      {...props}
    />
  );
}

function SkeletonCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface-container-lowest rounded-[12px] p-5 space-y-3",
        className,
      )}
      {...props}
    >
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/* ── Page-specific skeletons ─────────────────────────────────────── */

function HomePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-[12px]" />
        ))}
      </div>

      {/* Stats Strip */}
      <div className="bg-surface-container-lowest rounded-[16px] flex divide-x divide-surface-container-high py-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex-1 px-4 space-y-2">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-1 w-full rounded-full mt-2" />
          </div>
        ))}
      </div>

      {/* Meals */}
      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <Skeleton className="h-4 w-32" />
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-surface-container rounded-[8px] p-3"
          >
            <Skeleton className="h-3 w-16 shrink-0" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-3">
        <Skeleton className="h-4 w-36" />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-surface-container rounded-[8px] p-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-[8px]" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>
            <div className="space-y-1.5 text-right">
              <Skeleton className="h-3 w-12 ml-auto" />
              <Skeleton className="h-2.5 w-16 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-28 rounded-[12px]" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-48 rounded-[12px]" />

      {/* Tasks */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-[12px] p-4 flex items-start gap-3"
          >
            <Skeleton className="h-4 w-4 rounded-full mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpensesPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-[8px]" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-9 rounded-[8px]" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-[12px] p-5 space-y-3"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <Skeleton className="h-4 w-40" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20 rounded-[8px]" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Entries */}
      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-3">
        <Skeleton className="h-4 w-24" />
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-surface-container rounded-[8px] p-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-[8px]" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-3 w-12 ml-auto" />
              <Skeleton className="h-2.5 w-14 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MealsPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-[8px]" />
          <Skeleton className="h-8 w-20 rounded-[8px]" />
          <Skeleton className="h-9 w-9 rounded-[8px]" />
        </div>
      </div>

      {/* Mobile: vertical list */}
      <div className="lg:hidden space-y-3">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={`rounded-[12px] p-3 ${i === 0 ? "bg-surface-container-lowest p-5" : "bg-surface-container"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-6" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-6 w-6 rounded-[6px]" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-12 rounded-[8px]" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal grid */}
      <div className="hidden lg:grid grid-cols-8 gap-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`rounded-[12px] p-3 space-y-3 min-h-70 ${i === 0 ? "col-span-2 bg-surface-container-lowest" : "bg-surface-container"}`}
          >
            <Skeleton className="h-5 w-full" />
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-14 rounded-[8px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Household Profile */}
      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-[12px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-[12px]" />
        <Skeleton className="h-10 w-full rounded-[12px]" />
      </div>

      {/* Members */}
      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-[12px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-surface-container rounded-[12px] p-3"
          >
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <Skeleton className="h-4 w-28" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2.5 w-48" />
              </div>
            </div>
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-8">
      <Skeleton className="h-4 w-28" />

      <div className="bg-surface-container-lowest rounded-[12px] p-6 flex flex-col items-center space-y-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 text-center">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-44 mx-auto" />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[12px] p-5 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-[12px]" />
        <Skeleton className="h-10 w-full rounded-[12px]" />
      </div>

      <Skeleton className="h-11 w-full rounded-[12px]" />
    </div>
  );
}

function CalendarPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-[8px]" />
          <Skeleton className="h-8 w-16 rounded-[8px]" />
          <Skeleton className="h-9 w-9 rounded-[8px]" />
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="text-center py-2">
            <Skeleton className="h-3 w-6 mx-auto" />
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <Skeleton
            key={i}
            className="min-h-16 sm:min-h-24 lg:min-h-28 rounded-[8px]"
          />
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  HomePageSkeleton,
  TasksPageSkeleton,
  ExpensesPageSkeleton,
  MealsPageSkeleton,
  SettingsPageSkeleton,
  ProfilePageSkeleton,
  CalendarPageSkeleton,
};
