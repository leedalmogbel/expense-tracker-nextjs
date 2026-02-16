"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectItem } from "@/components/ui/select"
import { useExpense } from "@/contexts/expense-context"
import { CATEGORIES, CATEGORY_ICONS, getCategoryLabel } from "@/lib/constants"
import { getMonthName } from "@/lib/expense-utils"
import type { Transaction } from "@/lib/types"

function normalizePaymentKey(m: string) {
  return m.toLowerCase().replace(/\s+/g, "-")
}

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: getMonthName(i + 1) }))
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)

interface EditTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
}

export function EditTransactionModal({ open, onOpenChange, transaction }: EditTransactionModalProps) {
  const { updateTransactionById, paymentMethods, currency } = useExpense()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Expense form state
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [amountAbs, setAmountAbs] = useState("")
  const [dateValue, setDateValue] = useState("")
  const [category, setCategory] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("Other")

  // Income form state
  const [incomeAmount, setIncomeAmount] = useState("")
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const isExpense = transaction ? transaction.amount < 0 : true

  useEffect(() => {
    if (transaction) {
      if (transaction.amount < 0) {
        const fullDesc = transaction.description
        const match = fullDesc.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
        if (match) {
          setDescription(match[1].trim())
          setNotes(match[2].trim())
        } else {
          setDescription(fullDesc)
          setNotes("")
        }
        setAmountAbs(Math.abs(transaction.amount).toFixed(2))
        setDateValue(transaction.date)
        setCategory(transaction.category)
        setPaymentMethod(transaction.paymentMethod || "Other")
      } else {
        setIncomeAmount(Math.abs(transaction.amount).toFixed(2))
        const [y, m] = transaction.date.split("-").map(Number)
        if (y && m) {
          setYear(y)
          setMonth(m)
        }
      }
    }
  }, [transaction])

  const handleExpenseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!transaction) return
    const amountNum = parseFloat(amountAbs) || 0
    if (amountNum <= 0) return
    const categoryLabel = category || transaction.category
    const icon = CATEGORY_ICONS[categoryLabel] ?? "circle-dot"
    const finalDescription = notes ? `${description.trim()} (${notes})` : description.trim()

    setIsSubmitting(true)
    updateTransactionById(transaction.id, {
      description: finalDescription || transaction.description,
      category: categoryLabel,
      amount: -Math.abs(amountNum),
      icon,
      date: dateValue,
      paymentMethod: paymentMethod || "Other",
    })
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleIncomeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!transaction) return
    const amountNum = parseFloat(incomeAmount) || 0
    if (amountNum <= 0) return
    const monthName = getMonthName(month)
    const date = `${year}-${String(month).padStart(2, "0")}-01`
    const finalDescription = `Income - ${monthName} ${year}`

    setIsSubmitting(true)
    updateTransactionById(transaction.id, {
      description: finalDescription,
      category: "Other",
      amount: Math.abs(amountNum),
      icon: "circle-dot",
      date,
      paymentMethod: "Bank Transfer",
    })
    setIsSubmitting(false)
    onOpenChange(false)
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        {isExpense ? (
          <>
            <DialogHeader className="px-6 pt-6 pb-2 text-left">
              <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
                Edit expense
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                Update the expense. Amounts are in {currency.name} ({currency.symbol}).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleExpenseSubmit} id="edit-expense-form" className="px-6 pb-6">
              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-expense-name" className="text-sm font-medium text-foreground">
                    What was this for?
                  </Label>
                  <Input
                    id="edit-expense-name"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Groceries, Lunch, Gas"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-expense-amount" className="text-sm font-medium text-foreground">
                      Amount ({currency.code})
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-foreground pointer-events-none">
                        {currency?.symbol ?? ""}
                      </span>
                      <Input
                        id="edit-expense-amount"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        value={amountAbs}
                        onChange={(e) => setAmountAbs(e.target.value)}
                        className={`pl-8 ${inputClass}`}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-expense-date" className="text-sm font-medium text-foreground">
                      Date
                    </Label>
                    <Input
                      id="edit-expense-date"
                      type="date"
                      className={inputClass}
                      classNames={{
                        input: "text-sm cursor-pointer",
                        inputWrapper: "border-input bg-background data-[hover=true]:bg-background",
                      }}
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Category</Label>
                    <Select
                      placeholder="Choose category"
                      classNames={{ trigger: inputClass }}
                      selectedKeys={category ? [category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0]
                        if (typeof v === "string") setCategory(getCategoryLabel(v))
                      }}
                    >
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")}>{c}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Payment method</Label>
                    <Select
                      placeholder="How did you pay?"
                      classNames={{ trigger: inputClass }}
                      selectedKeys={paymentMethod ? [normalizePaymentKey(paymentMethod)] : []}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0]
                        if (typeof v === "string") {
                          const label = paymentMethods.find((m) => normalizePaymentKey(m) === v)
                          setPaymentMethod(label ?? v)
                        }
                      }}
                    >
                      {paymentMethods.map((m) => (
                        <SelectItem key={normalizePaymentKey(m)}>{m}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-expense-notes" className="text-sm font-medium text-foreground">
                    Notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Textarea
                    id="edit-expense-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Store name, receipt number"
                    rows={2}
                    className="resize-none min-h-[72px] rounded-lg border border-input bg-background text-sm px-3 py-2"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-6 mt-6 border-t border-border px-6 pb-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-w-[88px] h-10 rounded-lg">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-expense-form"
                  disabled={isSubmitting}
                  className="min-w-[120px] h-10 rounded-lg"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Save expense"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-2 text-left">
              <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
                Edit income
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                Update the income. Amounts are in {currency.name} ({currency.symbol}). Stored as a positive transaction (Bank Transfer).
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleIncomeSubmit} id="edit-income-form" className="px-6 pb-6">
              <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-income-amount" className="text-sm font-medium text-foreground">
                    Amount received ({currency.code})
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-foreground pointer-events-none">
                      {currency?.symbol ?? ""}
                    </span>
                    <Input
                      id="edit-income-amount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={incomeAmount}
                      onChange={(e) => setIncomeAmount(e.target.value)}
                      className={`pl-8 ${inputClass}`}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">For month</Label>
                    <Select
                      placeholder="Select month"
                      classNames={{ trigger: inputClass }}
                      selectedKeys={[String(month)]}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0]
                        if (v) setMonth(Number(v))
                      }}
                    >
                      {MONTHS.map((m) => (
                        <SelectItem key={String(m.num)}>{m.name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">For year</Label>
                    <Select
                      placeholder="Select year"
                      classNames={{ trigger: inputClass }}
                      selectedKeys={[String(year)]}
                      onSelectionChange={(keys) => {
                        const v = Array.from(keys)[0]
                        if (v) setYear(Number(v))
                      }}
                    >
                      {YEARS.map((y) => (
                        <SelectItem key={String(y)}>{y}</SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-6 mt-6 border-t border-border px-6 pb-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-w-[88px] h-10 rounded-lg">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-income-form"
                  disabled={isSubmitting}
                  className="min-w-[120px] h-10 rounded-lg"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Save income"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
