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
import { Select, SelectItem } from "@/components/ui/select"
import { useExpense } from "@/contexts/expense-context"
import { DEFAULT_CATEGORY_BUDGETS } from "@/lib/constants"
import { getMonthName } from "@/lib/expense-utils"
import { getMonthlyBudgets } from "@/lib/storage"
import type { MonthlyBudget } from "@/lib/types"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: getMonthName(i + 1) }))
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i)

interface AddBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBudgetModal({ open, onOpenChange }: AddBudgetModalProps) {
  const { setCurrentBudget, currency, year: currentYear, month: currentMonth } = useExpense()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [totalBudget, setTotalBudget] = useState("")

  useEffect(() => {
    if (!open) return
    const all = getMonthlyBudgets()
    const existing = all.find((b) => b.year === year && b.month === month)
    setTotalBudget(existing ? String(existing.budget) : "")
  }, [open, year, month])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const total = parseFloat(totalBudget) || 0
    if (total <= 0) return

    const all = getMonthlyBudgets()
    const existing = all.find((b) => b.year === year && b.month === month)
    let categoryBudgets = existing?.categoryBudgets

    if (!categoryBudgets?.length) {
      categoryBudgets = DEFAULT_CATEGORY_BUDGETS.map(({ category, pct, icon }) => ({
        category,
        budget: Math.round((total * pct) / 100 * 100) / 100,
        icon,
      }))
    } else {
      const existingTotal = existing!.budget
      if (Math.abs(existingTotal - total) > 0.01) {
        const ratio = total / existingTotal
        categoryBudgets = categoryBudgets.map((cb) => ({
          ...cb,
          budget: Math.round(cb.budget * ratio * 100) / 100,
        }))
      }
    }

    const budget: MonthlyBudget = {
      year,
      month,
      budget: total,
      categoryBudgets,
    }
    setIsSubmitting(true)
    setCurrentBudget(budget)
    setIsSubmitting(false)
    onOpenChange(false)
    setTotalBudget("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Add budget
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Set your total spending limit for a month. Amounts are in {currency.name} ({currency.symbol}). Category splits use defaults or your existing budget.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-budget-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="budget-total" className="text-sm font-medium text-foreground">
                Total budget for this month ({currency.code})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-foreground pointer-events-none">
                  {currency?.symbol ?? ""}
                </span>
                <Input
                  id="budget-total"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`pl-8 ${inputClass}`}
                  required
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
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
            <Button type="submit" form="add-budget-form" disabled={isSubmitting} className="min-w-[120px] h-10 rounded-lg">
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Save budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
