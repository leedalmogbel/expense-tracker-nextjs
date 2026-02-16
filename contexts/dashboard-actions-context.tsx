"use client"

import * as React from "react"

export type AddModalType = "expense" | "budget" | "income"

type DashboardActionsContextValue = {
  openAddModalRef: React.MutableRefObject<((type?: AddModalType) => void) | null>
  openAddExpenseRef: React.MutableRefObject<(() => void) | null>
  openAddBudgetRef: React.MutableRefObject<(() => void) | null>
  openAddIncomeRef: React.MutableRefObject<(() => void) | null>
}

const DashboardActionsContext = React.createContext<DashboardActionsContextValue | null>(null)

const noop = () => {}

export function DashboardActionsProvider({ children }: { children: React.ReactNode }) {
  const openAddModalRef = React.useRef<((type?: AddModalType) => void) | null>(null)
  const openAddExpenseRef = React.useRef<(() => void) | null>(null)
  const openAddBudgetRef = React.useRef<(() => void) | null>(null)
  const openAddIncomeRef = React.useRef<(() => void) | null>(null)
  const value = React.useMemo(
    () => ({ openAddModalRef, openAddExpenseRef, openAddBudgetRef, openAddIncomeRef }),
    []
  )
  return (
    <DashboardActionsContext.Provider value={value}>
      {children}
    </DashboardActionsContext.Provider>
  )
}

export function useDashboardActions() {
  const ctx = React.useContext(DashboardActionsContext)
  if (!ctx)
    return {
      openAddModalRef: { current: null },
      openAddExpenseRef: { current: null },
      openAddBudgetRef: { current: null },
      openAddIncomeRef: { current: null },
    }
  return ctx
}
