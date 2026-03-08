"use client"

import { useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { CreditCardList } from "@/components/dashboard/credit-card-list"
import { AddCreditCardModal } from "@/components/dashboard/add-credit-card-modal"
import { LoanList } from "@/components/dashboard/loan-list"
import { staggerContainer, fadeUpItem } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { CreditCardReminder } from "@/lib/types"
import { PremiumGate } from "@/components/auth/premium-gate"

type Tab = "cards" | "loans"

const TAB_DESCRIPTIONS: Record<Tab, string> = {
  cards: "Manage credit cards and set payment due date reminders.",
  loans: "Track loans, amortizations, and record monthly payments.",
}

export default function CardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cards")
  const [addCardOpen, setAddCardOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardReminder | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const openAddLoanRef = useRef<(() => void) | null>(null)

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handleEdit = useCallback((card: CreditCardReminder) => {
    setEditingCard(card)
    setAddCardOpen(true)
  }, [])

  return (
    <PremiumGate feature="cards_loans">
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center rounded-full border border-border bg-muted/30 p-0.5 gap-0.5">
            <button
              onClick={() => setActiveTab("cards")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                activeTab === "cards"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Credit Cards
            </button>
            <button
              onClick={() => setActiveTab("loans")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all duration-200",
                activeTab === "loans"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Loans
            </button>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block">
            {TAB_DESCRIPTIONS[activeTab]}
          </p>
        </div>

        {activeTab === "cards" && (
          <Button
            onClick={() => {
              setEditingCard(null)
              setAddCardOpen(true)
            }}
            className="gap-1.5 h-9 rounded-lg"
          >
            <Plus className="h-4 w-4" /> Add Card
          </Button>
        )}
        {activeTab === "loans" && (
          <Button
            onClick={() => openAddLoanRef.current?.()}
            className="gap-1.5 h-9 rounded-lg"
          >
            <Plus className="h-4 w-4" /> Add Loan
          </Button>
        )}
      </div>

      {/* Mobile description */}
      <p className="text-sm text-muted-foreground mt-2 sm:hidden">
        {TAB_DESCRIPTIONS[activeTab]}
      </p>

      {activeTab === "cards" && (
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
      )}

      {activeTab === "loans" && (
        <motion.div
          className="mt-8 space-y-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUpItem}>
            <LoanList key={refreshKey} openAddLoanRef={openAddLoanRef} />
          </motion.div>
        </motion.div>
      )}

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
    </PremiumGate>
  )
}
