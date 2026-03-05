"use client"

import { Plus, Receipt, Target, ArrowUpCircle } from "lucide-react"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"

export function FloatingAddButton() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

  const handleAction = (key: React.Key) => {
    if (key === "expense") openAddExpenseRef.current?.()
    else if (key === "budget") openAddBudgetRef.current?.()
    else if (key === "income") openAddIncomeRef.current?.()
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:bottom-6 lg:right-6">
      <Dropdown placement="top-end">
        <DropdownTrigger>
          <button
            type="button"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Add new transaction"
          >
            <Plus className="h-6 w-6" />
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Add options"
          onAction={handleAction}
          className="min-w-[12rem] bg-content1 rounded-xl shadow-lg p-2"
        >
          <DropdownItem
            key="expense"
            startContent={<Receipt className="h-4 w-4 shrink-0" />}
            className="py-2"
          >
            Add Expense
          </DropdownItem>
          <DropdownItem
            key="budget"
            startContent={<Target className="h-4 w-4 shrink-0" />}
            className="py-2"
          >
            Add Budget
          </DropdownItem>
          <DropdownItem
            key="income"
            startContent={<ArrowUpCircle className="h-4 w-4 shrink-0" />}
            className="py-2"
          >
            Add Income
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
