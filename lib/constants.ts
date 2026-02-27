import type { Currency } from "./types"

/** Categories used across the app (add-expense, budgets, etc.). Stored as display label (e.g. "Dine Out" / "Food & Drink"). */
export const CATEGORIES = [
  "Groceries",
  "Food & Drink",
  "Housing",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Health",
  "Education",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]

/** Convert category label to slug value for forms/filtering (e.g. "Food & Drink" → "food-drink") */
export function getCategoryValue(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")
}

/** Convert slug value back to display label; filtering compares normalized category. */
export function getCategoryLabel(value: string): string {
  const found = CATEGORIES.find((c) => getCategoryValue(c) === value.toLowerCase())
  return found ?? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Payment methods */
export const PAYMENT_METHODS = [
  "Cash",
  "Debit Card",
  "Credit Card",
  "Bank Transfer",
  "Other",
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

/** Default currency */
export const DEFAULT_CURRENCY: Currency = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
}

/** Common currencies for settings selector */
export const CURRENCIES: Currency[] = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
]

/** Map category label -> icon name (used in storage; UI maps to Lucide) */
export const CATEGORY_ICONS: Record<string, string> = {
  Groceries: "shopping-cart",
  "Food & Drink": "utensils",
  Housing: "home",
  Transport: "car",
  Entertainment: "music",
  Shopping: "shopping-bag",
  Utilities: "wifi",
  Health: "heart",
  Education: "book-open",
  Other: "circle-dot",
}

/** Category option for selects: value (slug), label (display), icon */
export const CATEGORY_OPTIONS = CATEGORIES.map((label) => ({
  value: getCategoryValue(label),
  label,
  icon: CATEGORY_ICONS[label] ?? "circle-dot",
}))

/** Income categories */
export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
] as const

export type IncomeCategoryType = (typeof INCOME_CATEGORIES)[number]

export const INCOME_CATEGORY_ICONS: Record<string, string> = {
  Salary: "briefcase",
  Freelance: "laptop",
  Business: "building",
  Investment: "trending-up",
  Gift: "gift",
  Other: "circle-dot",
}

export const INCOME_CATEGORY_OPTIONS = INCOME_CATEGORIES.map((label) => ({
  value: label.toLowerCase().replace(/\s+/g, "-"),
  label,
  icon: INCOME_CATEGORY_ICONS[label] ?? "circle-dot",
}))

/** Default category budget splits when creating first budget (% of total). */
export const DEFAULT_CATEGORY_BUDGETS: { category: string; pct: number; icon: string }[] = [
  { category: "Food & Drink", pct: 20, icon: "utensils" },
  { category: "Shopping", pct: 30, icon: "shopping-bag" },
  { category: "Transport", pct: 10, icon: "car" },
  { category: "Entertainment", pct: 16, icon: "music" },
  { category: "Health", pct: 12, icon: "heart" },
  { category: "Utilities", pct: 10, icon: "wifi" },
]
