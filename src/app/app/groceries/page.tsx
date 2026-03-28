"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { useGroceryStore } from "@/stores/use-grocery-store";
import { useAppStore } from "@/stores/use-app-store";
import { GroceryStats } from "@/components/groceries/GroceryStats";
import { GroceryList } from "@/components/groceries/GroceryList";
import { AddGroceryItemModal } from "@/components/groceries/AddGroceryItemModal";
import { UsageModal } from "@/components/groceries/UsageModal";
import { GroceryOrderUpload } from "@/components/groceries/GroceryOrderUpload";
import { OCRReviewModal } from "@/components/groceries/OCRReviewModal";
import {
  PlatformLogo,
  PLATFORM_CONFIG,
} from "@/components/groceries/PlatformLogo";
import { GroceriesPageSkeleton } from "@/components/shared/Skeletons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GroceryItem, OCRParsedItem, GroceryPlatform } from "@/types";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function GroceriesPage() {
  const isAppReady = useAppStore((s) => s.isAppReady);
  const items = useGroceryStore((s) => s.items);
  const orders = useGroceryStore((s) => s.orders);
  const removeItem = useGroceryStore((s) => s.removeItem);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [usageItem, setUsageItem] = useState<GroceryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GroceryItem | null>(null);

  // OCR state
  const [ocrItems, setOcrItems] = useState<OCRParsedItem[]>([]);
  const [ocrRawText, setOcrRawText] = useState("");
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  const [showOrders, setShowOrders] = useState(false);

  if (!isAppReady) return <GroceriesPageSkeleton />;

  const handleOCRParsed = (parsed: OCRParsedItem[], raw: string) => {
    setOcrItems(parsed);
    setOcrRawText(raw);
    setOcrModalOpen(true);
  };

  const handleDelete = (item: GroceryItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`/api/groceries/${itemToDelete.id}`, { method: "DELETE" });
      removeItem(itemToDelete.id);
    } catch {
      // ignore
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6 mb-24"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Groceries
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Track what you have, log what you use
          </p>
        </div>
        {items.length > 0 && <GroceryStats flatId="" />}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 flex-wrap"
      >
        <GroceryOrderUpload onParsed={handleOCRParsed} />
        <button
          onClick={() => {
            setEditingItem(null);
            setAddModalOpen(true);
          }}
          className="flex items-center gap-2 h-10 px-4 rounded-[10px] bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </motion.div>

      {/* Empty state when no items at all */}
      {items.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="py-20 flex flex-col items-center text-center"
        >
          <ShoppingCart className="h-12 w-12 mb-4 text-primary" />
          <h2 className="font-heading text-xl font-semibold text-on-surface mb-2">
            No groceries tracked yet
          </h2>
          <p className="text-sm text-on-surface-variant max-w-xs">
            Upload a screenshot of your Swiggy / Zepto order, or add items
            manually to start tracking.
          </p>
        </motion.div>
      )}

      {/* Grocery list */}
      {items.length > 0 && (
        <motion.div variants={fadeUp}>
          <GroceryList
            items={items}
            onLogUse={(item) => setUsageItem(item)}
            onDelete={handleDelete}
          />
        </motion.div>
      )}

      {/* Order History */}
      {orders.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          <button
            onClick={() => setShowOrders((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {showOrders ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            Order History ({orders.length})
          </button>

          {showOrders && (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-surface-container-lowest dark:bg-card rounded-[10px] px-4 py-3 flex items-center justify-between border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <PlatformLogo platform={order.platform} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {order.platform_label ??
                          PLATFORM_CONFIG[order.platform as GroceryPlatform]
                            ?.label ??
                          order.platform}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {order.order_date}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm text-on-surface">
                    ₹{Number(order.total_amount_inr).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <AddGroceryItemModal
        open={addModalOpen || !!editingItem}
        onClose={() => {
          setAddModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />

      <UsageModal item={usageItem} onClose={() => setUsageItem(null)} />

      <OCRReviewModal
        open={ocrModalOpen}
        items={ocrItems}
        rawText={ocrRawText}
        onClose={() => {
          setOcrModalOpen(false);
          setOcrItems([]);
          setOcrRawText("");
        }}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!itemToDelete}
        onOpenChange={(o) => !o && setItemToDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove item?</DialogTitle>
            <DialogDescription>
              This will remove &ldquo;{itemToDelete?.name}&rdquo; from your
              grocery list.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-[10px]"
              onClick={() => setItemToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-[10px] bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
