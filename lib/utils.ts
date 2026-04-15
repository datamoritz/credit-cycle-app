import { CardColor, EventType, ReminderPriority, StatementStatus } from "@/types";

// ─── Formatting ──────────────────────────────────────────────────────────────

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatLocalDateInput(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatLocalMonthInput(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ─── Date constants ───────────────────────────────────────────────────────────

const _now = new Date();
export const TODAY = formatLocalDateInput(_now);
export const CURRENT_MONTH = formatLocalMonthInput(_now);
const _nextMonthDate = new Date(_now.getFullYear(), _now.getMonth() + 1, 1);
export const NEXT_MONTH = formatLocalMonthInput(_nextMonthDate);

// ─── Date helpers ────────────────────────────────────────────────────────────

export function daysUntil(dateStr: string): number {
  const today = new Date(TODAY + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(dateStr: string): boolean {
  return daysUntil(dateStr) < 0;
}

export function isUrgent(dateStr: string, threshold = 7): boolean {
  const d = daysUntil(dateStr);
  return d >= 0 && d <= threshold;
}

export function getDaysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

// ─── Color mappings ──────────────────────────────────────────────────────────

export const CARD_COLOR_MAP: Record<
  CardColor,
  { bg: string; text: string; border: string; accent: string; dot: string; hex: string }
> = {
  // Original Amex — bright royal blue
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    accent: "bg-blue-700",
    dot: "bg-blue-700",
    hex: "#1d4ed8",
  },
  // Discover — orange
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    accent: "bg-orange-500",
    dot: "bg-orange-500",
    hex: "#f97316",
  },
  // Slightly darker blue for secondary Amex card
  teal: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    accent: "bg-indigo-800",
    dot: "bg-indigo-800",
    hex: "#3730a3",
  },
  // Chase / United — dark navy
  navy: {
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300",
    accent: "bg-blue-950",
    dot: "bg-blue-950",
    hex: "#172554",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    accent: "bg-red-600",
    dot: "bg-red-600",
    hex: "#dc2626",
  },
  // Walgreens — red
  purple: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    accent: "bg-red-600",
    dot: "bg-red-600",
    hex: "#dc2626",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    accent: "bg-green-600",
    dot: "bg-green-600",
    hex: "#16a34a",
  },
};

export const EVENT_TYPE_META: Record<
  EventType,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  statement_close: {
    label: "Statement Close",
    color: "text-amber-700",
    bgColor: "bg-amber-50 border-amber-200",
    icon: "calendar",
  },
  payment_due: {
    label: "Payment Due",
    color: "text-red-700",
    bgColor: "bg-red-50 border-red-200",
    icon: "alert-circle",
  },
  recommended_pay_by: {
    label: "Reduce By",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: "clock",
  },
  planned_payment: {
    label: "Planned Payment",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: "check-circle",
  },
  reminder: {
    label: "Reminder",
    color: "text-slate-600",
    bgColor: "bg-slate-50 border-slate-200",
    icon: "bell",
  },
};

export const STATUS_META: Record<
  StatementStatus,
  { label: string; color: string; bg: string }
> = {
  paid_in_full: {
    label: "Paid in Full",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  partially_paid: {
    label: "Partially Paid",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  unpaid: { label: "Unpaid", color: "text-red-700", bg: "bg-red-50" },
  pending: { label: "Pending", color: "text-slate-500", bg: "bg-slate-50" },
};

export const PRIORITY_META: Record<
  ReminderPriority,
  { color: string; dot: string }
> = {
  high: { color: "text-red-600", dot: "bg-red-500" },
  medium: { color: "text-amber-600", dot: "bg-amber-400" },
  low: { color: "text-slate-400", dot: "bg-slate-300" },
};

// ─── Utilization color ───────────────────────────────────────────────────────

export function utilizationColor(pct: number): string {
  if (pct <= 10) return "bg-emerald-400";
  if (pct <= 30) return "bg-yellow-400";
  return "bg-red-500";
}

export function utilizationTextColor(pct: number): string {
  if (pct <= 10) return "text-emerald-700";
  if (pct <= 20) return "text-green-700";
  if (pct <= 30) return "text-yellow-700";
  if (pct <= 50) return "text-orange-700";
  return "text-red-700";
}
