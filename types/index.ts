// ─── Card ────────────────────────────────────────────────────────────────────

export type CardColor =
  | "blue"
  | "orange"
  | "teal"
  | "navy"
  | "red"
  | "purple"
  | "green";

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  last4: string;
  color: CardColor;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  utilization: number; // 0–100
  statementCloseDay: number; // day of month
  dueDay: number; // day of month after statement close
  postingBufferDays: number;
  nextCloseDate: string; // ISO date string
  nextDueDate: string; // ISO date string
  recommendedPayByDate: string; // ISO date string
  minimumPayment: number;
  apr: number;
  rewards?: string;
  autoPay?: boolean;
  activeSince?: string; // ISO date string "YYYY-MM-DD"
}

// ─── Statement ───────────────────────────────────────────────────────────────

export type StatementStatus =
  | "paid_in_full"
  | "partially_paid"
  | "unpaid"
  | "pending";

export interface Statement {
  id: string;
  cardId: string;
  statementMonth: string; // "YYYY-MM"
  closingDate: string; // ISO date string
  dueDate: string; // ISO date string
  statementBalance: number;
  minimumPayment: number;
  paidAmount: number;
  paidDate?: string; // ISO date string
  remainingAmount: number;
  status: StatementStatus;
  isProjected?: boolean;
}

// ─── Timeline Event ──────────────────────────────────────────────────────────

export type EventType =
  | "statement_close"
  | "payment_due"
  | "recommended_pay_by"
  | "planned_payment"
  | "reminder";

export interface TimelineEvent {
  id: string;
  cardId: string;
  date: string; // ISO date string
  type: EventType;
  label: string;
  amount?: number;
  note?: string;
  urgent?: boolean;
}

// ─── Reminder ────────────────────────────────────────────────────────────────

export type ReminderPriority = "high" | "medium" | "low";

export interface Reminder {
  id: string;
  cardId: string;
  date: string;
  title: string;
  note?: string;
  type: EventType;
  priority: ReminderPriority;
  amount?: number;
  actionRequired: boolean;
}

// ─── Monthly Summary ─────────────────────────────────────────────────────────

export interface MonthlyCardObligation {
  cardId: string;
  dueDate: string;
  statementBalance: number;
  minimumPayment: number;
  remainingAmount: number;
  status: StatementStatus;
  statementMonth: string;
  isProjected: boolean;
}

export interface MonthlySummary {
  month: string; // "YYYY-MM"
  totalDue: number;
  totalMinimumDue: number;
  totalProjected: number;
  obligations: MonthlyCardObligation[];
}
