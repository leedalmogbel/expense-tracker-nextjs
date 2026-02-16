"use client"

import { Search, Plus, ChevronDown, Receipt, Target, ArrowUpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button as HeroUIButton,
} from "@heroui/react"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  onAddExpense: () => void
  onAddBudget: () => void
  onAddIncome: () => void
  /** Number of unread notifications; 0 = show dot only, >0 = show count (9+ for 10+) */
  notificationCount?: number
}

export function DashboardHeader({
  onAddExpense,
  onAddBudget,
  onAddIncome,
}: DashboardHeaderProps) {
  const handleAction = (key: React.Key) => {
    if (key === "expense") onAddExpense()
    else if (key === "budget") onAddBudget()
    else if (key === "income") onAddIncome()
  }

  return (
    <header
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        "pt-2 pb-5 sm:pt-4 sm:pb-6 border-b border-border/60"
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Overview of your finances and activity
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none md:h-5 md:w-5" />
          <Input
            placeholder="Search transactions..."
            className="w-44 sm:w-52 h-10 pl-9 rounded-lg border-input bg-muted/30 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
          <HeroUIButton
            className="w-full sm:w-auto h-11 min-h-[44px] px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2">
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>New Transaction</span>
          </HeroUIButton>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Add options"
            onAction={handleAction}
            className="
              min-w-[12rem]
              bg-content1
              rounded-xl
              shadow-lg
              p-2
            "
          >
            <DropdownItem
              key="expense"
              startContent={<Receipt className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
              className="py-2"
            >
              Add Expense
            </DropdownItem>
            <DropdownItem
              key="budget"
              startContent={<Target className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
              className="py-2"
            >
              Add Budget
            </DropdownItem>
            <DropdownItem
              key="income"
              startContent={<ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />}
              className="py-2"
            >
              Add Income
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}
