"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateLoan } from "@/lib/storage"
import { toast } from "sonner"
import type { Loan, LoanPayment } from "@/lib/types"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

interface RecordLoanPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loan: Loan | null
  onSaved?: () => void
}

export function RecordLoanPaymentModal({
  open,
  onOpenChange,
  loan,
  onSaved,
}: RecordLoanPaymentModalProps) {
  const [amount, setAmount] = useState("")
  const [paidDate, setPaidDate] = useState("")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextMonthNumber = loan ? loan.payments.length + 1 : 1

  useEffect(() => {
    if (open && loan) {
      setAmount(String(loan.monthlyPayment))
      setPaidDate(new Date().toISOString().split("T")[0])
      setNote("")
    }
  }, [open, loan])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (!loan || isNaN(numAmount) || numAmount <= 0 || !paidDate) return

    setIsSubmitting(true)

    const newPayment: LoanPayment = {
      id: `lpay-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      monthNumber: nextMonthNumber,
      amount: numAmount,
      paidDate,
      note: note.trim() || undefined,
    }

    const updatedPayments = [...loan.payments, newPayment]
    updateLoan(loan.id, { payments: updatedPayments })

    toast.success("Payment recorded", {
      description: `${loan.name} - Month #${nextMonthNumber}`,
    })
    setIsSubmitting(false)
    onSaved?.()
    onOpenChange(false)
  }

  if (!loan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Record payment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {loan.name} &mdash; Month #{nextMonthNumber} of {loan.totalMonths}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="record-loan-payment-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="loan-payment-amount" className="text-sm font-medium text-foreground">
                Payment amount
              </Label>
              <Input
                id="loan-payment-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className={inputClass}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-payment-date" className="text-sm font-medium text-foreground">
                Date paid
              </Label>
              <Input
                id="loan-payment-date"
                type="date"
                className={inputClass}
                required
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-payment-note" className="text-sm font-medium text-foreground">
                Note <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="loan-payment-note"
                type="text"
                placeholder="e.g. Paid via bank transfer"
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Month #{nextMonthNumber}</span>{" "}
                &mdash; This will be automatically assigned based on your existing payment count.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-6 mt-6 border-t border-border px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[88px] h-10 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="record-loan-payment-form"
              disabled={isSubmitting}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Record payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
