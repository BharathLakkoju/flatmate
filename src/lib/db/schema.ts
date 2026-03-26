import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const memberRoleEnum = pgEnum("member_role", ["admin", "member"]);

export const expenseCategoryEnum = pgEnum("expense_category", [
  "groceries",
  "meals",
  "utilities",
  "outings",
  "household",
  "other",
]);

export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
  "general",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const resourceStatusEnum = pgEnum("resource_status", [
  "in_stock",
  "refill_soon",
  "out_of_stock",
]);

// Tables
export const flats = pgTable("flats", {
  id: uuid("id").defaultRandom().primaryKey(),
  invite_code: varchar("invite_code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  monthly_budget: integer("monthly_budget").default(15000).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  flat_id: uuid("flat_id")
    .references(() => flats.id, { onDelete: "cascade" })
    .notNull(),
  user_id: uuid("user_id"),
  display_name: varchar("display_name", { length: 100 }).notNull(),
  avatar_url: varchar("avatar_url", { length: 500 }),
  role: memberRoleEnum("role").default("member").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const expenseEntries = pgTable("expense_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  flat_id: uuid("flat_id")
    .references(() => flats.id, { onDelete: "cascade" })
    .notNull(),
  date: date("date").notNull(),
  category: expenseCategoryEnum("category").notNull(),
  amount_inr: numeric("amount_inr", { precision: 10, scale: 2 }).notNull(),
  paid_by: uuid("paid_by")
    .references(() => members.id)
    .notNull(),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const mealPlanEntries = pgTable("meal_plan_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  flat_id: uuid("flat_id")
    .references(() => flats.id, { onDelete: "cascade" })
    .notNull(),
  date: date("date").notNull(),
  meal_type: mealTypeEnum("meal_type").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  flat_id: uuid("flat_id")
    .references(() => flats.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  assigned_to: uuid("assigned_to").references(() => members.id),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: taskPriorityEnum("priority").default("normal").notNull(),
  category: varchar("category", { length: 100 }),
  due_date: date("due_date"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  flat_id: uuid("flat_id")
    .references(() => flats.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  status: resourceStatusEnum("status").default("in_stock").notNull(),
  details: text("details"),
  next_action_date: date("next_action_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
