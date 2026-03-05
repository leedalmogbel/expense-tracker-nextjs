"use client"

import type { AppNotification } from "./supabase-api"
import { getCreditCardReminders, getCreditCardPayments, getShoppingTrips } from "./storage"
import { getDueReminders, getCardsWithPaymentStatus, getOrdinalSuffix } from "./expense-utils"

const DISMISSED_KEY = "@expense_tracker:dismissed_local_notifications"

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

// --- Dismissal tracking (per-day in localStorage) ---

function getDismissedIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as { date: string; ids: string[] }
    if (parsed.date === todayKey()) return new Set(parsed.ids)
    return new Set()
  } catch {
    return new Set()
  }
}

export function dismissLocalNotification(id: string): void {
  const dismissed = getDismissedIds()
  dismissed.add(id)
  localStorage.setItem(
    DISMISSED_KEY,
    JSON.stringify({ date: todayKey(), ids: [...dismissed] })
  )
}

// --- Credit card due/overdue notifications ---

function generateCreditCardNotifications(): AppNotification[] {
  const reminders = getCreditCardReminders()
  const payments = getCreditCardPayments()
  const dismissed = getDismissedIds()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const notifications: AppNotification[] = []

  // Cards due soon
  const dueCards = getDueReminders(reminders)
  for (const card of dueCards) {
    const id = `local-card-due-${card.id}-${year}-${month}`
    if (dismissed.has(id)) continue
    notifications.push({
      id,
      user_id: "local",
      household_id: "local",
      type: "card_due",
      title: "Credit Card Due Soon",
      message: `${card.name} payment is due on the ${getOrdinalSuffix(card.dueDay)}`,
      actor_name: null,
      read: false,
      created_at: now.toISOString(),
    })
  }

  // Cards overdue
  const cardsStatus = getCardsWithPaymentStatus(reminders, payments, year, month)
  for (const { card, status } of cardsStatus) {
    if (status !== "overdue") continue
    const id = `local-card-overdue-${card.id}-${year}-${month}`
    if (dismissed.has(id)) continue
    notifications.push({
      id,
      user_id: "local",
      household_id: "local",
      type: "card_overdue",
      title: "Credit Card Payment Overdue",
      message: `${card.name} payment was due on the ${getOrdinalSuffix(card.dueDay)}`,
      actor_name: null,
      read: false,
      created_at: now.toISOString(),
    })
  }

  return notifications
}

// --- Budget threshold notifications ---

function generateBudgetNotifications(
  budgetProgress: { category: string; spent: number; budget: number }[]
): AppNotification[] {
  const dismissed = getDismissedIds()
  const now = new Date()
  const notifications: AppNotification[] = []

  for (const row of budgetProgress) {
    if (row.budget <= 0) continue
    const pct = (row.spent / row.budget) * 100

    if (pct >= 100) {
      const id = `local-budget-exceeded-${row.category}-${now.getFullYear()}-${now.getMonth() + 1}`
      if (dismissed.has(id)) continue
      notifications.push({
        id,
        user_id: "local",
        household_id: "local",
        type: "budget_threshold",
        title: "Budget Exceeded",
        message: `${row.category} spending has exceeded the budget (${Math.round(pct)}%)`,
        actor_name: null,
        read: false,
        created_at: now.toISOString(),
      })
    } else if (pct >= 80) {
      const id = `local-budget-warning-${row.category}-${now.getFullYear()}-${now.getMonth() + 1}`
      if (dismissed.has(id)) continue
      notifications.push({
        id,
        user_id: "local",
        household_id: "local",
        type: "budget_threshold",
        title: "Budget Warning",
        message: `${row.category} spending is at ${Math.round(pct)}% of budget`,
        actor_name: null,
        read: false,
        created_at: now.toISOString(),
      })
    }
  }

  return notifications
}

// --- Shopping trip reminder notifications ---

function generateShoppingTripNotifications(): AppNotification[] {
  const trips = getShoppingTrips()
  const dismissed = getDismissedIds()
  const now = new Date()
  const notifications: AppNotification[] = []

  const activeTrips = trips.filter((t) => t.status === "active")
  for (const trip of activeTrips) {
    const id = `local-shopping-reminder-${trip.id}`
    if (dismissed.has(id)) continue
    const itemCount = trip.items.length
    const label = trip.type === "grocery" ? "Grocery" : "Shopping"
    notifications.push({
      id,
      user_id: "local",
      household_id: "local",
      type: "shopping_reminder",
      title: "Incomplete Shopping Trip",
      message: `You have an active ${label} trip with ${itemCount} item${itemCount !== 1 ? "s" : ""}`,
      actor_name: null,
      read: false,
      created_at: trip.createdAt,
    })
  }

  return notifications
}

// --- Aggregate all local notifications ---

export function generateAllLocalNotifications(
  budgetProgress: { category: string; spent: number; budget: number }[]
): AppNotification[] {
  return [
    ...generateCreditCardNotifications(),
    ...generateBudgetNotifications(budgetProgress),
    ...generateShoppingTripNotifications(),
  ]
}
