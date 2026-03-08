/**
 * Premium feature definitions — used by PremiumContext and PremiumGate
 * to gate access based on the user's subscription plan.
 */

export type PremiumFeatureId =
  | "cloud_sync"
  | "household"
  | "activity_log"
  | "cards_loans"
  | "shopping_trips"
  | "csv_export"
  | "recurring_transactions"

export const PREMIUM_FEATURES: Record<
  PremiumFeatureId,
  { label: string; description: string }
> = {
  cloud_sync: {
    label: "Cloud Sync",
    description: "Sync your data across devices securely in the cloud.",
  },
  household: {
    label: "Household Members",
    description: "Invite family members to share and manage expenses together.",
  },
  activity_log: {
    label: "Activity Log",
    description: "See a detailed log of all household activity and changes.",
  },
  cards_loans: {
    label: "Cards & Loans",
    description: "Track credit cards, loans, and manage payment due dates.",
  },
  shopping_trips: {
    label: "Shopping Trips",
    description: "Plan and track your shopping trips and lists.",
  },
  csv_export: {
    label: "CSV Export/Import",
    description: "Export your data to CSV or import from spreadsheets.",
  },
  recurring_transactions: {
    label: "Recurring Transactions",
    description: "Set up automatic recurring income and expenses.",
  },
}

export const EARLY_ADOPTER_LIMIT = 150
