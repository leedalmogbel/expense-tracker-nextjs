"use client"

import { useState, useEffect, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getLoans, updateLoan, deleteLoan } from "@/lib/storage"
import { getOrdinalSuffix } from "@/lib/expense-utils"
import { useExpense } from "@/contexts/expense-context"
import type { Loan } from "@/lib/types"
import { toast } from "sonner"
import {
  Home,
  Plus,
  ChevronDown,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AddLoanModal } from "./add-loan-modal"
import { RecordLoanPaymentModal } from "./record-loan-payment-modal"

interface LoanListProps {
  openAddLoanRef?: React.MutableRefObject<(() => void) | null>
}

export function LoanList({ openAddLoanRef }: LoanListProps = {}) {
  const { formatCurrency } = useExpense()
  const [loans, setLoans] = useState<Loan[]>([])
  const [addLoanOpen, setAddLoanOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [paymentLoan, setPaymentLoan] = useState<Loan | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Expose open-add-loan action to parent
  useEffect(() => {
    if (openAddLoanRef) {
      openAddLoanRef.current = () => {
        setEditingLoan(null)
        setAddLoanOpen(true)
      }
    }
    return () => {
      if (openAddLoanRef) openAddLoanRef.current = null
    }
  }, [openAddLoanRef])

  // Confirm delete dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)

  const loadData = () => {
    setLoans(getLoans())
  }

  useEffect(() => {
    loadData()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const askConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message)
    setConfirmAction(() => action)
    setConfirmOpen(true)
  }

  const executeConfirm = () => {
    confirmAction?.()
    setConfirmOpen(false)
    setConfirmAction(null)
  }

  const handleDelete = (id: string) => {
    const loan = loans.find((l) => l.id === id)
    askConfirm(
      `Remove "${loan?.name ?? "this loan"}"? This will also remove all payment history.`,
      () => {
        deleteLoan(id)
        loadData()
        toast.success("Loan removed", { description: loan?.name })
      }
    )
  }

  const handleDeletePayment = (loanId: string, paymentId: string) => {
    askConfirm("Remove this payment record?", () => {
      const loan = loans.find((l) => l.id === loanId)
      if (!loan) return
      const updatedPayments = loan.payments.filter((p) => p.id !== paymentId)
      // Re-number month numbers
      const renumbered = updatedPayments
        .sort((a, b) => new Date(a.paidDate).getTime() - new Date(b.paidDate).getTime())
        .map((p, idx) => ({ ...p, monthNumber: idx + 1 }))
      updateLoan(loanId, { payments: renumbered })
      loadData()
      toast.success("Payment removed")
    })
  }

  return (
    <>
      <Card className="w-full border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-3))]/10 text-[hsl(var(--chart-3))]">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                  Your Loans
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {loans.length} loan{loans.length !== 1 ? "s" : ""} tracked
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingLoan(null)
                setAddLoanOpen(true)
              }}
              className="shrink-0 inline-flex items-center rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:text-primary sm:text-sm sm:px-4 sm:py-2"
            >
              Manage
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
          {loans.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <Home className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No loans added</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first loan to track payments and progress
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {loans.map((loan) => {
                const paidCount = loan.payments.length
                const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0)
                const remaining = Math.max(0, loan.totalAmount - totalPaid)
                const progressPercent = loan.totalMonths > 0
                  ? Math.min(100, (paidCount / loan.totalMonths) * 100)
                  : 0
                const isExpanded = expandedIds.has(loan.id)
                const isCompleted = paidCount >= loan.totalMonths

                return (
                  <div key={loan.id} className="py-3 first:pt-3">
                    {/* Loan header row */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary mt-0.5">
                        <Home className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {loan.name}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(loan.monthlyPayment)}/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0 h-5 font-normal"
                          >
                            {paidCount} of {loan.totalMonths} paid
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0 h-5 font-normal"
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Due {getOrdinalSuffix(loan.dueDay)}
                          </Badge>
                          {isCompleted && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-5 font-medium bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            >
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2.5 ml-[52px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-muted-foreground">
                          {Math.round(progressPercent)}% complete
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {paidCount}/{loan.totalMonths} months
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isCompleted
                              ? "bg-emerald-500"
                              : "bg-primary"
                          )}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-2 ml-[52px] flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Remaining: <span className="font-medium text-foreground">{formatCurrency(remaining)}</span>
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-muted-foreground">
                        Paid: <span className="font-medium text-emerald-600">{formatCurrency(totalPaid)}</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-2 ml-[52px] flex items-center gap-1 flex-wrap">
                      {!isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1"
                          onClick={() => {
                            setPaymentLoan(loan)
                            setPaymentModalOpen(true)
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Record Payment
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                        onClick={() => {
                          setEditingLoan(loan)
                          setAddLoanOpen(true)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                        onClick={() => handleDelete(loan.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    </div>

                    {/* Expandable payment history */}
                    {loan.payments.length > 0 && (
                      <div className="mt-2 ml-[52px]">
                        <button
                          onClick={() => toggleExpand(loan.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown
                            className={cn(
                              "h-3.5 w-3.5 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                          Payment History ({loan.payments.length})
                        </button>

                        {isExpanded && (
                          <div className="mt-2 rounded-xl border border-border bg-card/50 divide-y divide-border overflow-hidden">
                            {loan.payments
                              .sort((a, b) => b.monthNumber - a.monthNumber)
                              .map((payment) => (
                                <div
                                  key={payment.id}
                                  className="flex items-center justify-between px-3 py-2"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 h-4 font-medium shrink-0"
                                    >
                                      #{payment.monthNumber}
                                    </Badge>
                                    <span className="text-xs font-medium text-foreground">
                                      {formatCurrency(payment.amount)}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {new Date(payment.paidDate + "T00:00:00").toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    {payment.note && (
                                      <span className="text-[10px] text-muted-foreground/60 truncate max-w-[100px]">
                                        &middot; {payment.note}
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                    onClick={() => handleDeletePayment(loan.id, payment.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Note */}
                    {loan.note && (
                      <div className="mt-1.5 ml-[52px]">
                        <p className="text-[11px] text-muted-foreground/70 italic truncate">
                          {loan.note}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddLoanModal
        open={addLoanOpen}
        onOpenChange={(open) => {
          setAddLoanOpen(open)
          if (!open) setEditingLoan(null)
        }}
        editingLoan={editingLoan}
        onSaved={loadData}
      />

      <RecordLoanPaymentModal
        open={paymentModalOpen}
        onOpenChange={(open) => {
          setPaymentModalOpen(open)
          if (!open) setPaymentLoan(null)
        }}
        loan={paymentLoan}
        onSaved={loadData}
      />

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onOpenChange={(open) => {
        setConfirmOpen(open)
        if (!open) setConfirmAction(null)
      }}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-2 text-left">
            <DialogTitle className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {confirmMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 px-6 pb-6 pt-4">
            <Button
              variant="outline"
              className="h-10 rounded-lg"
              onClick={() => {
                setConfirmOpen(false)
                setConfirmAction(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-10 rounded-lg"
              onClick={executeConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
