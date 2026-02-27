"use client"

import { useState, useEffect, useMemo } from "react"
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
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/constants"
import { getMonthName } from "@/lib/expense-utils"
import { toast } from "sonner"
import { getMonthlyBudgets } from "@/lib/storage"
import { getCategoryIconComponent } from "@/lib/category-icons"
import type { MonthlyBudget, CategoryBudget } from "@/lib/types"

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
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    const all = getMonthlyBudgets()
    const existing = all.find((b) => b.year === year && b.month === month)

    const budgetMap: Record<string, string> = {}
    if (existing?.categoryBudgets?.length) {
      // Load existing per-category budgets
      CATEGORIES.forEach((cat) => {
        const cb = existing.categoryBudgets.find((c) => c.category === cat)
        budgetMap[cat] = cb ? String(cb.budget) : ""
      })
    } else {
      // Empty for new budget
      CATEGORIES.forEach((cat) => {
        budgetMap[cat] = ""
      })
    }
    setCategoryBudgets(budgetMap)
  }, [open, year, month])

  const total = useMemo(() => {
    return Object.values(categoryBudgets).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    )
  }, [categoryBudgets])

  const handleCategoryChange = (category: string, value: string) => {
    setCategoryBudgets((prev) => ({ ...prev, [category]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (total <= 0) return

    const catBudgets: CategoryBudget[] = Object.entries(categoryBudgets)
      .filter(([_, val]) => (parseFloat(val) || 0) > 0)
      .map(([category, val]) => ({
        category,
        budget: parseFloat(val) || 0,
        icon: CATEGORY_ICONS[category] ?? "circle-dot",
      }))

    const budget: MonthlyBudget = {
      year,
      month,
      budget: total,
      categoryBudgets: catBudgets,
    }
    setIsSubmitting(true)
    setCurrentBudget(budget)
    toast.success("Budget saved", { description: `${currency.symbol}${total.toFixed(2)} for ${getMonthName(month)} ${year}` })
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-2 text-left shrink-0">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Set budget
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Set spending limits per category for the month. Amounts in {currency.name} ({currency.symbol}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-budget-form" className="flex flex-col min-h-0 flex-1">
          <div className="px-6 space-y-5 pt-2 overflow-y-auto flex-1 min-h-0">
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
                    <SelectItem key={String(y)}>{String(y)}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-foreground">Category budgets</Label>
              <p className="text-xs text-muted-foreground">Set a limit for each category. Leave blank to skip.</p>
            </div>

            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const Icon = getCategoryIconComponent(CATEGORY_ICONS[cat] ?? "circle-dot")
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground min-w-[100px] flex-1 truncate">
                      {cat}
                    </span>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        {currency.symbol}
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className="pl-7 h-9 rounded-lg border border-input bg-background text-sm"
                        value={categoryBudgets[cat] ?? ""}
                        onChange={(e) => handleCategoryChange(cat, e.target.value)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Total budget</span>
              <span className="text-lg font-bold font-heading text-primary">
                {currency.symbol}{total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 mt-2 border-t border-border px-6 pb-6 shrink-0">
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
              form="add-budget-form"
              disabled={isSubmitting || total <= 0}
              className="min-w-[120px] h-10 rounded-lg"
            >
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
