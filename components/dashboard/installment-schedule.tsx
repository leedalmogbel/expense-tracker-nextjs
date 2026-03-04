"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateCreditCardInstallment } from "@/lib/storage"
import { useExpense } from "@/contexts/expense-context"
import { toast } from "sonner"
import type { CreditCardInstallment, CreditCardReminder } from "@/lib/types"
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface InstallmentScheduleProps {
  installment: CreditCardInstallment
  card: CreditCardReminder
  onUpdated?: () => void
  onDelete?: () => void
}

export function InstallmentSchedule({ installment, card, onUpdated, onDelete }: InstallmentScheduleProps) {
  const { formatCurrency } = useExpense()
  const [expanded, setExpanded] = useState(false)
  const [markModalOpen, setMarkModalOpen] = useState(false)
  const [markingMonth, setMarkingMonth] = useState<number | null>(null)
  const [markAmount, setMarkAmount] = useState("")
  const [markDate, setMarkDate] = useState("")

  const paidCount = installment.payments.filter((p) => p.status === "paid").length
  const amountPaid = installment.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.paidAmount ?? installment.monthlyInstallment), 0)
  const balance = installment.totalAmount - amountPaid
  const progressPct = Math.round((paidCount / installment.totalMonths) * 100)

  const openMarkPaid = (monthNumber: number) => {
    const payment = installment.payments.find((p) => p.monthNumber === monthNumber)
    setMarkingMonth(monthNumber)
    setMarkAmount(payment?.paidAmount ? String(payment.paidAmount) : String(installment.monthlyInstallment))
    setMarkDate(format(new Date(), "yyyy-MM-dd"))
    setMarkModalOpen(true)
  }

  const handleMarkPaid = () => {
    if (markingMonth === null) return
    const parsedAmount = parseFloat(markAmount)
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !markDate) return

    const updatedPayments = installment.payments.map((p) =>
      p.monthNumber === markingMonth
        ? { ...p, status: "paid" as const, paidAmount: parsedAmount, paidDate: markDate }
        : p
    )

    const allPaid = updatedPayments.every((p) => p.status === "paid")

    updateCreditCardInstallment(installment.id, {
      payments: updatedPayments,
      status: allPaid ? "completed" : "active",
      note: allPaid ? "Done - Checked in next billing to confirm that data is tally" : installment.note,
    })

    toast.success(`Month ${markingMonth} marked as paid`)
    setMarkModalOpen(false)
    onUpdated?.()
  }

  const handleUnmarkPaid = (monthNumber: number) => {
    const updatedPayments = installment.payments.map((p) =>
      p.monthNumber === monthNumber
        ? { ...p, status: "pending" as const, paidAmount: undefined, paidDate: undefined }
        : p
    )

    updateCreditCardInstallment(installment.id, {
      payments: updatedPayments,
      status: "active",
      note: undefined,
    })

    toast.success(`Month ${monthNumber} unmarked`)
    onUpdated?.()
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Summary header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {installment.items.join(", ")}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatCurrency(installment.totalAmount)} &middot; {installment.totalMonths}mo &middot; {formatCurrency(installment.monthlyInstallment)}/mo
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  installment.status === "completed" ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {paidCount}/{installment.totalMonths}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground">
              Balance: {formatCurrency(Math.max(0, balance))}
            </span>
            {installment.status === "completed" && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 font-medium bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded schedule */}
      {expanded && (
        <div className="border-t border-border">
          {/* Table header */}
          <div className="grid grid-cols-[3rem_1fr_5rem_5rem_auto] gap-2 px-4 py-2 bg-muted/30 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            <span>#</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Balance</span>
            <span className="text-center w-20">Status</span>
          </div>

          {/* Payment rows */}
          {installment.payments.map((payment) => {
            const isPaid = payment.status === "paid"
            const paidAmount = payment.paidAmount ?? installment.monthlyInstallment
            // Running balance: total - sum of all paid amounts up to this month
            const paidUpTo = installment.payments
              .filter((p) => p.monthNumber <= payment.monthNumber && p.status === "paid")
              .reduce((sum, p) => sum + (p.paidAmount ?? installment.monthlyInstallment), 0)
            const runningBalance = installment.totalAmount - paidUpTo

            const displayDate = isPaid && payment.paidDate
              ? payment.paidDate
              : payment.expectedDate

            return (
              <div
                key={payment.monthNumber}
                className={cn(
                  "grid grid-cols-[3rem_1fr_5rem_5rem_auto] gap-2 items-center px-4 py-2 text-sm border-t border-border/50",
                  isPaid && "bg-emerald-500/5"
                )}
              >
                <span className="text-xs text-muted-foreground">{payment.monthNumber}</span>
                <span className="text-xs text-foreground truncate">
                  {format(new Date(displayDate + "T00:00:00"), "dd-MMM-yy")}
                </span>
                <span className="text-xs text-right tabular-nums text-foreground">
                  {isPaid ? formatCurrency(paidAmount) : formatCurrency(installment.monthlyInstallment)}
                </span>
                <span className="text-xs text-right tabular-nums text-muted-foreground">
                  {isPaid ? formatCurrency(Math.max(0, runningBalance)) : "\u2014"}
                </span>
                <div className="flex items-center justify-center w-20">
                  {isPaid ? (
                    <div className="flex items-center gap-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-0.5"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Paid
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => handleUnmarkPaid(payment.monthNumber)}
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-5 px-1.5 text-[10px] gap-0.5"
                      onClick={() => openMarkPaid(payment.monthNumber)}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Note for completed */}
          {installment.note && (
            <div className="px-4 py-2 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground italic">{installment.note}</p>
            </div>
          )}

          {installment.description && (
            <div className="px-4 py-2 border-t border-border bg-muted/20">
              <p className="text-xs text-muted-foreground">Note: {installment.description}</p>
            </div>
          )}

          {/* Delete installment */}
          {onDelete && (
            <div className="px-4 py-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="h-3 w-3" />
                Remove installment
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mark as Paid modal */}
      <Dialog open={markModalOpen} onOpenChange={setMarkModalOpen}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-2 text-left">
            <DialogTitle className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Mark month {markingMonth} as paid
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {installment.items.join(", ")} &mdash; {card.name}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount paid</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                className="h-11 rounded-lg border border-input bg-background text-sm"
                value={markAmount}
                onChange={(e) => setMarkAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date paid</label>
              <Input
                type="date"
                className="h-11 rounded-lg border border-input bg-background text-sm"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 px-6 pb-6">
            <Button variant="outline" onClick={() => setMarkModalOpen(false)} className="h-10 rounded-lg">
              Cancel
            </Button>
            <Button onClick={handleMarkPaid} className="h-10 rounded-lg">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
