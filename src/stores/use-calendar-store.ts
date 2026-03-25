import { create } from "zustand";
import type { CalendarView } from "@/types";
import { format, addMonths, subMonths } from "date-fns";

interface CalendarState {
  selectedDate: string;
  viewMode: CalendarView;
  currentMonth: Date;
  setSelectedDate: (date: string) => void;
  setViewMode: (mode: CalendarView) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: format(new Date(), "yyyy-MM-dd"),
  viewMode: "month",
  currentMonth: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  nextMonth: () =>
    set((state) => ({ currentMonth: addMonths(state.currentMonth, 1) })),
  prevMonth: () =>
    set((state) => ({ currentMonth: subMonths(state.currentMonth, 1) })),
  goToToday: () =>
    set({ currentMonth: new Date(), selectedDate: format(new Date(), "yyyy-MM-dd") }),
}));
