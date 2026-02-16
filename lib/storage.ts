"use client"

import type { Transaction, MonthlyBudget, Currency } from "./types"
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

// --- Device ID (for Supabase sync) ---

export function getDeviceId(): string {
  let id = getItem<string>(STORAGE_KEYS.DEVICE_ID)
  if (!id) {
    id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    setItem(STORAGE_KEYS.DEVICE_ID, id)
  }
  return id
}

// --- Clear all ---

export function clearAllData(): void {
  if (!isClient) return
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}
