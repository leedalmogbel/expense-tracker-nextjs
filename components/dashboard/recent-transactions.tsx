"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useExpense } from "@/contexts/expense-context"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { CATEGORIES } from "@/lib/constants"
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
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { EditTransactionModal } from "@/components/dashboard/edit-transaction-modal"
import { Button } from "@/components/ui/button"

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

export function RecentTransactions() {
  const {
    groupedTransactions,
    filteredTransactions,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    formatCurrency,
    deleteTransactionById,
  } = useExpense()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  const categoryOptions = ["all", ...CATEGORIES.map((c) => normalizeCategory(c))]
  const filteredTotal = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

  const handleDeleteConfirm = () => {
    if (deletingTransaction) {
      deleteTransactionById(deletingTransaction.id)
      setDeletingTransaction(null)
    }
  }

  return (
    <>
    <Card className="border-border">
      <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Recent Transactions
          </CardTitle>
          {filteredTransactions.length > 0 && (
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              Total: {formatCurrency(filteredTotal)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {categoryOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedCategoryFilter(value === "all" ? null : value)}
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
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="divide-y divide-border">
          {filteredTransactions.length === 0 ? (
            <div className="px-4 py-6 sm:px-6 sm:py-8 text-center text-sm text-muted-foreground">
              No transactions found
            </div>
          ) : (
            groupedTransactions.map((group) => (
              <div key={group.dateKey}>
                <div className="px-4 pt-3 pb-1 sm:px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {group.dateLabel}
                </div>
                {group.transactions.map((tx, i) => {
                  const Icon = getCategoryIconComponent(tx.icon)
                  const iconBg = CHART_COLORS[i % CHART_COLORS.length]
                  const isIncome = tx.amount > 0
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 transition-colors hover:bg-muted/50 group"
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
                        <span
                          className={cn(
                            "text-sm font-semibold whitespace-nowrap",
                            isIncome ? "text-primary" : "text-destructive"
                          )}
                        >
                          {formatCurrency(tx.amount)}
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
