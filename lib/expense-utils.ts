"use client"

import type { Transaction, MonthlyBudget, CreditCardReminder } from "./types"
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns"

/** Get current year/month */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

/** Month number (1–12) to full name */
export function getMonthName(month: number): string {
  return format(new Date(2000, month - 1, 1), "MMMM")
}

/** Current week dates (Sun–Sat) as YYYY-MM-DD */
export function getCurrentWeekDates(): string[] {
  const now = new Date()
  const day = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - day)
  const out: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push(format(d, "yyyy-MM-dd"))
  }
  return out
}

/** Filter transactions for a given year/month */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter((t) => {
    const d = t.date
    const [y, m] = d.split("-").map(Number)
    return y === year && m === month
  })
}

/** Sum income (positive amounts) in list */
export function sumIncome(transactions: Transaction[]): number {
  return transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
}

/** Sum expenses (negative amounts) in list, returned as positive number */
export function sumExpenses(transactions: Transaction[]): number {
  return Math.abs(transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0))
}

/** Group expenses by category for current month */
export function getSpendingByCategory(
  transactions: Transaction[],
  year: number,
  month: number
): { category: string; amount: number }[] {
  const byCategory: Record<string, number> = {}
  filterTransactionsByMonth(transactions, year, month)
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + Math.abs(t.amount)
    })
  return Object.entries(byCategory).map(([category, amount]) => ({ category, amount }))
}

/** Build chart data: last 12 months income vs expenses */
export function getChartData(transactions: Transaction[]): { month: string; income: number; expenses: number }[] {
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const result: { month: string; income: number; expenses: number }[] = []

  for (let i = 11; i >= 0; i--) {
    const d = subMonths(new Date(currentYear, currentMonth - 1, 1), i)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const list = filterTransactionsByMonth(transactions, y, m)
    result.push({
      month: format(d, "MMM"),
      income: sumIncome(list),
      expenses: sumExpenses(list),
    })
  }
  return result
}

/** For budget progress: spent per category from current budget's categoryBudgets */
export function getBudgetProgress(
  transactions: Transaction[],
  currentBudget: MonthlyBudget | null,
  year: number,
  month: number
): { category: string; spent: number; budget: number; color: string }[] {
  if (!currentBudget) return []
  const spentByCat = getSpendingByCategory(transactions, year, month)
  const spentMap = Object.fromEntries(spentByCat.map((s) => [s.category, s.amount]))
  const colors = [
    "bg-primary",
    "bg-[hsl(var(--chart-3))]",
    "bg-[hsl(var(--chart-2))]",
    "bg-[hsl(var(--chart-5))]",
    "bg-[hsl(var(--chart-4))]",
    "bg-[hsl(var(--chart-2))]",
  ]
  return currentBudget.categoryBudgets.map((cb, i) => ({
    category: cb.category,
    spent: spentMap[cb.category] ?? 0,
    budget: cb.budget,
    color: colors[i % colors.length],
  }))
}

/** Format relative date for display (Today, Yesterday, or formatted) */
export function formatRelativeDate(dateStr: string): string {
  const d = parseISO(dateStr)
  const today = new Date()
  if (format(d, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) return "Today"
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (format(d, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) return "Yesterday"
  return format(d, "MMM d")
}

/** Spent today (expenses only, absolute value) */
export function getSpentToday(transactions: Transaction[]): number {
  const today = format(new Date(), "yyyy-MM-dd")
  return Math.abs(
    transactions
      .filter((t) => t.date === today && t.amount < 0)
      .reduce((s, t) => s + t.amount, 0)
  )
}

/** Group transactions by date for display. Returns array of { dateLabel, dateKey, transactions } sorted today first. */
export function groupTransactionsByDate(
  transactions: Transaction[],
  formatFn: (dateStr: string) => string
): { dateLabel: string; dateKey: string; transactions: Transaction[] }[] {
  const byDate: Record<string, Transaction[]> = {}
  transactions.forEach((t) => {
    if (!byDate[t.date]) byDate[t.date] = []
    byDate[t.date].push(t)
  })
  const today = format(new Date(), "yyyy-MM-dd")
  const yesterday = format(new Date(Date.now() - 864e5), "yyyy-MM-dd")
  const order = (a: string, b: string) => {
    if (a === today) return -1
    if (b === today) return 1
    if (a === yesterday) return -1
    if (b === yesterday) return 1
    return b.localeCompare(a)
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => order(a, b))
    .map(([dateKey, list]) => ({
      dateLabel: formatFn(dateKey),
      dateKey,
      transactions: list.sort((a, b) => (b.date === a.date ? (b.updatedAt?.localeCompare(a.updatedAt) ?? 0) : 0)),
    }))
}

/** Get previous month's year/month from a given year/month */
export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

/** Calculate month-over-month percentage change */
export function getMonthOverMonthChange(
  current: number,
  previous: number
): { text: string; trend: "up" | "down" | "neutral" } {
  if (previous === 0 && current === 0) return { text: "0%", trend: "neutral" }
  if (previous === 0) return { text: "+100%", trend: "up" }
  const pctChange = ((current - previous) / previous) * 100
  const rounded = Math.abs(pctChange).toFixed(1).replace(/\.0$/, "")
  if (pctChange > 0.5) return { text: `+${rounded}%`, trend: "up" }
  if (pctChange < -0.5) return { text: `-${rounded}%`, trend: "down" }
  return { text: "0%", trend: "neutral" }
}

/** Chart data for last 7 months (rolling from current month). */
export function getChartDataLast7Months(
  transactions: Transaction[]
): { month: string; monthKey: string; year: number; monthNum: number; income: number; expenses: number; total: number }[] {
  const now = new Date()
  const result: { month: string; monthKey: string; year: number; monthNum: number; income: number; expenses: number; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = subMonths(new Date(now.getFullYear(), now.getMonth(), 1), i)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const list = filterTransactionsByMonth(transactions, y, m)
    const income = sumIncome(list)
    const expenses = sumExpenses(list)
    result.push({
      month: format(d, "MMM"),
      monthKey: `${y}-${m}`,
      year: y,
      monthNum: m,
      income,
      expenses,
      total: expenses,
    })
  }
  return result
}

/** Get income transactions for a specific month */
export function getIncomeTransactionsForMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return filterTransactionsByMonth(transactions, year, month).filter((t) => t.amount > 0)
}

/** Income chart data for last N months */
export function getIncomeChartData(
  transactions: Transaction[],
  monthCount: number = 7
): { month: string; monthKey: string; year: number; monthNum: number; income: number }[] {
  const now = new Date()
  const result = []
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = subMonths(new Date(now.getFullYear(), now.getMonth(), 1), i)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const list = filterTransactionsByMonth(transactions, y, m)
    result.push({
      month: format(d, "MMM"),
      monthKey: `${y}-${m}`,
      year: y,
      monthNum: m,
      income: sumIncome(list),
    })
  }
  return result
}

/** Average monthly income over last N months (only months with data) */
export function getAverageMonthlyIncome(transactions: Transaction[], monthCount: number = 6): number {
  const data = getIncomeChartData(transactions, monthCount)
  const withIncome = data.filter((d) => d.income > 0)
  if (withIncome.length === 0) return 0
  return withIncome.reduce((sum, d) => sum + d.income, 0) / withIncome.length
}

/** Group income by category for a month */
export function getIncomeByCategory(
  transactions: Transaction[],
  year: number,
  month: number
): { category: string; amount: number }[] {
  const byCategory: Record<string, number> = {}
  getIncomeTransactionsForMonth(transactions, year, month).forEach((t) => {
    const cat = t.category || "Other"
    byCategory[cat] = (byCategory[cat] ?? 0) + t.amount
  })
  return Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

/** Check which credit card reminders are due within their reminder window */
export function getDueReminders(reminders: CreditCardReminder[]): CreditCardReminder[] {
  const today = new Date()
  const currentDay = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

  return reminders.filter((r) => {
    if (!r.isActive) return false
    const dueDay = Math.min(r.dueDay, daysInMonth)
    let daysUntil = dueDay - currentDay
    if (daysUntil < 0) daysUntil += daysInMonth // wraps to next month
    return daysUntil >= 0 && daysUntil <= r.reminderDaysBefore
  })
}

/** Ordinal suffix for day numbers (1st, 2nd, 3rd, etc.) */
export function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
