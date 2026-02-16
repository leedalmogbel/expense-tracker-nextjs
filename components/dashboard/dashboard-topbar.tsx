"use client"

import Link from "next/link"
import { Bell, Search, Plus, Settings, Moon, Sun, ChevronDown, Receipt, Target, ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button as HeroUIButton,
} from "@heroui/react"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { useTheme } from "next-themes"

interface DashboardTopbarProps {
  /** Unread notification count */
  notificationCount?: number
}

export function DashboardTopbar({ notificationCount = 3 }: DashboardTopbarProps) {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()
  const { theme, setTheme } = useTheme()
  const hasNotifications = notificationCount > 0
  const badgeLabel = notificationCount >= 10 ? "9+" : String(notificationCount)

  const handleAction = (key: React.Key) => {
    if (key === "expense") openAddExpenseRef.current?.()
    else if (key === "budget") openAddBudgetRef.current?.()
    else if (key === "income") openAddIncomeRef.current?.()
  }

  return (
    <header className="z-30 hidden h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6 shadow-sm lg:flex">
      <div className="relative w-full max-w-sm shrink-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none lg:h-5 lg:w-5" />
        <Input
          placeholder="Search transactions..."
          className="h-10 w-full pl-9 pr-8 rounded-lg border-border bg-muted/30 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
          /
        </kbd>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground xl:h-12 xl:w-12"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 xl:h-6 xl:w-6" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 xl:h-6 xl:w-6" />
        </Button>
        <span className="relative inline-flex shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl xl:h-12 xl:w-12"
            aria-label={hasNotifications ? `${notificationCount} unread notifications` : "Notifications"}
          >
            <Bell className="h-5 w-5 px-0 xl:h-6 xl:w-6" />
          </Button>
          {hasNotifications && (
            <span
              className="absolute right-0 top-0 flex min-h-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[11px] font-semibold tabular-nums leading-none text-white"
              aria-hidden
            >
              {badgeLabel}
            </span>
          )}
        </span>
        {/* <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl" asChild>
          <Link href="/dashboard/settings" aria-label="Settings">
            <Settings className="h-6 w-6" />
          </Link>
        </Button> */}
        {/* <Dropdown>
          <DropdownTrigger>
            <HeroUIButton className="h-11 gap-2 rounded-xl px-4 text-sm font-medium bg-primary text-primary-foreground">
              <Plus className="h-6 w-6" />
              Add
              <ChevronDown className="h-4 w-4 opacity-70" />
            </HeroUIButton>
          </DropdownTrigger>
          <DropdownMenu aria-label="Add options" onAction={handleAction}>
            <DropdownItem key="expense" startContent={<Receipt className="h-4 w-4" />}>
              Add Expense
            </DropdownItem>
            <DropdownItem key="budget" startContent={<Target className="h-4 w-4" />}>
              Add Budget
            </DropdownItem>
            <DropdownItem key="income" startContent={<ArrowUpCircle className="h-4 w-4" />}>
              Add Income
            </DropdownItem>
          </DropdownMenu>
        </Dropdown> */}
      </div>
    </header>
  )
}
