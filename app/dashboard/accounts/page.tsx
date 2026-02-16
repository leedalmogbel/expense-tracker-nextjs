"use client"

import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { CreditCard } from "lucide-react"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"

export default function AccountsPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />

      <Card className="border-border mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <CreditCard className="h-7 w-7" />
          </div>
          <h2 className="font-heading text-lg font-semibold text-foreground">Accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Link bank accounts or payment methods here. This section can be expanded later.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 text-sm font-medium text-primary hover:underline"
          >
            Back to Overview
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
