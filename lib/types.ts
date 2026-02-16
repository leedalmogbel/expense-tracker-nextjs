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
}

export interface Currency {
  code: string // e.g. 'USD'
  symbol: string // e.g. '$'
  name: string // e.g. 'US Dollar'
}

/** Storage keys (same concept as AsyncStorage on mobile) */
export const STORAGE_KEYS = {
  TRANSACTIONS: "@expense_tracker:transactions",
  MONTHLY_BUDGETS: "@expense_tracker:monthly_budgets",
  CURRENT_BUDGET: "@expense_tracker:current_budget",
  CURRENCY: "@expense_tracker:currency",
  PAYMENT_METHODS: "@expense_tracker:payment_methods",
  DEVICE_ID: "@expense_tracker:device_id",
} as const
