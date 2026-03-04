"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  getCreditCardReminders,
  updateCreditCardReminder,
  deleteCreditCardReminder,
  getCreditCardPayments,
  deleteCreditCardPayment,
  getCreditCardInstallments,
  deleteCreditCardInstallment,
} from "@/lib/storage"
import {
  getOrdinalSuffix,
  getMonthName,
  getCardsWithPaymentStatus,
} from "@/lib/expense-utils"
import type { CreditCardReminder, CreditCardPayment, CreditCardInstallment } from "@/lib/types"
import type { CardPaymentStatus } from "@/lib/expense-utils"
import { toast } from "sonner"
import {
  CreditCard,
  Trash2,
  Pencil,
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@heroui/react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RecordPaymentModal } from "./record-payment-modal"
import { AddInstallmentModal } from "./add-installment-modal"
import { InstallmentSchedule } from "./installment-schedule"
import { CreditLimitChart } from "./credit-limit-chart"
import { useExpense } from "@/contexts/expense-context"

const STATUS_CONFIG: Record<
  CardPaymentStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  unpaid: {
    label: "Unpaid",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

interface CreditCardListProps {
  onEdit?: (card: CreditCardReminder) => void
  onRefresh?: () => void
}

export function CreditCardList({ onEdit, onRefresh }: CreditCardListProps) {
  const { formatCurrency } = useExpense()
  const [reminders, setReminders] = useState<CreditCardReminder[]>([])
  const [payments, setPayments] = useState<CreditCardPayment[]>([])
  const [installments, setInstallments] = useState<CreditCardInstallment[]>([])

  // Month navigation
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentCard, setPaymentCard] = useState<CreditCardReminder | null>(null)
  const [editingPayment, setEditingPayment] = useState<CreditCardPayment | null>(null)

  // Installment modal state
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false)
  const [installmentCard, setInstallmentCard] = useState<CreditCardReminder | null>(null)

  // Confirm delete dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)

  const loadData = () => {
    setReminders(getCreditCardReminders())
    setPayments(getCreditCardPayments())
    setInstallments(getCreditCardInstallments())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleToggle = (id: string, isActive: boolean) => {
    updateCreditCardReminder(id, { isActive })
    loadData()
    toast.success(isActive ? "Reminder enabled" : "Reminder disabled")
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
    const card = reminders.find((r) => r.id === id)
    askConfirm(
      `Remove "${card?.name ?? "this card"}"? This will also remove all associated payments and installments.`,
      () => {
        deleteCreditCardReminder(id)
        loadData()
        toast.success("Card removed", { description: card?.name })
        onRefresh?.()
      }
    )
  }

  const handleDeletePayment = (paymentId: string) => {
    askConfirm("Remove this payment record?", () => {
      deleteCreditCardPayment(paymentId)
      loadData()
      toast.success("Payment removed")
    })
  }

  const handleDeleteInstallment = (instId: string) => {
    const inst = installments.find((i) => i.id === instId)
    askConfirm(
      `Remove installment "${inst?.items.join(", ") ?? "this installment"}"? This cannot be undone.`,
      () => {
        deleteCreditCardInstallment(instId)
        loadData()
        toast.success("Installment removed")
      }
    )
  }

  const navigateMonth = (delta: number) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m > 12) {
      m = 1
      y++
    } else if (m < 1) {
      m = 12
      y--
    }
    setViewMonth(m)
    setViewYear(y)
  }

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth() + 1

  const cardsWithStatus = getCardsWithPaymentStatus(reminders, payments, viewYear, viewMonth)
  const paidCount = cardsWithStatus.filter((c) => c.status === "paid").length

  // Helper: get installments for a specific card
  const getCardInstallments = (cardId: string) =>
    installments.filter((i) => i.cardId === cardId)

  // Helper: get total amount committed in active installments for a card
  // Full purchase amount stays blocked against credit limit until fully paid
  const getActiveInstallmentTotal = (cardId: string) => {
    return getCardInstallments(cardId)
      .filter((i) => i.status === "active")
      .reduce((sum, i) => sum + i.totalAmount, 0)
  }

  return (
    <>
      <Card className="w-full border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <div className="flex items-center gap-3 w-full">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-5))]/10 text-[hsl(var(--chart-5))]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                Your Credit Cards
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {reminders.length} card{reminders.length !== 1 ? "s" : ""} tracked
              </p>
            </div>
          </div>
        </CardHeader>

        {/* Month navigation */}
        {reminders.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 bg-muted/30 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {getMonthName(viewMonth)} {viewYear}
              </p>
              {reminders.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {paidCount} of {reminders.length} paid
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => navigateMonth(1)}
              disabled={isCurrentMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <CardContent className="px-4 pt-0 pb-4 sm:px-6 sm:pb-6">
          {reminders.length === 0 ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No credit cards added</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add your first card to track payment due dates
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cardsWithStatus.map(({ card: r, payment, status }) => {
                const statusConfig = STATUS_CONFIG[status]
                const StatusIcon = statusConfig.icon
                const cardInstallments = getCardInstallments(r.id)
                const activeInstallments = cardInstallments.filter((i) => i.status === "active")
                const completedInstallments = cardInstallments.filter((i) => i.status === "completed")
                const activeBalance = getActiveInstallmentTotal(r.id)

                return (
                  <div key={r.id} className="py-3 first:pt-3">
                    {/* Card header row */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {r.name}
                          </p>
                          {r.lastFourDigits && (
                            <span className="text-xs text-muted-foreground">
                              ****{r.lastFourDigits}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-xs px-1.5 py-0 h-5 font-normal"
                          >
                            Due {getOrdinalSuffix(r.dueDay)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0 h-5 font-normal"
                          >
                            {r.isActive ? (
                              <>
                                <Bell className="h-3 w-3 mr-1" />
                                {r.reminderDaysBefore}d before
                              </>
                            ) : (
                              <>
                                <BellOff className="h-3 w-3 mr-1" />
                                Off
                              </>
                            )}
                          </Badge>
                          {r.creditLimit && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-5 font-normal"
                            >
                              Limit: {formatCurrency(r.creditLimit)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch
                        size="sm"
                        isSelected={r.isActive}
                        onValueChange={(val) => handleToggle(r.id, val)}
                        aria-label="Toggle reminder"
                      />
                    </div>

                    {/* Card actions row */}
                    <div className="mt-1.5 ml-[52px] flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                        onClick={() => onEdit?.(r)}
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </Button>
                    </div>

                    {/* Credit limit usage chart */}
                    {r.creditLimit && (
                      <div className="mt-3 ml-[52px] rounded-xl border border-border bg-card/50 p-3">
                        <CreditLimitChart
                          used={activeBalance}
                          limit={r.creditLimit}
                        />
                      </div>
                    )}

                    {/* Payment status row */}
                    <div className="mt-2 ml-[52px] flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-0.5 h-5 font-medium gap-1",
                          statusConfig.className
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      {status === "paid" && payment ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(payment.amount)} on{" "}
                            {new Date(payment.paidDate + "T00:00:00").toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {payment.note && (
                            <span className="text-[11px] text-muted-foreground/60 truncate max-w-[120px]">
                              &middot; {payment.note}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setPaymentCard(r)
                              setEditingPayment(payment)
                              setPaymentModalOpen(true)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={() => {
                            setPaymentCard(r)
                            setEditingPayment(null)
                            setPaymentModalOpen(true)
                          }}
                        >
                          <Plus className="h-3 w-3" />
                          Record Payment
                        </Button>
                      )}
                    </div>

                    {/* Installments section */}
                    {cardInstallments.length > 0 && (
                      <div className="mt-3 ml-[52px] space-y-2">
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            Installments ({activeInstallments.length} active
                            {completedInstallments.length > 0 && `, ${completedInstallments.length} done`})
                          </span>
                        </div>

                        {/* Active installments */}
                        {activeInstallments.map((inst) => (
                          <InstallmentSchedule
                            key={inst.id}
                            installment={inst}
                            card={r}
                            onUpdated={loadData}
                            onDelete={() => handleDeleteInstallment(inst.id)}
                          />
                        ))}

                        {/* Completed installments */}
                        {completedInstallments.map((inst) => (
                          <InstallmentSchedule
                            key={inst.id}
                            installment={inst}
                            card={r}
                            onUpdated={loadData}
                            onDelete={() => handleDeleteInstallment(inst.id)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Add installment button */}
                    <div className="mt-2 ml-[52px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs gap-1"
                        onClick={() => {
                          setInstallmentCard(r)
                          setInstallmentModalOpen(true)
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        Add Installment
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <RecordPaymentModal
        open={paymentModalOpen}
        onOpenChange={(open) => {
          setPaymentModalOpen(open)
          if (!open) {
            setPaymentCard(null)
            setEditingPayment(null)
          }
        }}
        card={paymentCard}
        year={viewYear}
        month={viewMonth}
        existingPayment={editingPayment}
        onSaved={loadData}
      />

      <AddInstallmentModal
        open={installmentModalOpen}
        onOpenChange={(open) => {
          setInstallmentModalOpen(open)
          if (!open) setInstallmentCard(null)
        }}
        card={installmentCard}
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
