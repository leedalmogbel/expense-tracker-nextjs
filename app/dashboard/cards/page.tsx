"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CreditCardList } from "@/components/dashboard/credit-card-list"
import { AddCreditCardModal } from "@/components/dashboard/add-credit-card-modal"
import { useDashboardActions } from "@/contexts/dashboard-actions-context"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { CreditCardReminder } from "@/lib/types"

export default function CardsPage() {
  const { openAddExpenseRef, openAddBudgetRef, openAddIncomeRef } = useDashboardActions()
  const [addCardOpen, setAddCardOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardReminder | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleEdit = useCallback((card: CreditCardReminder) => {
    setEditingCard(card)
    setAddCardOpen(true)
  }, [])

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <DashboardHeader
        onAddExpense={() => openAddExpenseRef.current?.()}
        onAddBudget={() => openAddBudgetRef.current?.()}
        onAddIncome={() => openAddIncomeRef.current?.()}
      />
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-muted-foreground">
          Manage credit cards and set payment due date reminders.
        </p>
        <Button
          onClick={() => {
            setEditingCard(null)
            setAddCardOpen(true)
          }}
          className="gap-1.5 h-9 rounded-lg"
        >
          <Plus className="h-4 w-4" /> Add Card
        </Button>
      </div>

      <motion.div
        className="mt-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUpItem}>
          <CreditCardList key={refreshKey} onEdit={handleEdit} onRefresh={handleSaved} />
        </motion.div>
      </motion.div>

      <AddCreditCardModal
        open={addCardOpen}
        onOpenChange={(open) => {
          setAddCardOpen(open)
          if (!open) setEditingCard(null)
        }}
        editingCard={editingCard}
        onSaved={handleSaved}
      />
    </div>
  )
}
