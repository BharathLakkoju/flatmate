import { create } from "zustand";
import type { GroceryItem, GroceryOrder, GroceryItemStatus } from "@/types";

function computeStatus(remaining: number, total: number): GroceryItemStatus {
  if (total === 0 || remaining <= 0) return "low";
  const ratio = remaining / total;
  if (ratio <= 0.25) return "low";
  return "in_stock";
}

interface GroceryState {
  items: GroceryItem[];
  orders: GroceryOrder[];
  setItems: (items: GroceryItem[]) => void;
  setOrders: (orders: GroceryOrder[]) => void;
  addItem: (item: GroceryItem) => void;
  addItems: (items: GroceryItem[]) => void;
  updateItem: (id: string, updates: Partial<GroceryItem>) => void;
  removeItem: (id: string) => void;
  addOrder: (order: GroceryOrder) => void;
  removeOrder: (id: string) => void;
  logUsage: (itemId: string, amountUsed: number) => void;
  getItemsByStatus: (status: GroceryItemStatus) => GroceryItem[];
  getLowStockItems: () => GroceryItem[];
  getInStockItems: () => GroceryItem[];
}

export const useGroceryStore = create<GroceryState>((set, get) => ({
  items: [],
  orders: [],

  setItems: (items) => set({ items }),
  setOrders: (orders) => set({ orders }),

  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  addItems: (newItems) =>
    set((state) => ({ items: [...state.items, ...newItems] })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),

  removeOrder: (id) =>
    set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),

  logUsage: (itemId: string, amountUsed: number) =>
    set((state) => {
      const item = state.items.find((i) => i.id === itemId);
      if (!item) return state;
      const newRemaining = Math.max(0, item.remaining_quantity - amountUsed);
      // Item is fully consumed — remove it (API will delete from DB)
      if (newRemaining <= 0) {
        return { items: state.items.filter((i) => i.id !== itemId) };
      }
      return {
        items: state.items.map((i) =>
          i.id === itemId
            ? { ...i, remaining_quantity: newRemaining, status: computeStatus(newRemaining, i.total_quantity) }
            : i
        ),
      };
    }),

  getItemsByStatus: (status) =>
    get().items.filter((i) => i.status === status),

  getLowStockItems: () =>
    get().items.filter((i) => i.status === "low"),

  getInStockItems: () =>
    get().items.filter((i) => i.status === "in_stock"),
}));
