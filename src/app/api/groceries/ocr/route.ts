import { NextRequest, NextResponse } from "next/server";
import type { OCRParsedItem } from "@/types";

// OpenRouter free-tier model with vision support.
// Sign up at https://openrouter.ai (no credit card required) for a free key.
// Free vision-capable models: meta-llama/llama-4-scout:free, google/gemma-3-27b-it:free
// const OCR_MODEL = "qwen/qwen3.5-flash-02-23";
const OCR_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";

const PROMPT = `You are a grocery receipt parser. Look at this screenshot of a grocery order (from apps like Swiggy Instamart, Zepto, Blinkit, or similar Indian quick-commerce apps).

Extract all grocery items and return ONLY a valid JSON array. Each item must have these fields:
- "name": string — clean product name (no price/qty in the name)
- "quantity": number — numeric quantity
- "unit_label": string — unit of measurement e.g. "kg", "g", "L", "mL". For countable items, use "pieces"
- "unit_type": "pieces" | "percentage" — use "percentage" for weight/volume units (kg, g, L, mL), "pieces" for countable items
- "price_inr": number | null — price in INR (₹), null if not found

Rules:
- Skip total, subtotal, delivery, GST, tax, discount, coupon, and fee lines
- If a product has multiple variants (e.g. "2 x 500g"), set quantity=2 and unit_label="500g"
- Return an empty array [] if no items are found
- Return ONLY the JSON array, no markdown, no explanation

Example output:
[{"name":"Amul Milk","quantity":2,"unit_label":"L","unit_type":"percentage","price_inr":64},{"name":"Eggs","quantity":6,"unit_label":"pieces","unit_type":"pieces","price_inr":72}]`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 503 }
    );
  }

  let imageData: string;
  let mimeType: string;

  try {
    const body = await req.json();
    imageData = body.image_data; // base64 string, no data URI prefix
    mimeType = body.mime_type || "image/jpeg";
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!imageData) {
    return NextResponse.json({ error: "image_data required" }, { status: 400 });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://flatmate.app",
        "X-Title": "Flatmate Grocery OCR",
      },
      body: JSON.stringify({
        model: OCR_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageData}` },
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return NextResponse.json(
        { error: "OpenRouter API error", detail: errText },
        { status: 502 }
      );
    }

    const result = await response.json();
    const rawText: string = result.choices?.[0]?.message?.content?.trim() ?? "";

    // Model returned nothing (e.g. vision not supported, rate limit, content filter)
    if (!rawText) {
      console.warn("OCR model returned empty content. Full response:", JSON.stringify(result));
      // Return 503 so the client falls back to Tesseract
      return NextResponse.json(
        { error: "Model returned no content", fallback: true },
        { status: 503 }
      );
    }

    // Strip markdown code fences if model adds them despite instructions
    const jsonText = rawText
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    let items: OCRParsedItem[];
    try {
      items = JSON.parse(jsonText);
      if (!Array.isArray(items)) throw new Error("Not an array");
    } catch {
      return NextResponse.json(
        { error: "Failed to parse model response", raw: rawText },
        { status: 422 }
      );
    }

    // Correct unit_type based on unit_label — models often return "pieces" even for kg/g/L etc.
    const weightVolumeRe = /^(kg|g|gram|grams?|gm|gms|mg|l|ltr|litre|litres?|ml|oz|lb|lbs?)$/i;
    items = items.map((item) => ({
      ...item,
      unit_type: weightVolumeRe.test((item.unit_label ?? "").trim()) ? "percentage" : "pieces",
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("OCR route error:", err);
    return NextResponse.json(
      {
        error: "OCR request failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
