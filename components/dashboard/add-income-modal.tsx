"use client"

import { useState } from "react"
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
import { Select, SelectItem } from "@/components/ui/select"
import { useExpense } from "@/contexts/expense-context"
import { getMonthName } from "@/lib/expense-utils"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: getMonthName(i + 1) }))
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i)

interface AddIncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddIncomeModal({ open, onOpenChange }: AddIncomeModalProps) {
  const { addTransaction, currency, year: currentYear, month: currentMonth } = useExpense()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [amount, setAmount] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const amountNum = parseFloat(amount) || 0
    if (amountNum <= 0) return

    const monthName = getMonthName(month)
    const description = `Income - ${monthName} ${year}`
    const date = `${year}-${String(month).padStart(2, "0")}-01`

    setIsSubmitting(true)
    addTransaction({
      description,
      category: "Other",
      amount: Math.abs(amountNum),
      icon: "circle-dot",
      date,
      isPositive: true,
      paymentMethod: "Bank Transfer",
    })
    setIsSubmitting(false)
    onOpenChange(false)
    setAmount("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Add income
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Record salary, freelance pay, or other income for a month. Amounts are in {currency.name} ({currency.symbol}). Stored as a positive transaction (Bank Transfer).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-income-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="income-amount" className="text-sm font-medium text-foreground">
                Amount received ({currency.code})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-foreground pointer-events-none">
                  {currency?.symbol ?? ""}
                </span>
                <Input
                  id="income-amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`pl-8 ${inputClass}`}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-[88px] h-10 rounded-lg"
            >
              Cancel
            </Button>
            <Button type="submit" form="add-income-form" disabled={isSubmitting} className="min-w-[120px] h-10 rounded-lg">
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Add income"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
