"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useExpense } from "@/contexts/expense-context"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { CATEGORIES } from "@/lib/constants"
import { groupTransactionsByDate, formatRelativeDate } from "@/lib/expense-utils"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button as HeroUIButton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react"
import { MoreVertical, Pencil, Trash2, Receipt, CalendarRange, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { EditTransactionModal } from "@/components/dashboard/edit-transaction-modal"
import { deleteHouseholdTransactionByAppId } from "@/lib/supabase-api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { format, startOfWeek, startOfMonth, subDays } from "date-fns"

const PAGE_SIZE = 20

const CHART_COLORS = [
  "bg-primary/10 text-primary",
  "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))]",
  "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]",
  "bg-primary/10 text-primary",
]

function normalizeCategory(cat: string): string {
  return cat.toLowerCase().replace(/\s+/g, "-")
}

const DATE_PRESETS = [
  { label: "This Week", getRange: () => ({ start: format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"), end: format(new Date(), "yyyy-MM-dd") }) },
  { label: "This Month", getRange: () => ({ start: format(startOfMonth(new Date()), "yyyy-MM-dd"), end: format(new Date(), "yyyy-MM-dd") }) },
  { label: "30 Days", getRange: () => ({ start: format(subDays(new Date(), 30), "yyyy-MM-dd"), end: format(new Date(), "yyyy-MM-dd") }) },
  { label: "90 Days", getRange: () => ({ start: format(subDays(new Date(), 90), "yyyy-MM-dd"), end: format(new Date(), "yyyy-MM-dd") }) },
]

export function RecentTransactions() {
  const {
    filteredTransactions,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedMonthFilter,
    setSelectedMonthFilter,
    dateRangeFilter,
    setDateRangeFilter,
    setSelectedDate,
    formatCurrency,
    deleteTransactionById,
  } = useExpense()
  const { user, isSupabaseConfigured } = useAuth()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [page, setPage] = useState(1)

  const categoryOptions = ["all", ...CATEGORIES.map((c) => normalizeCategory(c))]
  const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedTransactions = useMemo(
    () => filteredTransactions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredTransactions, safePage]
  )
  const paginatedGroups = useMemo(
    () => groupTransactionsByDate(paginatedTransactions, formatRelativeDate),
    [paginatedTransactions]
  )

  // Reset page when filters change
  const resetPage = useCallback(() => setPage(1), [])

  const activePresetLabel = useMemo(() => {
    if (!dateRangeFilter) return null
    for (const preset of DATE_PRESETS) {
      const range = preset.getRange()
      if (range.start === dateRangeFilter.start && range.end === dateRangeFilter.end) return preset.label
    }
    return "Custom"
  }, [dateRangeFilter])

  const handlePreset = (preset: (typeof DATE_PRESETS)[number]) => {
    const range = preset.getRange()
    setSelectedDate(null)
    setSelectedMonthFilter(null)
    setDateRangeFilter(range)
    setCustomStart(range.start)
    setCustomEnd(range.end)
    resetPage()
  }

  const handleApplyCustom = () => {
    if (customStart && customEnd && customStart <= customEnd) {
      setSelectedDate(null)
      setSelectedMonthFilter(null)
      setDateRangeFilter({ start: customStart, end: customEnd })
      resetPage()
    }
  }

  const handleClearDateFilter = () => {
    setDateRangeFilter(null)
    setCustomStart("")
    setCustomEnd("")
    resetPage()
  }

  const handleDeleteConfirm = () => {
    if (deletingTransaction) {
      const appId = deletingTransaction.id
      deleteTransactionById(appId)
      if (user && isSupabaseConfigured) {
        deleteHouseholdTransactionByAppId(user.id, appId).catch(() => {})
      }
      toast.success("Transaction deleted", { description: deletingTransaction.description })
      setDeletingTransaction(null)
    }
  }

  return (
    <>
    <Card className="w-full border-border">
      <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Transactions
              </CardTitle>
              {filteredTransactions.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                  {filteredTransactions.length} result{filteredTransactions.length !== 1 ? "s" : ""} &middot; {formatCurrency(filteredTotal)}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Filters section — separate from header for breathing room */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-4 border-b border-border bg-muted/20">
        {/* Date range filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            Date range
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  activePresetLabel === preset.label
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {preset.label}
              </button>
            ))}
            {(dateRangeFilter || selectedMonthFilter) && (
              <button
                type="button"
                onClick={handleClearDateFilter}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-9 w-full max-w-[160px] rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              aria-label="From date"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-9 w-full max-w-[160px] rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              aria-label="To date"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 rounded-lg px-4 text-xs"
              onClick={handleApplyCustom}
              disabled={!customStart || !customEnd || customStart > customEnd}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Category filter */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-accent-foreground">Category</div>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => { setSelectedCategoryFilter(value === "all" ? null : value); resetPage() }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  (value === "all" ? selectedCategoryFilter === null : selectedCategoryFilter === value)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {value === "all" ? "All" : value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </div>
      <CardContent className="px-0 pb-0">
        <div className="divide-y divide-border">
          {filteredTransactions.length === 0 ? (
            <div className="px-4 py-10 sm:px-6 sm:py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Receipt className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No transactions found</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first transaction to get started</p>
            </div>
          ) : (
            paginatedGroups.map((group) => (
              <div key={group.dateKey}>
                <div className="px-4 pt-3 pb-1 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.dateLabel}
                </div>
                {group.transactions.map((tx: Transaction, i: number) => {
                  const Icon = getCategoryIconComponent(tx.icon)
                  const iconBg = CHART_COLORS[i % CHART_COLORS.length]
                  const isIncome = tx.amount > 0
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 transition-colors hover:bg-muted/50 active:bg-muted/60 group"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg",
                          iconBg
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{tx.category}</p>
                      </div>
                      <div className="min-w-0 shrink-0 text-right flex items-center gap-1">
                        <span>
                          <p className={cn(
                            "text-sm font-semibold whitespace-nowrap",
                            isIncome ? "text-primary" : "text-destructive"
                          )}>{formatCurrency(tx.amount)}</p>
                          <p className="text-xs text-muted-foreground">{tx.paymentMethod}</p>
                        </span>
                        <Dropdown placement="bottom-end">
                          <DropdownTrigger>
                            <HeroUIButton
                              isIconOnly
                              variant="light"
                              size="sm"
                              className="min-w-8 w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
                              aria-label="Transaction actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </HeroUIButton>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Edit or delete transaction">
                            <DropdownItem
                              key="edit"
                              startContent={<Pencil className="h-4 w-4" />}
                              onPress={() => setEditingTransaction(tx)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-destructive"
                              color="danger"
                              startContent={<Trash2 className="h-4 w-4" />}
                              onPress={() => setDeletingTransaction(tx)}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
            <p className="text-xs text-muted-foreground tabular-nums">
              {(safePage - 1) * PAGE_SIZE + 1}&ndash;{Math.min(safePage * PAGE_SIZE, filteredTransactions.length)} of {filteredTransactions.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs font-medium text-foreground tabular-nums">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <EditTransactionModal
      open={editingTransaction !== null}
      onOpenChange={(open) => !open && setEditingTransaction(null)}
      transaction={editingTransaction}
    />

    <Modal
      isOpen={deletingTransaction !== null}
      onOpenChange={(open) => !open && setDeletingTransaction(null)}
      placement="center"
      isDismissable
      classNames={{
        base: "border border-border bg-background text-foreground mx-4 shadow-2xl rounded-xl",
        header: "border-b border-border",
        footer: "border-t border-border",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span className="text-lg font-semibold">Delete transaction?</span>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-muted-foreground">
            {deletingTransaction ? (
              <>
                This will permanently remove &quot;{deletingTransaction.description}&quot;. This cannot be undone.
              </>
            ) : (
              "This cannot be undone."
            )}
          </p>
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button variant="outline" onClick={() => setDeletingTransaction(null)} className="rounded-lg">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </>
  )
}
