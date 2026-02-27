"use client"

import type { Transaction, MonthlyBudget, Currency, CreditCardReminder, ShoppingTrip } from "./types"
import { STORAGE_KEYS } from "./types"
import { DEFAULT_CURRENCY } from "./constants"

const isClient = typeof window !== "undefined"

function getItem<T>(key: string): T | null {
  if (!isClient) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function setItem(key: string, value: unknown): void {
  if (!isClient) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota or parse error
  }
}

// --- Transactions ---

export function getTransactions(): Transaction[] {
  return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) ?? []
}

export function saveTransactions(transactions: Transaction[]): void {
  setItem(STORAGE_KEYS.TRANSACTIONS, transactions)
}

export function addTransaction(tx: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Transaction {
  const transactions = getTransactions()
  const now = new Date().toISOString()
  const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newTx: Transaction = {
    ...tx,
    id,
    createdAt: now,
    updatedAt: now,
  }
  saveTransactions([newTx, ...transactions])
  return newTx
}

export function updateTransaction(id: string, updates: Partial<Transaction>): void {
  const transactions = getTransactions()
  const index = transactions.findIndex((t) => t.id === id)
  if (index === -1) return
  const updated = {
    ...transactions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  transactions[index] = updated
  saveTransactions(transactions)
}

export function deleteTransaction(id: string): void {
  saveTransactions(getTransactions().filter((t) => t.id !== id))
}

// --- Budgets ---

export function getCurrentMonthlyBudget(): MonthlyBudget | null {
  return getItem<MonthlyBudget | null>(STORAGE_KEYS.CURRENT_BUDGET) ?? null
}

export function setCurrentMonthlyBudget(budget: MonthlyBudget | null): void {
  setItem(STORAGE_KEYS.CURRENT_BUDGET, budget)
}

export function getMonthlyBudgets(): MonthlyBudget[] {
  return getItem<MonthlyBudget[]>(STORAGE_KEYS.MONTHLY_BUDGETS) ?? []
}

export function saveMonthlyBudgets(budgets: MonthlyBudget[]): void {
  setItem(STORAGE_KEYS.MONTHLY_BUDGETS, budgets)
}

// --- Currency ---

export function getCurrency(): Currency {
  return getItem<Currency>(STORAGE_KEYS.CURRENCY) ?? DEFAULT_CURRENCY
}

export function setCurrency(currency: Currency): void {
  setItem(STORAGE_KEYS.CURRENCY, currency)
}

// --- Payment methods (custom list; merged with defaults in app) ---

export function getPaymentMethods(): string[] {
  return getItem<string[]>(STORAGE_KEYS.PAYMENT_METHODS) ?? []
}

export function setPaymentMethods(methods: string[]): void {
  setItem(STORAGE_KEYS.PAYMENT_METHODS, methods)
}

// --- Credit Card Reminders ---

export function getCreditCardReminders(): CreditCardReminder[] {
  return getItem<CreditCardReminder[]>(STORAGE_KEYS.CREDIT_CARD_REMINDERS) ?? []
}

export function saveCreditCardReminders(reminders: CreditCardReminder[]): void {
  setItem(STORAGE_KEYS.CREDIT_CARD_REMINDERS, reminders)
}

export function addCreditCardReminder(
  reminder: Omit<CreditCardReminder, "id" | "createdAt" | "updatedAt">
): CreditCardReminder {
  const reminders = getCreditCardReminders()
  const now = new Date().toISOString()
  const id = `cc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newReminder: CreditCardReminder = { ...reminder, id, createdAt: now, updatedAt: now }
  saveCreditCardReminders([newReminder, ...reminders])
  return newReminder
}

export function updateCreditCardReminder(id: string, updates: Partial<CreditCardReminder>): void {
  const reminders = getCreditCardReminders()
  const index = reminders.findIndex((r) => r.id === id)
  if (index === -1) return
  reminders[index] = { ...reminders[index], ...updates, updatedAt: new Date().toISOString() }
  saveCreditCardReminders(reminders)
}

export function deleteCreditCardReminder(id: string): void {
  saveCreditCardReminders(getCreditCardReminders().filter((r) => r.id !== id))
}

// --- Device ID (for Supabase sync) ---

export function getDeviceId(): string {
  let id = getItem<string>(STORAGE_KEYS.DEVICE_ID)
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    setItem(STORAGE_KEYS.DEVICE_ID, id)
  }
  return id
}

// --- Shopping Trips ---

export function getShoppingTrips(): ShoppingTrip[] {
  return getItem<ShoppingTrip[]>(STORAGE_KEYS.SHOPPING_TRIPS) ?? []
}

export function saveShoppingTrips(trips: ShoppingTrip[]): void {
  setItem(STORAGE_KEYS.SHOPPING_TRIPS, trips)
}

export function addShoppingTrip(trip: Omit<ShoppingTrip, "id" | "createdAt" | "updatedAt">): ShoppingTrip {
  const trips = getShoppingTrips()
  const now = new Date().toISOString()
  const id = `trip-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newTrip: ShoppingTrip = { ...trip, id, createdAt: now, updatedAt: now }
  saveShoppingTrips([newTrip, ...trips])
  return newTrip
}

export function updateShoppingTrip(id: string, updates: Partial<ShoppingTrip>): void {
  const trips = getShoppingTrips()
  const index = trips.findIndex((t) => t.id === id)
  if (index === -1) return
  trips[index] = { ...trips[index], ...updates, updatedAt: new Date().toISOString() }
  saveShoppingTrips(trips)
}

export function deleteShoppingTrip(id: string): void {
  saveShoppingTrips(getShoppingTrips().filter((t) => t.id !== id))
}

export function getActiveShoppingTrip(): ShoppingTrip | null {
  return getShoppingTrips().find((t) => t.status === "active") ?? null
}

// --- Clear all ---

export function clearAllData(): void {
  if (!isClient) return
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}
