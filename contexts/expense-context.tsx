"use client"

import * as React from "react"
import type { Transaction, MonthlyBudget, Currency } from "@/lib/types"
import {
  getTransactions,
  saveTransactions,
  getCurrentMonthlyBudget,
  setCurrentMonthlyBudget,
  getMonthlyBudgets,
  saveMonthlyBudgets,
  getCurrency,
  setCurrency as storageSetCurrency,
  getPaymentMethods as getStoredPaymentMethods,
  setPaymentMethods as storageSetPaymentMethods,
  addTransaction as storageAddTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/lib/storage"
import {
  getCurrentYearMonth,
  getPreviousMonth,
  filterTransactionsByMonth,
  sumIncome,
  sumExpenses,
  getChartData,
  getChartDataLast7Months,
  getSpendingByCategory,
  getBudgetProgress,
  formatRelativeDate,
  getSpentToday,
  groupTransactionsByDate,
  getIncomeTransactionsForMonth,
  getIncomeChartData,
  getAverageMonthlyIncome,
  getIncomeByCategory,
} from "@/lib/expense-utils"
import { format } from "date-fns"
import { CATEGORY_ICONS, PAYMENT_METHODS } from "@/lib/constants"

type MonthFilter = { year: number; month: number } | null

type ExpenseContextValue = {
  transactions: Transaction[]
  currentBudget: MonthlyBudget | null
  currency: Currency
  year: number
  month: number
  currentMonthTransactions: Transaction[]
  monthlyIncome: number
  monthlyExpenses: number
  totalBalance: number
  spentToday: number
  chartData: { month: string; income: number; expenses: number }[]
  chartData7Months: { month: string; monthKey: string; year: number; monthNum: number; income: number; expenses: number; total: number }[]
  categoryBreakdown: { name: string; value: number; color: string }[]
  budgetProgress: { category: string; spent: number; budget: number; color: string }[]
  selectedMonthFilter: MonthFilter
  setSelectedMonthFilter: (v: MonthFilter) => void
  selectedDate: string | null
  setSelectedDate: (v: string | null) => void
  selectedCategoryFilter: string | null
  setSelectedCategoryFilter: (v: string | null) => void
  dateRangeFilter: { start: string; end: string } | null
  setDateRangeFilter: (v: { start: string; end: string } | null) => void
  filteredTransactions: Transaction[]
  groupedTransactions: { dateLabel: string; dateKey: string; transactions: Transaction[] }[]
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => Transaction
  updateTransactionById: (id: string, updates: Partial<Transaction>) => void
  deleteTransactionById: (id: string) => void
  setCurrentBudget: (budget: MonthlyBudget | null) => void
  refresh: () => void
  formatRelativeDate: (dateStr: string) => string
  formatCurrency: (amount: number) => string
  setCurrency: (currency: Currency) => void
  prevMonthIncome: number
  prevMonthExpenses: number
  searchQuery: string
  setSearchQuery: (q: string) => void
  paymentMethods: string[]
  addPaymentMethod: (name: string) => void
  removePaymentMethod: (name: string) => void
  incomeTransactions: Transaction[]
  incomeChartData: { month: string; monthKey: string; year: number; monthNum: number; income: number }[]
  averageMonthlyIncome: number
  incomeByCategoryData: { category: string; amount: number }[]
}

const ExpenseContext = React.createContext<ExpenseContextValue | null>(null)

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-1))",
]

function normalizeCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-")
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [currentBudget, setCurrentBudgetState] = React.useState<MonthlyBudget | null>(null)
  const [currency, setCurrencyState] = React.useState<Currency>(() => getCurrency())
  const setCurrency = React.useCallback((c: Currency) => {
    storageSetCurrency(c)
    setCurrencyState(c)
  }, [])
  const [paymentMethods, setPaymentMethodsState] = React.useState<string[]>(() => {
    const stored = getStoredPaymentMethods()
    const defaults = [...PAYMENT_METHODS]
    if (stored.length === 0) {
      storageSetPaymentMethods(defaults)
      return defaults
    }
    const hasAllDefaults = defaults.every((d) => stored.includes(d))
    if (!hasAllDefaults) {
      const merged = [...new Set([...defaults, ...stored])]
      storageSetPaymentMethods(merged)
      return merged
    }
    return stored
  })
  const addPaymentMethod = React.useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setPaymentMethodsState((prev) => {
      if (prev.includes(trimmed)) return prev
      const next = [...prev, trimmed]
      storageSetPaymentMethods(next)
      return next
    })
  }, [])
  const removePaymentMethod = React.useCallback((name: string) => {
    setPaymentMethodsState((prev) => {
      const next = prev.filter((m) => m !== name)
      if (next.length === 0) return prev
      storageSetPaymentMethods(next)
      return next
    })
  }, [])
  const [selectedMonthFilter, setSelectedMonthFilter] = React.useState<MonthFilter>(null)
  const [selectedDate, setSelectedDate] = React.useState<string | null>(() => format(new Date(), "yyyy-MM-dd"))
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string | null>(null)
  const [dateRangeFilter, setDateRangeFilter] = React.useState<{ start: string; end: string } | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  const refresh = React.useCallback(() => {
    setTransactions(getTransactions())
    setCurrentBudgetState(getCurrentMonthlyBudget())
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const { year, month } = getCurrentYearMonth()
  const filterYear = selectedMonthFilter?.year ?? year
  const filterMonth = selectedMonthFilter?.month ?? month
  const currentMonthTransactions = React.useMemo(
    () => filterTransactionsByMonth(transactions, year, month),
    [transactions, year, month]
  )
  const monthlyIncome = React.useMemo(() => sumIncome(currentMonthTransactions), [currentMonthTransactions])
  const monthlyExpenses = React.useMemo(() => sumExpenses(currentMonthTransactions), [currentMonthTransactions])
  const prevMonth = React.useMemo(() => getPreviousMonth(year, month), [year, month])
  const prevMonthTransactions = React.useMemo(
    () => filterTransactionsByMonth(transactions, prevMonth.year, prevMonth.month),
    [transactions, prevMonth.year, prevMonth.month]
  )
  const prevMonthIncome = React.useMemo(() => sumIncome(prevMonthTransactions), [prevMonthTransactions])
  const prevMonthExpenses = React.useMemo(() => sumExpenses(prevMonthTransactions), [prevMonthTransactions])
  const totalBalance = React.useMemo(
    () => transactions.reduce((s, t) => s + t.amount, 0),
    [transactions]
  )
  const spentToday = React.useMemo(() => getSpentToday(transactions), [transactions])
  const chartData = React.useMemo(() => getChartData(transactions), [transactions])
  const chartData7Months = React.useMemo(() => getChartDataLast7Months(transactions), [transactions])
  const spendingByCat = React.useMemo(
    () => getSpendingByCategory(transactions, year, month),
    [transactions, year, month]
  )
  const categoryBreakdown = React.useMemo(
    () =>
      spendingByCat.map((s, i) => ({
        name: s.category,
        value: s.amount,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [spendingByCat]
  )
  const budgetProgress = React.useMemo(
    () => getBudgetProgress(transactions, currentBudget, year, month),
    [transactions, currentBudget, year, month]
  )
  const incomeTransactions = React.useMemo(
    () => getIncomeTransactionsForMonth(transactions, year, month),
    [transactions, year, month]
  )
  const incomeChartData = React.useMemo(
    () => getIncomeChartData(transactions, 7),
    [transactions]
  )
  const averageMonthlyIncome = React.useMemo(
    () => getAverageMonthlyIncome(transactions, 6),
    [transactions]
  )
  const incomeByCategoryData = React.useMemo(
    () => getIncomeByCategory(transactions, year, month),
    [transactions, year, month]
  )
  const filteredTransactions = React.useMemo(() => {
    let list: Transaction[]
    if (dateRangeFilter) {
      list = transactions.filter((t) => t.date >= dateRangeFilter.start && t.date <= dateRangeFilter.end)
    } else if (selectedDate != null) {
      list = transactions.filter((t) => t.date === selectedDate)
    } else {
      list = filterTransactionsByMonth(transactions, filterYear, filterMonth)
    }
    if (selectedCategoryFilter != null && selectedCategoryFilter !== "all") {
      const norm = selectedCategoryFilter.toLowerCase()
      list = list.filter((t) => normalizeCategory(t.category) === norm)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => (b.date === a.date ? (b.updatedAt?.localeCompare(a.updatedAt) ?? 0) : b.date.localeCompare(a.date)))
  }, [transactions, filterYear, filterMonth, selectedDate, selectedCategoryFilter, searchQuery, dateRangeFilter])
  const groupedTransactions = React.useMemo(
    () => groupTransactionsByDate(filteredTransactions, (dateStr) => formatRelativeDate(dateStr)),
    [filteredTransactions]
  )
  const formatCurrency = React.useCallback(
    (amount: number) => {
      const abs = Math.abs(amount)
      const formatted = currency.symbol + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      return amount >= 0 ? `+${formatted}` : `-${formatted}`
    },
    [currency]
  )

  const addTransaction = React.useCallback(
    (tx: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
      const newTx = storageAddTransaction(tx)
      setTransactions(getTransactions())
      return newTx
    },
    []
  )

  const updateTransactionById = React.useCallback((id: string, updates: Partial<Transaction>) => {
    updateTransaction(id, updates)
    setTransactions(getTransactions())
  }, [])

  const deleteTransactionById = React.useCallback((id: string) => {
    deleteTransaction(id)
    setTransactions(getTransactions())
  }, [])

  const setCurrentBudget = React.useCallback((budget: MonthlyBudget | null) => {
    setCurrentMonthlyBudget(budget)
    setCurrentBudgetState(budget)
    if (budget) {
      const all = getMonthlyBudgets()
      const idx = all.findIndex((b) => b.year === budget.year && b.month === budget.month)
      const next = idx >= 0 ? all.map((b, i) => (i === idx ? budget : b)) : [...all, budget]
      saveMonthlyBudgets(next)
    }
  }, [])

  const value: ExpenseContextValue = React.useMemo(() => ({
    transactions,
    currentBudget,
    currency,
    year,
    month,
    currentMonthTransactions,
    monthlyIncome,
    monthlyExpenses,
    totalBalance,
    spentToday,
    chartData,
    chartData7Months,
    categoryBreakdown,
    budgetProgress,
    selectedMonthFilter,
    setSelectedMonthFilter,
    selectedDate,
    setSelectedDate,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    dateRangeFilter,
    setDateRangeFilter,
    filteredTransactions,
    groupedTransactions,
    addTransaction,
    updateTransactionById,
    deleteTransactionById,
    setCurrentBudget,
    refresh,
    formatRelativeDate,
    formatCurrency,
    setCurrency,
    prevMonthIncome,
    prevMonthExpenses,
    searchQuery,
    setSearchQuery,
    paymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    incomeTransactions,
    incomeChartData,
    averageMonthlyIncome,
    incomeByCategoryData,
  }), [
    transactions, currentBudget, currency, year, month,
    currentMonthTransactions, monthlyIncome, monthlyExpenses, totalBalance, spentToday,
    chartData, chartData7Months, categoryBreakdown, budgetProgress,
    selectedMonthFilter, selectedDate, selectedCategoryFilter, dateRangeFilter,
    filteredTransactions, groupedTransactions,
    addTransaction, updateTransactionById, deleteTransactionById, setCurrentBudget,
    refresh, formatCurrency, setCurrency,
    prevMonthIncome, prevMonthExpenses, searchQuery, paymentMethods,
    addPaymentMethod, removePaymentMethod,
    incomeTransactions, incomeChartData, averageMonthlyIncome, incomeByCategoryData,
  ])

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}

export function useExpense() {
  const ctx = React.useContext(ExpenseContext)
  if (!ctx) throw new Error("useExpense must be used within ExpenseProvider")
  return ctx
}

/** Category icon name -> for UI we export mapping; components can map to Lucide */
export { CATEGORY_ICONS }
