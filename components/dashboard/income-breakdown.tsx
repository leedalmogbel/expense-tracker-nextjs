"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { getCategoryIconComponent } from "@/lib/category-icons"
import { EditTransactionModal } from "@/components/dashboard/edit-transaction-modal"
import { toast } from "sonner"
import { Wallet, Pencil, Trash2, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button as HeroUIButton,
} from "@heroui/react"
import type { Transaction } from "@/lib/types"

const CHART_COLORS = [
  "bg-primary/10 text-primary",
  "bg-[hsl(var(--chart-2))]/10 text-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-4))]/10 text-[hsl(var(--chart-4))]",
]

export function IncomeBreakdown() {
  const { incomeTransactions, formatCurrency, formatRelativeDate, deleteTransactionById, currency } = useExpense()
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const total = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0)

  return (
    <>
      <Card className="w-full border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Income This Month
              </CardTitle>
              {incomeTransactions.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                  {incomeTransactions.length} transaction{incomeTransactions.length !== 1 ? "s" : ""} &middot; Total {currency.symbol}{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
          {incomeTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No income this month</p>
              <p className="text-xs text-muted-foreground mt-1">Add income to see your breakdown</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {incomeTransactions.map((tx, i) => {
                const Icon = getCategoryIconComponent(tx.icon)
                return (
                  <li
                    key={tx.id}
                    className="flex items-center gap-3 py-3 first:pt-0"
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", CHART_COLORS[i % CHART_COLORS.length])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} &middot; {formatRelativeDate(tx.date)} &middot; {tx.paymentMethod}
                      </p>
                    </div>
                    <span className="text-sm font-semibold shrink-0 text-primary">
                      {formatCurrency(tx.amount)}
                    </span>
                    <Dropdown>
                      <DropdownTrigger>
                        <HeroUIButton
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="min-w-8 h-8 text-muted-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </HeroUIButton>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Actions" className="bg-content1 rounded-xl shadow-lg p-1">
                        <DropdownItem
                          key="edit"
                          startContent={<Pencil className="h-3.5 w-3.5" />}
                          onPress={() => {
                            setEditingTx(tx)
                            setEditOpen(true)
                          }}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          startContent={<Trash2 className="h-3.5 w-3.5" />}
                          className="text-destructive"
                          color="danger"
                          onPress={() => {
                            deleteTransactionById(tx.id)
                            toast.success("Income deleted", { description: tx.description })
                          }}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <EditTransactionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        transaction={editingTx}
      />
    </>
  )
}
