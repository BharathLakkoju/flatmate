export type ExpenseCategory =
  | "groceries"
  | "meals"
  | "utilities"
  | "outings"
  | "household"
  | "other";

export type MealType = "breakfast" | "lunch" | "dinner" | "general";

export type TaskStatus = "pending" | "completed";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type ResourceStatus = "in_stock" | "refill_soon" | "out_of_stock";

export type MemberRole = "admin" | "member";

export type CalendarView = "month" | "week" | "day";

export interface Flat {
  id: string;
  invite_code: string;
  name: string;
  monthly_budget: number;
  created_at: string;
}

export interface Member {
  id: string;
  flat_id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  role: MemberRole;
  created_at: string;
}

export interface ExpenseEntry {
  id: string;
  flat_id: string;
  date: string;
  category: ExpenseCategory;
  amount_inr: number;
  paid_by: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  paid_by_member?: Member;
}

export interface MealPlanEntry {
  id: string;
  flat_id: string;
  date: string;
  meal_type: MealType;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  flat_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  assigned_member?: Member;
}

export interface Resource {
  id: string;
  flat_id: string;
  name: string;
  status: ResourceStatus;
  details: string | null;
  next_action_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface DayData {
  date: string;
  expenses: ExpenseEntry[];
  meals: MealPlanEntry[];
  tasks: Task[];
  totalSpend: number;
}
