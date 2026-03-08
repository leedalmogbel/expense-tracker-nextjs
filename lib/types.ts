/**
 * Data model aligned with WORKFLOW-INTEGRATION.md (mobile app)
 * Used for localStorage, CSV export, and Supabase sync.
 */

export interface Transaction {
  id: string
  description: string
  category: string
  amount: number // negative = expense, positive = income
  icon: string // icon identifier (maps to Lucide in UI)
  date: string // ISO date (YYYY-MM-DD)
  isPositive?: boolean
  paymentMethod: string
  scope?: "personal" | "household" // default "personal"
  tag?: string // super-category tag (e.g. "NEEDS", "WANTS")
  accountId?: string // optional bank account reference
  createdAt: string // ISO
  updatedAt: string // ISO
}

export interface CategoryBudget {
  category: string
  budget: number
  icon: string
}

export interface MonthlyBudget {
  year: number
  month: number // 1–12
  budget: number // total for month
  categoryBudgets: CategoryBudget[]
  savingsTarget?: number // desired monthly savings
  estimatedCategoryBudgets?: CategoryBudget[] // estimated costs per category
}

export interface Currency {
  code: string // e.g. 'USD'
  symbol: string // e.g. '$'
  name: string // e.g. 'US Dollar'
}

/** Credit card due-date reminder */
export interface CreditCardReminder {
  id: string
  name: string // e.g. "Chase Sapphire"
  lastFourDigits?: string // optional "1234"
  creditLimit?: number // max credit balance of the card
  dueDay: number // 1-31 day of month
  reminderDaysBefore: number // e.g. 3
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Shopping trip item */
export interface ShoppingTripItem {
  id: string
  name: string
  price: number
}

/** Trip type determines expense category */
export type TripType = "grocery" | "shopping"

/** A shopping trip (active or completed) */
export interface ShoppingTrip {
  id: string
  type: TripType
  items: ShoppingTripItem[]
  status: "active" | "completed"
  transactionId?: string
  date: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

/** Individual monthly payment within an installment plan */
export interface InstallmentPayment {
  monthNumber: number // 1-based
  expectedDate: string // YYYY-MM-DD (auto-calculated from startDate)
  status: "pending" | "paid"
  paidAmount?: number // actual amount paid
  paidDate?: string // actual date paid (YYYY-MM-DD)
}

/** Credit card installment plan (e.g. buy item, pay in 6/12/18 months) */
export interface CreditCardInstallment {
  id: string
  cardId: string // references CreditCardReminder.id
  items: string[] // purchased items (multiple possible)
  description?: string // optional extra notes
  startDate: string // first billing date (YYYY-MM-DD)
  totalMonths: number // agreed months (6, 12, 18, etc.)
  totalAmount: number // total purchase price
  monthlyInstallment: number // per month amount
  payments: InstallmentPayment[] // auto-generated schedule
  status: "active" | "completed"
  note?: string // e.g. "Done - Checked in next billing"
  createdAt: string
  updatedAt: string
}

/** Credit card payment record for a specific month */
export interface CreditCardPayment {
  id: string
  cardId: string // references CreditCardReminder.id
  year: number // e.g. 2026
  month: number // 1-12
  amount: number // bill amount paid (positive)
  paidDate: string // YYYY-MM-DD
  note?: string // e.g. "Full balance", "Minimum payment"
  createdAt: string
  updatedAt: string
}

/** Super-category tag mapping */
export interface TagMapping {
  tag: string
  label: string
  icon: string
  color: string
  categories: string[] // category names assigned to this tag
}

/** Recurring bill/transaction template */
export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  category: string
  tag?: string
  paymentMethod: string
  dueDay: number // 1-31
  frequency: "monthly"
  accountId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Bank / e-wallet / cash account */
export interface BankAccount {
  id: string
  name: string
  type: "bank" | "ewallet" | "cash"
  initialBalance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Expected income source */
export interface IncomeSource {
  id: string
  name: string
  expectedAmount: number
  payDay: number | "EOM" // 1-31 or end-of-month
  category: string
  accountId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Loan / amortization */
export interface Loan {
  id: string
  name: string
  totalAmount: number
  monthlyPayment: number
  totalMonths: number
  startDate: string // YYYY-MM-DD
  dueDay: number // 1-31
  payments: LoanPayment[]
  note?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoanPayment {
  id: string
  monthNumber: number
  amount: number
  paidDate: string
  note?: string
}

/** Project expense group */
export interface Project {
  id: string
  name: string
  budget?: number
  items: ProjectItem[]
  status: "active" | "completed"
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface ProjectItem {
  id: string
  name: string
  cost: number
  date: string
  note?: string
}

/** Storage keys (same concept as AsyncStorage on mobile) */
export const STORAGE_KEYS = {
  TRANSACTIONS: "@expense_tracker:transactions",
  MONTHLY_BUDGETS: "@expense_tracker:monthly_budgets",
  CURRENT_BUDGET: "@expense_tracker:current_budget",
  CURRENCY: "@expense_tracker:currency",
  PAYMENT_METHODS: "@expense_tracker:payment_methods",
  DEVICE_ID: "@expense_tracker:device_id",
  CREDIT_CARD_REMINDERS: "@expense_tracker:credit_card_reminders",
  SHOPPING_TRIPS: "@expense_tracker:shopping_trips",
  CREDIT_CARD_PAYMENTS: "@expense_tracker:credit_card_payments",
  CREDIT_CARD_INSTALLMENTS: "@expense_tracker:credit_card_installments",
  TAG_MAPPINGS: "@expense_tracker:tag_mappings",
  RECURRING_TRANSACTIONS: "@expense_tracker:recurring_transactions",
  BANK_ACCOUNTS: "@expense_tracker:bank_accounts",
  INCOME_SOURCES: "@expense_tracker:income_sources",
  LOANS: "@expense_tracker:loans",
  PROJECTS: "@expense_tracker:projects",
  ONBOARDING_DISMISSED: "@expense_tracker:onboarding_dismissed",
} as const
