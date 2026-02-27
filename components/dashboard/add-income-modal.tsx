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
import { useAuth } from "@/contexts/auth-context"
import { syncSingleTransaction } from "@/lib/supabase-api"
import { getMonthName } from "@/lib/expense-utils"
import { INCOME_CATEGORIES, INCOME_CATEGORY_ICONS } from "@/lib/constants"
import { toast } from "sonner"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

function normalizeKey(m: string) {
  return m.toLowerCase().replace(/\s+/g, "-")
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ num: i + 1, name: getMonthName(i + 1) }))
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i)

interface AddIncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddIncomeModal({ open, onOpenChange }: AddIncomeModalProps) {
  const { addTransaction, currency, year: currentYear, month: currentMonth, paymentMethods } = useExpense()
  const { user, isSupabaseConfigured } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [description, setDescription] = useState("")
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Salary")
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const amountNum = parseFloat(amount) || 0
    if (amountNum <= 0) return

    const monthName = getMonthName(month)
    const date = `${year}-${String(month).padStart(2, "0")}-01`
    const descriptionText = description.trim()
      ? `${description.trim()} (${monthName} ${year})`
      : `${category} - ${monthName} ${year}`

    setIsSubmitting(true)
    const newTx = addTransaction({
      description: descriptionText,
      category,
      amount: Math.abs(amountNum),
      icon: INCOME_CATEGORY_ICONS[category] ?? "circle-dot",
      date,
      isPositive: true,
      paymentMethod,
    })
    toast.success("Income added", { description: `${currency.symbol}${amountNum.toFixed(2)} for ${getMonthName(month)} ${year}` })
    if (user && isSupabaseConfigured) {
      syncSingleTransaction(user.id, newTx).catch(() => {})
    }
    setIsSubmitting(false)
    onOpenChange(false)
    setDescription("")
    setAmount("")
    setCategory("Salary")
    setPaymentMethod("Bank Transfer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Add income
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Record salary, freelance pay, or other income. Amounts are in {currency.name} ({currency.symbol}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-income-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="income-description" className="text-sm font-medium text-foreground">
                Source / description
              </Label>
              <Input
                id="income-description"
                type="text"
                placeholder="e.g. Company name, client, side project"
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Helps you track where this income came from.
              </p>
            </div>
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
                <Label className="text-sm font-medium text-foreground">Category</Label>
                <Select
                  placeholder="Select category"
                  classNames={{ trigger: inputClass }}
                  selectedKeys={[normalizeKey(category)]}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0]
                    if (typeof v === "string") {
                      const label = INCOME_CATEGORIES.find((c) => normalizeKey(c) === v)
                      if (label) setCategory(label)
                    }
                  }}
                >
                  {INCOME_CATEGORIES.map((c) => (
                    <SelectItem key={normalizeKey(c)}>{c}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Payment method</Label>
                <Select
                  placeholder="How received?"
                  classNames={{ trigger: inputClass }}
                  selectedKeys={paymentMethod ? [normalizeKey(paymentMethod)] : []}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0]
                    if (typeof v === "string") {
                      const label = paymentMethods.find((m) => normalizeKey(m) === v)
                      setPaymentMethod(label ?? v)
                    }
                  }}
                >
                  {paymentMethods.map((m) => (
                    <SelectItem key={normalizeKey(m)}>{m}</SelectItem>
                  ))}
                </Select>
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
                    <SelectItem key={String(y)}>{String(y)}</SelectItem>
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
