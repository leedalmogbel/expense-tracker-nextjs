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
import { addCreditCardPayment, updateCreditCardPayment } from "@/lib/storage"
import { getMonthName } from "@/lib/expense-utils"
import { toast } from "sonner"
import type { CreditCardReminder, CreditCardPayment } from "@/lib/types"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

interface RecordPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CreditCardReminder | null
  year: number
  month: number
  existingPayment?: CreditCardPayment | null
  onSaved?: () => void
}

export function RecordPaymentModal({
  open,
  onOpenChange,
  card,
  year,
  month,
  existingPayment,
  onSaved,
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState("")
  const [paidDate, setPaidDate] = useState("")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!existingPayment

  useEffect(() => {
    if (open && existingPayment) {
      setAmount(String(existingPayment.amount))
      setPaidDate(existingPayment.paidDate)
      setNote(existingPayment.note ?? "")
    } else if (open) {
      setAmount("")
      setPaidDate(new Date().toISOString().split("T")[0])
      setNote("")
    }
  }, [open, existingPayment])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (!card || isNaN(numAmount) || numAmount <= 0 || !paidDate) return

    setIsSubmitting(true)

    if (isEditing && existingPayment) {
      updateCreditCardPayment(existingPayment.id, {
        amount: numAmount,
        paidDate,
        note: note.trim() || undefined,
      })
    } else {
      addCreditCardPayment({
        cardId: card.id,
        year,
        month,
        amount: numAmount,
        paidDate,
        note: note.trim() || undefined,
      })
    }

    toast.success(isEditing ? "Payment updated" : "Payment recorded", {
      description: `${card.name} - ${getMonthName(month)} ${year}`,
    })
    setIsSubmitting(false)
    onSaved?.()
    onOpenChange(false)
  }

  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {isEditing ? "Edit payment" : "Record payment"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {card.name}
            {card.lastFourDigits ? ` (****${card.lastFourDigits})` : ""} &mdash;{" "}
            {getMonthName(month)} {year}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="record-payment-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount" className="text-sm font-medium text-foreground">
                Amount paid
              </Label>
              <Input
                id="payment-amount"
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
              <Label htmlFor="payment-date" className="text-sm font-medium text-foreground">
                Date paid
              </Label>
              <Input
                id="payment-date"
                type="date"
                className={inputClass}
                required
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-note" className="text-sm font-medium text-foreground">
                Note <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="payment-note"
                type="text"
                placeholder="e.g. Full balance, Minimum payment"
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
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
              form="record-payment-form"
              disabled={isSubmitting}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isEditing ? (
                "Save changes"
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
