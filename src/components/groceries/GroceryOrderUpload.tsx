"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import type { OCRParsedItem } from "@/types";

interface GroceryOrderUploadProps {
  onParsed: (items: OCRParsedItem[], rawText: string) => void;
}

// Regex helpers for parsing Swiggy/Zepto/Blinkit receipt text
function parseOCRText(text: string): OCRParsedItem[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const items: OCRParsedItem[] = [];

  // Regex patterns
  const priceRe = /(?:₹|Rs\.?)\s*(\d+(?:\.\d+)?)/i;
  const qtyUnitRe =
    /(\d+(?:\.\d+)?)\s*(kg|g|gram|gms?|l\b|ltr|litre|ml|mL|pcs?|pieces?|nos?|pack|packs?|bunch|bunches?)/i;
  const xTimesPriceRe = /^(\d+)\s*[xX×]\s*(?:₹|Rs\.?)?\s*(\d+(?:\.\d+)?)/;

  // Skip obvious header/footer lines
  const skipRe =
    /total|subtotal|delivery|gst|tax|discount|coupon|bill|order|payment|invoice|net payable|items?:|address|phone|thank you/i;

  for (const line of lines) {
    if (skipRe.test(line)) continue;

    const priceMatch = line.match(priceRe);
    const qtyMatch = line.match(qtyUnitRe);
    const xMatch = line.match(xTimesPriceRe);

    // Extract price
    let price: number | null = priceMatch ? parseFloat(priceMatch[1]) : null;

    // Handle "2 x ₹40" format (unit price × qty)
    if (xMatch && !price) {
      price = parseFloat(xMatch[2]);
    }

    // Extract quantity + unit
    let quantity = 1;
    let unitLabel = "pieces";
    let unitType: "pieces" | "percentage" = "pieces";

    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1]);
      const rawUnit = qtyMatch[2].toLowerCase();
      if (["l", "ltr", "litre", "ml", "ml"].includes(rawUnit)) {
        unitLabel =
          rawUnit === "l" || rawUnit === "ltr" || rawUnit === "litre"
            ? "L"
            : "mL";
        unitType = "percentage";
      } else if (["kg", "g", "gram", "gms"].includes(rawUnit)) {
        unitLabel =
          rawUnit === "kg"
            ? "kg"
            : rawUnit === "g" || rawUnit === "gram" || rawUnit === "gms"
              ? "g"
              : rawUnit;
        unitType = "percentage";
      } else {
        unitLabel = "pieces";
        unitType = "pieces";
      }
    } else if (xMatch) {
      quantity = parseInt(xMatch[1]);
    }

    // Clean up item name: remove price, quantity, and symbols from the line
    let name = line
      .replace(priceRe, "")
      .replace(qtyUnitRe, "")
      .replace(xTimesPriceRe, "")
      .replace(/[₹$%×xX]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    // Skip lines that are purely numbers after cleaning
    if (!name || /^\d+$/.test(name) || name.length < 2) continue;

    items.push({
      name,
      quantity,
      unit_label: unitLabel,
      unit_type: unitType,
      price_inr: price,
    });
  }

  return items;
}

export function GroceryOrderUpload({ onParsed }: GroceryOrderUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("loading");
    setErrorMsg("");

    // Convert file to base64
    const toBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Strip "data:image/...;base64," prefix
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(f);
      });

    try {
      setStatusMsg("Analysing image…");
      const base64 = await toBase64(file);
      const res = await fetch("/api/groceries/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_data: base64,
          mime_type: file.type || "image/jpeg",
        }),
      });

      if (res.ok) {
        const { items } = await res.json();
        setStatus("done");
        onParsed(items, "");
        return;
      }

      const errData = await res.json().catch(() => ({}));
      console.warn(
        "AI OCR failed, falling back to Tesseract:",
        res.status,
        errData,
      );
      // Fall through to Tesseract on any AI failure (key missing, parse error, model error)

      setStatusMsg("Reading image…");
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: () => {},
      });
      const parsed = parseOCRText(data.text);
      setStatus("done");
      onParsed(parsed, data.text);
    } catch (err) {
      console.error("OCR error:", err);
      setStatus("error");
      setErrorMsg("Could not read the image. Please try a clearer screenshot.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === "loading"}
        className="flex items-center gap-2 h-10 px-4 rounded-[10px] bg-secondary/10 text-secondary hover:bg-secondary/20 font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {statusMsg}
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Log Order
          </>
        )}
      </button>
      {status === "error" && (
        <p className="text-xs text-destructive mt-2">{errorMsg}</p>
      )}
    </div>
  );
}
