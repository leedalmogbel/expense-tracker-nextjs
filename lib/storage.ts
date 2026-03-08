"use client"

import type { Transaction, MonthlyBudget, Currency, CreditCardReminder, CreditCardPayment, CreditCardInstallment, ShoppingTrip, TagMapping, RecurringTransaction, BankAccount, IncomeSource, Loan, Project } from "./types"
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

// --- Credit Card Payments ---

export function getCreditCardPayments(): CreditCardPayment[] {
  return getItem<CreditCardPayment[]>(STORAGE_KEYS.CREDIT_CARD_PAYMENTS) ?? []
}

export function saveCreditCardPayments(payments: CreditCardPayment[]): void {
  setItem(STORAGE_KEYS.CREDIT_CARD_PAYMENTS, payments)
}

export function addCreditCardPayment(
  payment: Omit<CreditCardPayment, "id" | "createdAt" | "updatedAt">
): CreditCardPayment {
  const payments = getCreditCardPayments()
  const now = new Date().toISOString()
  const id = `ccpay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newPayment: CreditCardPayment = { ...payment, id, createdAt: now, updatedAt: now }
  saveCreditCardPayments([newPayment, ...payments])
  return newPayment
}

export function updateCreditCardPayment(id: string, updates: Partial<CreditCardPayment>): void {
  const payments = getCreditCardPayments()
  const index = payments.findIndex((p) => p.id === id)
  if (index === -1) return
  payments[index] = { ...payments[index], ...updates, updatedAt: new Date().toISOString() }
  saveCreditCardPayments(payments)
}

export function deleteCreditCardPayment(id: string): void {
  saveCreditCardPayments(getCreditCardPayments().filter((p) => p.id !== id))
}

// --- Credit Card Installments ---

export function getCreditCardInstallments(): CreditCardInstallment[] {
  return getItem<CreditCardInstallment[]>(STORAGE_KEYS.CREDIT_CARD_INSTALLMENTS) ?? []
}

export function saveCreditCardInstallments(installments: CreditCardInstallment[]): void {
  setItem(STORAGE_KEYS.CREDIT_CARD_INSTALLMENTS, installments)
}

export function addCreditCardInstallment(
  installment: Omit<CreditCardInstallment, "id" | "createdAt" | "updatedAt">
): CreditCardInstallment {
  const installments = getCreditCardInstallments()
  const now = new Date().toISOString()
  const id = `inst-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newInst: CreditCardInstallment = { ...installment, id, createdAt: now, updatedAt: now }
  saveCreditCardInstallments([newInst, ...installments])
  return newInst
}

export function updateCreditCardInstallment(id: string, updates: Partial<CreditCardInstallment>): void {
  const installments = getCreditCardInstallments()
  const index = installments.findIndex((i) => i.id === id)
  if (index === -1) return
  installments[index] = { ...installments[index], ...updates, updatedAt: new Date().toISOString() }
  saveCreditCardInstallments(installments)
}

export function deleteCreditCardInstallment(id: string): void {
  saveCreditCardInstallments(getCreditCardInstallments().filter((i) => i.id !== id))
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

// --- Tag Mappings ---

export function getTagMappings(): TagMapping[] {
  return getItem<TagMapping[]>(STORAGE_KEYS.TAG_MAPPINGS) ?? []
}

export function saveTagMappings(mappings: TagMapping[]): void {
  setItem(STORAGE_KEYS.TAG_MAPPINGS, mappings)
}

// --- Recurring Transactions ---

export function getRecurringTransactions(): RecurringTransaction[] {
  return getItem<RecurringTransaction[]>(STORAGE_KEYS.RECURRING_TRANSACTIONS) ?? []
}

export function saveRecurringTransactions(items: RecurringTransaction[]): void {
  setItem(STORAGE_KEYS.RECURRING_TRANSACTIONS, items)
}

export function addRecurringTransaction(
  item: Omit<RecurringTransaction, "id" | "createdAt" | "updatedAt">
): RecurringTransaction {
  const items = getRecurringTransactions()
  const now = new Date().toISOString()
  const id = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newItem: RecurringTransaction = { ...item, id, createdAt: now, updatedAt: now }
  saveRecurringTransactions([newItem, ...items])
  return newItem
}

export function updateRecurringTransaction(id: string, updates: Partial<RecurringTransaction>): void {
  const items = getRecurringTransactions()
  const index = items.findIndex((i) => i.id === id)
  if (index === -1) return
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() }
  saveRecurringTransactions(items)
}

export function deleteRecurringTransaction(id: string): void {
  saveRecurringTransactions(getRecurringTransactions().filter((i) => i.id !== id))
}

// --- Bank Accounts ---

export function getBankAccounts(): BankAccount[] {
  return getItem<BankAccount[]>(STORAGE_KEYS.BANK_ACCOUNTS) ?? []
}

export function saveBankAccounts(accounts: BankAccount[]): void {
  setItem(STORAGE_KEYS.BANK_ACCOUNTS, accounts)
}

export function addBankAccount(
  account: Omit<BankAccount, "id" | "createdAt" | "updatedAt">
): BankAccount {
  const accounts = getBankAccounts()
  const now = new Date().toISOString()
  const id = `acct-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newAcct: BankAccount = { ...account, id, createdAt: now, updatedAt: now }
  saveBankAccounts([newAcct, ...accounts])
  return newAcct
}

export function updateBankAccount(id: string, updates: Partial<BankAccount>): void {
  const accounts = getBankAccounts()
  const index = accounts.findIndex((a) => a.id === id)
  if (index === -1) return
  accounts[index] = { ...accounts[index], ...updates, updatedAt: new Date().toISOString() }
  saveBankAccounts(accounts)
}

export function deleteBankAccount(id: string): void {
  saveBankAccounts(getBankAccounts().filter((a) => a.id !== id))
}

// --- Income Sources ---

export function getIncomeSources(): IncomeSource[] {
  return getItem<IncomeSource[]>(STORAGE_KEYS.INCOME_SOURCES) ?? []
}

export function saveIncomeSources(sources: IncomeSource[]): void {
  setItem(STORAGE_KEYS.INCOME_SOURCES, sources)
}

export function addIncomeSource(
  source: Omit<IncomeSource, "id" | "createdAt" | "updatedAt">
): IncomeSource {
  const sources = getIncomeSources()
  const now = new Date().toISOString()
  const id = `isrc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newSrc: IncomeSource = { ...source, id, createdAt: now, updatedAt: now }
  saveIncomeSources([newSrc, ...sources])
  return newSrc
}

export function updateIncomeSource(id: string, updates: Partial<IncomeSource>): void {
  const sources = getIncomeSources()
  const index = sources.findIndex((s) => s.id === id)
  if (index === -1) return
  sources[index] = { ...sources[index], ...updates, updatedAt: new Date().toISOString() }
  saveIncomeSources(sources)
}

export function deleteIncomeSource(id: string): void {
  saveIncomeSources(getIncomeSources().filter((s) => s.id !== id))
}

// --- Loans ---

export function getLoans(): Loan[] {
  return getItem<Loan[]>(STORAGE_KEYS.LOANS) ?? []
}

export function saveLoans(loans: Loan[]): void {
  setItem(STORAGE_KEYS.LOANS, loans)
}

export function addLoan(loan: Omit<Loan, "id" | "createdAt" | "updatedAt">): Loan {
  const loans = getLoans()
  const now = new Date().toISOString()
  const id = `loan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newLoan: Loan = { ...loan, id, createdAt: now, updatedAt: now }
  saveLoans([newLoan, ...loans])
  return newLoan
}

export function updateLoan(id: string, updates: Partial<Loan>): void {
  const loans = getLoans()
  const index = loans.findIndex((l) => l.id === id)
  if (index === -1) return
  loans[index] = { ...loans[index], ...updates, updatedAt: new Date().toISOString() }
  saveLoans(loans)
}

export function deleteLoan(id: string): void {
  saveLoans(getLoans().filter((l) => l.id !== id))
}

// --- Projects ---

export function getProjects(): Project[] {
  return getItem<Project[]>(STORAGE_KEYS.PROJECTS) ?? []
}

export function saveProjects(projects: Project[]): void {
  setItem(STORAGE_KEYS.PROJECTS, projects)
}

export function addProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Project {
  const projects = getProjects()
  const now = new Date().toISOString()
  const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  const newProj: Project = { ...project, id, createdAt: now, updatedAt: now }
  saveProjects([newProj, ...projects])
  return newProj
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const projects = getProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return
  projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() }
  saveProjects(projects)
}

export function deleteProject(id: string): void {
  saveProjects(getProjects().filter((p) => p.id !== id))
}

// --- Onboarding ---

export function isOnboardingDismissed(): boolean {
  return getItem<boolean>(STORAGE_KEYS.ONBOARDING_DISMISSED) ?? false
}

export function setOnboardingDismissed(value: boolean): void {
  setItem(STORAGE_KEYS.ONBOARDING_DISMISSED, value)
}

// --- Clear all ---

export function clearAllData(): void {
  if (!isClient) return
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
}
