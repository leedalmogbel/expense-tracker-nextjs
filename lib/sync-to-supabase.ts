"use client"

import type { Transaction, MonthlyBudget, Currency } from "./types"
import { getDeviceId } from "./storage"
import { supabase, isSupabaseConfigured } from "./supabase"

if (!isSupabaseConfigured() && typeof window !== "undefined") {
  console.warn("Supabase env (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) not set; sync disabled.")
}

export interface SyncResult {
  success: boolean
  transactionsCount?: number
  budgetsCount?: number
  error?: string
}

/**
 * Sync transactions and current monthly budget to Supabase.
 * 1. Get/create device_id
 * 2. Insert device_exports row (device_id, email, currency_code)
 * 3. Upsert transactions
 * 4. Upsert monthly_budgets + category_budgets
 */
export async function syncToSupabase(
  transactions: Transaction[],
  currentBudget: MonthlyBudget | null,
  currency: Currency,
  email: string
): Promise<SyncResult> {
  if (!supabase) {
    return { success: false, error: "Supabase is not configured." }
  }

  const deviceId = getDeviceId()
  const exportedAt = new Date().toISOString()

  try {
    // 1. device_exports
    const { error: exportError } = await supabase.from("device_exports").insert({
      device_id: deviceId,
      email: email.trim(),
      currency_code: currency.code,
      exported_at: exportedAt,
    })

    if (exportError) {
      return { success: false, error: exportError.message }
    }

    // 2. Upsert transactions (map app fields -> snake_case)
    if (transactions.length > 0) {
      const rows = transactions.map((t) => ({
        id: t.id,
        device_id: deviceId,
        description: t.description,
        category: t.category,
        amount: t.amount,
        icon: t.icon,
        date: t.date,
        is_positive: t.isPositive ?? t.amount >= 0,
        payment_method: t.paymentMethod,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
      }))
      const { error: txError } = await supabase.from("transactions").upsert(rows, { onConflict: "id" })
      if (txError) return { success: false, error: txError.message }
    }

    // 3. Monthly budget + category_budgets
    if (currentBudget) {
      const { data: mbRow, error: mbError } = await supabase
        .from("monthly_budgets")
        .upsert(
          {
            device_id: deviceId,
            year: currentBudget.year,
            month: currentBudget.month,
            budget: currentBudget.budget,
          },
          { onConflict: "device_id,year,month" }
        )
        .select("id")
        .single()

      if (mbError) return { success: false, error: mbError.message }

      const monthlyBudgetId = mbRow?.id
      if (monthlyBudgetId) {
        await supabase.from("category_budgets").delete().eq("monthly_budget_id", monthlyBudgetId)
        if (currentBudget.categoryBudgets.length > 0) {
          const cbRows = currentBudget.categoryBudgets.map((cb) => ({
            monthly_budget_id: monthlyBudgetId,
            category: cb.category,
            budget: cb.budget,
            icon: cb.icon,
          }))
          const { error: cbError } = await supabase.from("category_budgets").insert(cbRows)
          if (cbError) return { success: false, error: cbError.message }
        }
      }
    }

    return {
      success: true,
      transactionsCount: transactions.length,
      budgetsCount: currentBudget ? 1 : 0,
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Sync failed",
    }
  }
}
