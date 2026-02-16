"use client"

import type { Transaction, MonthlyBudget, Currency } from "./types"

function escapeCsvValue(value: string | number): string {
  const s = String(value)
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/**
 * Build a single CSV string from transactions + current budget + currency.
 * Same structure as mobile: Transactions section then Budget section.
 */
export function buildCsv(
  transactions: Transaction[],
  currentBudget: MonthlyBudget | null,
  currency: Currency
): string {
  const lines: string[] = []

  // 1. Transactions section
  lines.push("Date,Description,Category,Amount,Type,Payment Method,Created At")
  for (const t of transactions) {
    const type = t.isPositive ?? t.amount >= 0 ? "Income" : "Expense"
    lines.push(
      [
        t.date,
        escapeCsvValue(t.description),
        escapeCsvValue(t.category),
        t.amount,
        type,
        escapeCsvValue(t.paymentMethod),
        t.createdAt,
      ].join(",")
    )
  }

  lines.push("") // blank line

  // 2. Budget section
  lines.push("Year,Month,Budget,Category,Category Budget")
  if (currentBudget) {
    lines.push(
      [
        currentBudget.year,
        currentBudget.month,
        currentBudget.budget,
        "(Total)",
        currentBudget.budget,
      ].join(",")
    )
    for (const cb of currentBudget.categoryBudgets) {
      lines.push(
        [
          currentBudget.year,
          currentBudget.month,
          currentBudget.budget,
          escapeCsvValue(cb.category),
          cb.budget,
        ].join(",")
      )
    }
  }

  return lines.join("\n")
}

/**
 * Trigger download of CSV in the browser (replaces Share.share() on mobile).
 */
export function downloadCsv(csvContent: string, filename = "expense-export.csv"): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
