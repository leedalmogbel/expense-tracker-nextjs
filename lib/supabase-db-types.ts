/**
 * Types matching the Supabase schema in docs/supabase.md
 */

export type Profile = {
  id: string
  full_name: string | null
  created_at: string
}

export type Household = {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export type HouseholdMemberRole = "owner" | "admin" | "member"

export type HouseholdMember = {
  id: string
  household_id: string
  user_id: string
  role: HouseholdMemberRole
  created_at: string
}

export type AccountType = "cash" | "bank" | "credit_card" | "ewallet"

export type Account = {
  id: string
  household_id: string
  name: string
  type: AccountType
  balance: number
  created_at: string
}

export type CategoryType = "income" | "expense"

export type Category = {
  id: string
  household_id: string
  name: string
  type: CategoryType
  color: string | null
  icon: string | null
  created_at: string
}

export type TransactionType = "income" | "expense"

export type DbTransaction = {
  id: string
  household_id: string
  account_id: string | null
  category_id: string | null
  created_by: string | null
  type: TransactionType
  amount: number
  note: string | null
  transaction_date: string
  created_at: string
  app_id: string | null
}

export type Budget = {
  id: string
  household_id: string
  category_id: string
  month: number
  year: number
  amount: number
  created_at: string
}

/** Payment method name (app) -> account type (DB). Unknown names default to bank in API. */
export const PAYMENT_METHOD_TO_ACCOUNT_TYPE: Record<string, AccountType> = {
  Cash: "cash",
  "Debit Card": "bank",
  "Credit Card": "credit_card",
  "Bank Transfer": "bank",
  Other: "bank",
  PayPal: "ewallet",
  Venmo: "ewallet",
}
