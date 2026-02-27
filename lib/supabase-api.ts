"use client"

import type { Transaction, MonthlyBudget } from "./types"
import type { AccountType, CategoryType } from "./supabase-db-types"
import { PAYMENT_METHOD_TO_ACCOUNT_TYPE } from "./supabase-db-types"
import { supabase } from "./supabase"
import { getTransactions, getCurrentMonthlyBudget } from "./storage"
import { CATEGORY_ICONS } from "./constants"

const DEFAULT_HOUSEHOLD_NAME = "My Household"

/**
 * Ensure the user has a profile row. Upsert by id.
 */
export async function ensureProfile(userId: string, fullName?: string | null): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase is not configured." }
  const { error } = await supabase.from("profiles").upsert(
    { id: userId, full_name: fullName ?? null },
    { onConflict: "id" }
  )
  return { error: error?.message ?? null }
}

/**
 * Get or create a default household for the user (as owner).
 */
export async function getOrCreateDefaultHousehold(
  userId: string,
  name: string = DEFAULT_HOUSEHOLD_NAME
): Promise<{ householdId: string | null; error: string | null }> {
  if (!supabase) return { householdId: null, error: "Supabase is not configured." }

  const { data: existing } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .single()

  if (existing?.id) return { householdId: existing.id, error: null }

  const { data: inserted, error } = await supabase
    .from("households")
    .insert({ name, owner_id: userId })
    .select("id")
    .single()

  if (error) return { householdId: null, error: error.message }
  return { householdId: inserted?.id ?? null, error: null }
}

/**
 * Ensure the user is a member of the household (owner role if they created it).
 */
export async function ensureHouseholdMember(
  householdId: string,
  userId: string,
  role: "owner" | "admin" | "member" = "owner"
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase is not configured." }

  const { data: existing } = await supabase
    .from("household_members")
    .select("id")
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .single()

  if (existing) return { error: null }

  const { error } = await supabase.from("household_members").insert({
    household_id: householdId,
    user_id: userId,
    role,
  })
  return { error: error?.message ?? null }
}

/**
 * Get or create an account by name for the household. Type is derived from payment method name.
 */
export async function getOrCreateAccount(
  householdId: string,
  name: string,
  type: AccountType
): Promise<{ accountId: string | null; error: string | null }> {
  if (!supabase) return { accountId: null, error: "Supabase is not configured." }

  const { data: existing } = await supabase
    .from("accounts")
    .select("id")
    .eq("household_id", householdId)
    .eq("name", name)
    .limit(1)
    .single()

  if (existing?.id) return { accountId: existing.id, error: null }

  const { data: inserted, error } = await supabase
    .from("accounts")
    .insert({ household_id: householdId, name, type })
    .select("id")
    .single()

  if (error) return { accountId: null, error: error.message }
  return { accountId: inserted?.id ?? null, error: null }
}

/**
 * Get or create a category by name for the household.
 */
export async function getOrCreateCategory(
  householdId: string,
  name: string,
  type: CategoryType,
  icon: string | null = null
): Promise<{ categoryId: string | null; error: string | null }> {
  if (!supabase) return { categoryId: null, error: "Supabase is not configured." }

  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("household_id", householdId)
    .eq("name", name)
    .eq("type", type)
    .limit(1)
    .single()

  if (existing?.id) return { categoryId: existing.id, error: null }

  const { data: inserted, error } = await supabase
    .from("categories")
    .insert({ household_id: householdId, name, type, icon })
    .select("id")
    .single()

  if (error) return { categoryId: null, error: error.message }
  return { categoryId: inserted?.id ?? null, error: null }
}

/**
 * Map app payment method name to DB account type.
 */
function getAccountTypeForPaymentMethod(paymentMethod: string): AccountType {
  return PAYMENT_METHOD_TO_ACCOUNT_TYPE[paymentMethod] ?? "bank"
}

/** Row shape when selecting transactions with account and category names (Supabase may use singular or plural relation keys) */
type TransactionRow = {
  id: string
  type: "income" | "expense"
  amount: number
  note: string | null
  transaction_date: string
  created_at: string
  app_id: string | null
  accounts?: { name: string } | null
  categories?: { name: string; icon: string | null } | null
  account?: { name: string } | null
  category?: { name: string; icon: string | null } | null
}

/**
 * Fetch all transactions for the user's household from Supabase and map to app Transaction format.
 * Use this to load cloud data into the app when the user signs in.
 */
export async function fetchHouseholdTransactions(
  userId: string
): Promise<{ transactions: Transaction[]; error: string | null }> {
  if (!supabase) return { transactions: [], error: "Supabase is not configured." }

  const { householdId, error: houseError } = await getOrCreateDefaultHousehold(userId)
  if (houseError || !householdId) return { transactions: [], error: houseError ?? "Could not get household." }

  const { data: rows, error } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, note, transaction_date, created_at, app_id, account_id, category_id, accounts(name), categories(name, icon)"
    )
    .eq("household_id", householdId)
    .order("transaction_date", { ascending: false })

  if (error) return { transactions: [], error: error.message }
  const list = (rows ?? []) as unknown as TransactionRow[]

  const transactions: Transaction[] = list.map((row) => {
    const category = row.categories ?? row.category
    const account = row.accounts ?? row.account
    const categoryName = category?.name ?? "Other"
    const paymentMethod = account?.name ?? "Other"
    const icon = category?.icon ?? CATEGORY_ICONS[categoryName] ?? "circle-dot"
    const amount = row.type === "expense" ? -row.amount : row.amount
    const id = row.app_id ?? row.id
    return {
      id,
      description: row.note ?? "",
      category: categoryName,
      amount,
      icon,
      date: row.transaction_date,
      paymentMethod,
      createdAt: row.created_at,
      updatedAt: row.created_at,
    }
  })

  return { transactions, error: null }
}

/**
 * Sync app transactions to Supabase. Fetches existing app_ids first to avoid
 * duplicate inserts, then batch-inserts new transactions and updates existing ones.
 * Avoids PostgREST upsert (which doesn't support the partial unique index on app_id).
 */
export async function syncTransactionsToHousehold(
  householdId: string,
  userId: string,
  transactions: Transaction[]
): Promise<{ count: number; error: string | null }> {
  if (!supabase) return { count: 0, error: "Supabase is not configured." }
  if (transactions.length === 0) return { count: 0, error: null }

  // 1. Fetch existing app_ids for this household so we know what to insert vs update
  const { data: existingRows, error: fetchError } = await supabase
    .from("transactions")
    .select("id, app_id")
    .eq("household_id", householdId)
    .not("app_id", "is", null)

  if (fetchError) return { count: 0, error: fetchError.message }

  const existingAppIdMap = new Map<string, string>()
  for (const row of existingRows ?? []) {
    if (row.app_id) existingAppIdMap.set(row.app_id, row.id)
  }

  // 2. Resolve accounts and categories (cached)
  const accountCache = new Map<string, string>()
  const categoryCache = new Map<string, string>()

  for (const t of transactions) {
    const paymentMethod = t.paymentMethod || "Other"
    const accountKey = `${householdId}:${paymentMethod}`
    if (!accountCache.has(accountKey)) {
      const acctType = getAccountTypeForPaymentMethod(paymentMethod)
      const res = await getOrCreateAccount(householdId, paymentMethod, acctType)
      if (res.error) return { count: 0, error: res.error }
      if (res.accountId) accountCache.set(accountKey, res.accountId)
    }

    const type: "income" | "expense" = t.amount >= 0 ? "income" : "expense"
    const categoryName = t.category || "Other"
    const categoryKey = `${householdId}:${categoryName}:${type}`
    if (!categoryCache.has(categoryKey)) {
      const icon = CATEGORY_ICONS[categoryName] ?? null
      const res = await getOrCreateCategory(householdId, categoryName, type, icon)
      if (res.error) return { count: 0, error: res.error }
      if (res.categoryId) categoryCache.set(categoryKey, res.categoryId)
    }
  }

  // 3. Split into new (insert) vs existing (update)
  const toInsert: Record<string, unknown>[] = []
  const toUpdate: { dbId: string; row: Record<string, unknown> }[] = []

  for (const t of transactions) {
    const type: "income" | "expense" = t.amount >= 0 ? "income" : "expense"
    const categoryName = t.category || "Other"
    const paymentMethod = t.paymentMethod || "Other"
    const accountId = accountCache.get(`${householdId}:${paymentMethod}`) ?? null
    const categoryId = categoryCache.get(`${householdId}:${categoryName}:${type}`) ?? null

    const row = {
      household_id: householdId,
      account_id: accountId,
      category_id: categoryId,
      created_by: userId,
      type,
      amount: Math.abs(t.amount),
      note: t.description || null,
      transaction_date: t.date,
      app_id: t.id,
    }

    const existingDbId = existingAppIdMap.get(t.id)
    if (existingDbId) {
      toUpdate.push({ dbId: existingDbId, row })
    } else {
      toInsert.push(row)
    }
  }

  // 4. Batch insert new transactions
  if (toInsert.length > 0) {
    const { error } = await supabase.from("transactions").insert(toInsert)
    if (error) return { count: 0, error: error.message }
  }

  // 5. Update existing transactions one-by-one (PostgREST batch update requires RPC)
  for (const { dbId, row } of toUpdate) {
    const { household_id: _h, app_id: _a, ...updateFields } = row as Record<string, unknown>
    const { error } = await supabase
      .from("transactions")
      .update(updateFields)
      .eq("id", dbId)
    if (error) return { count: toInsert.length, error: error.message }
  }

  return { count: transactions.length, error: null }
}

/**
 * Sync app monthly budget (with category breakdown) to Supabase budgets table.
 */
export async function syncBudgetsToHousehold(
  householdId: string,
  budget: MonthlyBudget
): Promise<{ count: number; error: string | null }> {
  if (!supabase) return { count: 0, error: "Supabase is not configured." }

  let count = 0
  for (const cb of budget.categoryBudgets) {
    const { categoryId, error: catError } = await getOrCreateCategory(
      householdId,
      cb.category,
      "expense",
      cb.icon ?? null
    )
    if (catError) return { count: 0, error: catError }
    if (!categoryId) continue

    const { error } = await supabase.from("budgets").upsert(
      {
        household_id: householdId,
        category_id: categoryId,
        month: budget.month,
        year: budget.year,
        amount: cb.budget,
      },
      { onConflict: "household_id,category_id,month,year" }
    )
    if (error) return { count: 0, error: error.message }
    count++
  }
  return { count, error: null }
}

/**
 * Full sync: ensure profile, household, member; then sync transactions and budgets.
 */
export async function syncToHousehold(
  userId: string,
  userEmail: string | null,
  transactions: Transaction[],
  currentBudget: MonthlyBudget | null
): Promise<{ success: boolean; transactionsCount?: number; budgetsCount?: number; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase is not configured." }

  const { error: profileError } = await ensureProfile(userId, null)
  if (profileError) return { success: false, error: profileError }

  const { householdId, error: houseError } = await getOrCreateDefaultHousehold(userId, DEFAULT_HOUSEHOLD_NAME)
  if (houseError || !householdId) return { success: false, error: houseError ?? "Could not get or create household." }

  const { error: memberError } = await ensureHouseholdMember(householdId, userId, "owner")
  if (memberError) return { success: false, error: memberError }

  const { count: txCount, error: txError } = await syncTransactionsToHousehold(householdId, userId, transactions)
  if (txError) return { success: false, error: txError }

  let budgetsCount = 0
  if (currentBudget && currentBudget.categoryBudgets.length > 0) {
    const { count, error: budgetError } = await syncBudgetsToHousehold(householdId, currentBudget)
    if (budgetError) return { success: false, error: budgetError }
    budgetsCount = count
  }

  return {
    success: true,
    transactionsCount: txCount,
    budgetsCount,
  }
}

/**
 * Sync a single transaction to Supabase. Use this after add/edit instead of
 * re-syncing every transaction. Only 3-5 requests instead of N+3.
 */
export async function syncSingleTransaction(
  userId: string,
  transaction: Transaction
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase is not configured." }

  const { householdId, error: houseError } = await getOrCreateDefaultHousehold(userId)
  if (houseError || !householdId) return { success: false, error: houseError ?? "Could not get household." }

  const type: "income" | "expense" = transaction.amount >= 0 ? "income" : "expense"
  const categoryName = transaction.category || "Other"
  const paymentMethod = transaction.paymentMethod || "Other"

  const acctType = getAccountTypeForPaymentMethod(paymentMethod)
  const { accountId, error: acctErr } = await getOrCreateAccount(householdId, paymentMethod, acctType)
  if (acctErr) return { success: false, error: acctErr }

  const icon = CATEGORY_ICONS[categoryName] ?? null
  const { categoryId, error: catErr } = await getOrCreateCategory(householdId, categoryName, type, icon)
  if (catErr) return { success: false, error: catErr }

  // Check if this transaction already exists in the DB
  const { data: existing } = await supabase
    .from("transactions")
    .select("id")
    .eq("household_id", householdId)
    .eq("app_id", transaction.id)
    .limit(1)
    .maybeSingle()

  const row = {
    account_id: accountId,
    category_id: categoryId,
    created_by: userId,
    type,
    amount: Math.abs(transaction.amount),
    note: transaction.description || null,
    transaction_date: transaction.date,
  }

  if (existing?.id) {
    const { error } = await supabase.from("transactions").update(row).eq("id", existing.id)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from("transactions").insert({
      ...row,
      household_id: householdId,
      app_id: transaction.id,
    })
    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Sync current localStorage data to the user's household. Call after add/edit transaction
 * when user is signed in so the database stays in sync.
 * Guarded against concurrent calls — if a sync is already running, the call is skipped.
 */
let _syncInProgress = false
export async function syncCurrentDataToHousehold(
  userId: string,
  userEmail: string | null
): Promise<{ success: boolean; error?: string }> {
  if (_syncInProgress) return { success: true } // skip, already syncing
  _syncInProgress = true
  try {
    const transactions = getTransactions()
    const currentBudget = getCurrentMonthlyBudget()
    const r = await syncToHousehold(userId, userEmail, transactions, currentBudget)
    return r.success ? { success: true } : { success: false, error: r.error }
  } finally {
    _syncInProgress = false
  }
}

/**
 * Delete a transaction in Supabase by app_id (so local delete stays in sync with DB).
 */
export async function deleteHouseholdTransactionByAppId(
  userId: string,
  appTransactionId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase is not configured." }
  const { householdId, error: houseError } = await getOrCreateDefaultHousehold(userId)
  if (houseError || !householdId) return { error: houseError ?? "Could not get household." }
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("household_id", householdId)
    .eq("app_id", appTransactionId)
  return { error: error?.message ?? null }
}

// ─── Household Invite / Collaboration ────────────────────────────────────────

/**
 * Get the user's owned household ID.
 */
export async function getUserHouseholdId(
  userId: string
): Promise<{ householdId: string | null; error: string | null }> {
  if (!supabase) return { householdId: null, error: "Supabase is not configured." }
  const { data, error } = await supabase
    .from("households")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .single()
  if (error) return { householdId: null, error: error.message }
  return { householdId: data?.id ?? null, error: null }
}

/**
 * Get the household ID where the user is a member (owner OR invited member).
 */
export async function getUserMemberHouseholdId(
  userId: string
): Promise<{ householdId: string | null; error: string | null }> {
  if (!supabase) return { householdId: null, error: "Supabase is not configured." }
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .limit(1)
    .single()
  if (error) return { householdId: null, error: error.message }
  return { householdId: data?.household_id ?? null, error: null }
}

/**
 * Create an invite for a household. Returns the invite ID (used to build the link).
 */
export async function inviteToHousehold(
  householdId: string,
  email: string,
  role: "admin" | "member" = "member"
): Promise<{ inviteId: string | null; error: string | null }> {
  if (!supabase) return { inviteId: null, error: "Supabase is not configured." }
  const { data, error } = await supabase
    .from("household_invites")
    .insert({ household_id: householdId, email: email.toLowerCase().trim(), role, status: "pending" })
    .select("id")
    .single()
  if (error) return { inviteId: null, error: error.message }
  return { inviteId: data?.id ?? null, error: null }
}

/**
 * List all invites for a household.
 */
export async function getHouseholdInvites(
  householdId: string
): Promise<{ invites: { id: string; email: string; role: string; status: string; created_at: string }[]; error: string | null }> {
  if (!supabase) return { invites: [], error: "Supabase is not configured." }
  const { data, error } = await supabase
    .from("household_invites")
    .select("id, email, role, status, created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
  if (error) return { invites: [], error: error.message }
  return { invites: data ?? [], error: null }
}

/**
 * Check if a user has pending invites by their email.
 */
export async function getPendingInvitesForEmail(
  email: string
): Promise<{ invites: { id: string; household_id: string; role: string }[]; error: string | null }> {
  if (!supabase) return { invites: [], error: "Supabase is not configured." }
  const { data, error } = await supabase
    .from("household_invites")
    .select("id, household_id, role")
    .eq("email", email.toLowerCase().trim())
    .eq("status", "pending")
  if (error) return { invites: [], error: error.message }
  return { invites: data ?? [], error: null }
}

/**
 * Fetch a single invite by ID (for the acceptance page).
 */
export async function getInviteById(
  inviteId: string
): Promise<{ invite: { id: string; household_id: string; email: string; role: string; status: string; households?: { name: string } | null } | null; error: string | null }> {
  if (!supabase) return { invite: null, error: "Supabase is not configured." }
  const { data, error } = await supabase
    .from("household_invites")
    .select("id, household_id, email, role, status, households(name)")
    .eq("id", inviteId)
    .single()
  if (error) return { invite: null, error: error.message }
  return { invite: data as { id: string; household_id: string; email: string; role: string; status: string; households?: { name: string } | null } | null, error: null }
}

/**
 * Accept an invite: mark as accepted and add user to household_members.
 */
export async function acceptInvite(
  inviteId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase is not configured." }

  // Fetch the invite
  const { invite, error: fetchError } = await getInviteById(inviteId)
  if (fetchError || !invite) return { error: fetchError ?? "Invite not found." }
  if (invite.status !== "pending") return { error: "This invite has already been used." }

  // Add user to household
  const role = invite.role as "admin" | "member"
  const { error: memberError } = await ensureHouseholdMember(invite.household_id, userId, role)
  if (memberError) return { error: memberError }

  // Mark invite as accepted
  const { error: updateError } = await supabase
    .from("household_invites")
    .update({ status: "accepted" })
    .eq("id", inviteId)
  if (updateError) return { error: updateError.message }

  return { error: null }
}

/**
 * List members of a household with profile info.
 */
export async function getHouseholdMembers(
  householdId: string
): Promise<{ members: { user_id: string; role: string; full_name: string | null }[]; error: string | null }> {
  if (!supabase) return { members: [], error: "Supabase is not configured." }
  const { data, error } = await supabase
    .from("household_members")
    .select("user_id, role, profiles(full_name)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true })
  if (error) return { members: [], error: error.message }
  const members = (data ?? []).map((row: Record<string, unknown>) => {
    const profiles = row.profiles as { full_name: string | null } | null
    return {
      user_id: row.user_id as string,
      role: row.role as string,
      full_name: profiles?.full_name ?? null,
    }
  })
  return { members, error: null }
}

/**
 * Remove a member from a household.
 */
export async function removeHouseholdMember(
  householdId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase is not configured." }
  const { error } = await supabase
    .from("household_members")
    .delete()
    .eq("household_id", householdId)
    .eq("user_id", userId)
  return { error: error?.message ?? null }
}

/**
 * Revoke (delete) a pending invite.
 */
export async function revokeInvite(
  inviteId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: "Supabase is not configured." }
  const { error } = await supabase
    .from("household_invites")
    .delete()
    .eq("id", inviteId)
  return { error: error?.message ?? null }
}
