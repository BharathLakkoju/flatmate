import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  flats,
  members,
  expenseEntries,
  mealPlanEntries,
  tasks,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { format, subDays, addDays } from "date-fns";

// Fixed invite code so test flat is always identifiable & idempotent
const TEST_INVITE_CODE = "TEST-0000";

// ── POST: seed test data ────────────────────────────────────────────
export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seed only available in development" },
      { status: 403 }
    );
  }

  // Idempotent: wipe previous test flat first
  const existing = await db
    .select({ id: flats.id })
    .from(flats)
    .where(eq(flats.invite_code, TEST_INVITE_CODE))
    .limit(1);

  if (existing.length) {
    await db.delete(flats).where(eq(flats.id, existing[0].id)); // cascades
  }

  const today = new Date();
  const d = (offset: number) => format(addDays(today, offset), "yyyy-MM-dd");

  // ── 1. Flat ───────────────────────────────────────────────────────
  const [flat] = await db
    .insert(flats)
    .values({ name: "Kondapur 2BHK", invite_code: TEST_INVITE_CODE })
    .returning();

  // ── 2. Members (no user_id → never linked to a real auth user) ───
  const [bharath] = await db
    .insert(members)
    .values({ flat_id: flat.id, display_name: "Bharath", role: "admin" })
    .returning();
  const [sai] = await db
    .insert(members)
    .values({ flat_id: flat.id, display_name: "Sai", role: "member" })
    .returning();
  const [ravi] = await db
    .insert(members)
    .values({ flat_id: flat.id, display_name: "Ravi", role: "member" })
    .returning();

  const payers = [bharath, sai, ravi];
  const pick = (i: number) => payers[i % 3].id;

  // ── 3. Expenses — 30 entries across the last 14 days ─────────────
  const expenseRows = [
    // Today
    { date: d(0), category: "groceries" as const, amount_inr: "450.00", paid_by: pick(0), note: "Vegetables from Ratnadeep" },
    { date: d(0), category: "meals" as const, amount_inr: "589.00", paid_by: pick(1), note: "Swiggy dinner — biryani" },
    { date: d(0), category: "household" as const, amount_inr: "120.00", paid_by: pick(2), note: "Trash bags & sponges" },
    // Yesterday
    { date: d(-1), category: "utilities" as const, amount_inr: "1800.00", paid_by: pick(2), note: "Electricity bill — March" },
    { date: d(-1), category: "groceries" as const, amount_inr: "280.00", paid_by: pick(0), note: "Milk, bread & eggs" },
    { date: d(-1), category: "meals" as const, amount_inr: "340.00", paid_by: pick(1), note: "Zomato lunch order" },
    // 2 days ago
    { date: d(-2), category: "household" as const, amount_inr: "650.00", paid_by: pick(1), note: "Cleaning supplies & mop" },
    { date: d(-2), category: "groceries" as const, amount_inr: "375.00", paid_by: pick(0), note: "Fruits & dry fruits" },
    // 3 days ago
    { date: d(-3), category: "outings" as const, amount_inr: "1200.00", paid_by: pick(2), note: "Weekend lunch at Paradise" },
    { date: d(-3), category: "meals" as const, amount_inr: "210.00", paid_by: pick(0), note: "Evening chai & samosa" },
    { date: d(-3), category: "other" as const, amount_inr: "99.00", paid_by: pick(1), note: "Netflix monthly share" },
    // 4 days ago
    { date: d(-4), category: "groceries" as const, amount_inr: "520.00", paid_by: pick(0), note: "Weekly grocery run" },
    { date: d(-4), category: "utilities" as const, amount_inr: "349.00", paid_by: pick(2), note: "Jio fiber — monthly" },
    // 5 days ago
    { date: d(-5), category: "meals" as const, amount_inr: "180.00", paid_by: pick(1), note: "Tea & biscuits for the week" },
    { date: d(-5), category: "household" as const, amount_inr: "220.00", paid_by: pick(0), note: "New dustbin for kitchen" },
    // 6 days ago
    { date: d(-6), category: "utilities" as const, amount_inr: "600.00", paid_by: pick(2), note: "WiFi recharge" },
    { date: d(-6), category: "groceries" as const, amount_inr: "195.00", paid_by: pick(1), note: "Curd, paneer, butter" },
    // 7 days ago
    { date: d(-7), category: "outings" as const, amount_inr: "850.00", paid_by: pick(0), note: "Movie tickets — Pushpa 3" },
    { date: d(-7), category: "meals" as const, amount_inr: "430.00", paid_by: pick(2), note: "Pizza party from Dominos" },
    // 8–14 days ago (sparser)
    { date: d(-8), category: "groceries" as const, amount_inr: "710.00", paid_by: pick(0), note: "Big Basket order" },
    { date: d(-9), category: "utilities" as const, amount_inr: "500.00", paid_by: pick(1), note: "Gas cylinder refill" },
    { date: d(-9), category: "household" as const, amount_inr: "150.00", paid_by: pick(2), note: "Light bulbs x3" },
    { date: d(-10), category: "meals" as const, amount_inr: "260.00", paid_by: pick(0), note: "Breakfast at Chutneys" },
    { date: d(-11), category: "outings" as const, amount_inr: "1500.00", paid_by: pick(1), note: "Go-karting weekend" },
    { date: d(-12), category: "groceries" as const, amount_inr: "320.00", paid_by: pick(2), note: "Rice 5 kg bag" },
    { date: d(-13), category: "other" as const, amount_inr: "200.00", paid_by: pick(0), note: "Uber to office" },
    { date: d(-14), category: "utilities" as const, amount_inr: "2200.00", paid_by: pick(1), note: "Water purifier service" },
    { date: d(-14), category: "groceries" as const, amount_inr: "480.00", paid_by: pick(2), note: "Monthly staples" },
    { date: d(-14), category: "meals" as const, amount_inr: "150.00", paid_by: pick(0), note: "Chai point order" },
    { date: d(-14), category: "household" as const, amount_inr: "750.00", paid_by: pick(1), note: "Bathroom rack from Amazon" },
  ];

  await db.insert(expenseEntries).values(
    expenseRows.map((e) => ({ flat_id: flat.id, ...e }))
  );

  // ── 4. Meal plans — 21 days: past 7 + today + next 13 ────────────
  const meals: { date: string; meal_type: "breakfast" | "lunch" | "dinner"; content: string }[] = [];
  const breakfasts = ["Idli & Chutney", "Dosa & Sambar", "Poha", "Upma", "Aloo Paratha", "Bread Omelette", "Cornflakes & Milk", "Pesarattu", "Puri & Curry", "Rava Idli"];
  const lunches = ["Dal Rice & Salad", "Biryani", "Curd Rice", "Rajma Chawal", "Chapati & Sabzi", "Pulao & Raita", "Sambar Rice", "Kadhi Rice", "Lemon Rice", "Fried Rice"];
  const dinners = ["Roti & Paneer Curry", "Maggi", "Pasta", "Egg Curry & Rice", "Dosa (night)", "Noodles", "Pizza (ordered)", "Chapati & Dal", "Khichdi", "Sandwich & Soup"];

  for (let offset = -7; offset <= 13; offset++) {
    const idx = (offset + 7) % 10;
    meals.push(
      { date: d(offset), meal_type: "breakfast", content: breakfasts[idx] },
      { date: d(offset), meal_type: "lunch", content: lunches[idx] },
      { date: d(offset), meal_type: "dinner", content: dinners[idx] }
    );
  }

  await db.insert(mealPlanEntries).values(
    meals.map((m) => ({ flat_id: flat.id, ...m }))
  );

  // ── 5. Tasks — 15 tasks across all statuses ──────────────────────
  const taskRows = [
    // Pending
    { title: "Buy dish soap", assigned_to: pick(0), status: "pending" as const, priority: "normal" as const, category: "household", due_date: d(0) },
    { title: "Pay rent to landlord", assigned_to: pick(2), status: "pending" as const, priority: "urgent" as const, category: "finance", due_date: d(2) },
    { title: "Restock water cans", assigned_to: pick(2), status: "pending" as const, priority: "high" as const, category: "household", due_date: d(1) },
    { title: "Schedule plumber visit", assigned_to: pick(0), status: "pending" as const, priority: "normal" as const, category: "maintenance", due_date: d(3) },
    { title: "Buy new curtains", assigned_to: pick(1), status: "pending" as const, priority: "low" as const, category: "household", due_date: d(5) },
    // In-progress
    { title: "Clean kitchen", assigned_to: pick(1), status: "in_progress" as const, priority: "high" as const, category: "cleaning", due_date: d(0) },
    { title: "Organise shoe rack", assigned_to: pick(0), status: "in_progress" as const, priority: "normal" as const, category: "household", due_date: d(1) },
    { title: "Laundry — bedsheets", assigned_to: pick(2), status: "in_progress" as const, priority: "normal" as const, category: "cleaning", due_date: d(0) },
    // Completed
    { title: "Fix bathroom tap", assigned_to: pick(0), status: "completed" as const, priority: "normal" as const, category: "maintenance", completed_at: subDays(today, 2) },
    { title: "Sweep living room", assigned_to: pick(1), status: "completed" as const, priority: "low" as const, category: "cleaning", completed_at: subDays(today, 1) },
    { title: "Replace gas regulator", assigned_to: pick(2), status: "completed" as const, priority: "urgent" as const, category: "maintenance", completed_at: subDays(today, 3) },
    { title: "Mop all rooms", assigned_to: pick(0), status: "completed" as const, priority: "normal" as const, category: "cleaning", completed_at: subDays(today, 4) },
    { title: "Register for society meeting", assigned_to: pick(1), status: "completed" as const, priority: "low" as const, category: "admin", completed_at: subDays(today, 5) },
    { title: "Collect Amazon parcel", assigned_to: pick(2), status: "completed" as const, priority: "normal" as const, category: "household", completed_at: subDays(today, 1) },
    { title: "Sort recycling bin", assigned_to: pick(0), status: "completed" as const, priority: "low" as const, category: "cleaning", completed_at: subDays(today, 6) },
  ];

  await db.insert(tasks).values(
    taskRows.map((t) => ({ flat_id: flat.id, ...t }))
  );

  return NextResponse.json({
    success: true,
    flat: { id: flat.id, name: flat.name, invite_code: flat.invite_code },
    members: [
      { id: bharath.id, name: "Bharath (admin)" },
      { id: sai.id, name: "Sai" },
      { id: ravi.id, name: "Ravi" },
    ],
    counts: {
      expenses: expenseRows.length,
      meals: meals.length,
      tasks: taskRows.length,
    },
    how_to_use:
      "Set localStorage flatmate_flat_id to the flat.id above, then refresh /app/home.",
    cleanup: "Send DELETE to /api/seed to remove all test data.",
  });
}

// ── DELETE: remove test data ────────────────────────────────────────
export async function DELETE() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Seed only available in development" },
      { status: 403 }
    );
  }

  const [existing] = await db
    .select({ id: flats.id })
    .from(flats)
    .where(eq(flats.invite_code, TEST_INVITE_CODE))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ message: "No test data found" });
  }

  await db.delete(flats).where(eq(flats.id, existing.id)); // cascades all child rows

  return NextResponse.json({ success: true, deleted_flat_id: existing.id });
}
