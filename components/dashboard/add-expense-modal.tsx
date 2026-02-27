"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
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
import { useAuth } from "@/contexts/auth-context"
import { syncSingleTransaction } from "@/lib/supabase-api"
import { CATEGORIES, CATEGORY_ICONS, getCategoryLabel } from "@/lib/constants"
import { toast } from "sonner"

function normalizePaymentKey(m: string) {
  return m.toLowerCase().replace(/\s+/g, "-")
}

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
  const { addTransaction, paymentMethods, currency } = useExpense()
  const { user, isSupabaseConfigured } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("Other")
  const [dateValue, setDateValue] = useState("")

  useEffect(() => {
    setDateValue(format(new Date(), "yyyy-MM-dd"))
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const description = (form.querySelector("#expense-name") as HTMLInputElement)?.value?.trim()
    const amountRaw = (form.querySelector("#expense-amount") as HTMLInputElement)?.value
    const date = (form.querySelector("#expense-date") as HTMLInputElement)?.value
    const notes = (form.querySelector("#expense-notes") as HTMLTextAreaElement)?.value?.trim()

    if (!description || amountRaw === undefined || !date || !category) return
    const amountNum = parseFloat(amountRaw) || 0
    if (amountNum <= 0) return

    const categoryLabel = category
    const amount = -Math.abs(amountNum)
    const icon = CATEGORY_ICONS[categoryLabel] ?? "circle-dot"

    setIsSubmitting(true)
    const newTx = addTransaction({
      description: notes ? `${description} (${notes})` : description,
      category: categoryLabel,
      amount,
      icon,
      date,
      isPositive: false,
      paymentMethod: paymentMethod || "Other",
    })
    toast.success("Expense added", { description: `${description} for ${currency.symbol}${amountNum.toFixed(2)}` })
    if (user && isSupabaseConfigured) {
      syncSingleTransaction(user.id, newTx).catch(() => {})
    }
    setIsSubmitting(false)
    onOpenChange(false)
    setCategory("")
    setPaymentMethod("Other")
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Add expense
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Record a purchase or payment. Amounts are shown in {currency.name} ({currency.symbol}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-expense-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="expense-name" className="text-sm font-medium text-foreground">
                What was this for?
              </Label>
              <Input
                id="expense-name"
                placeholder="e.g. Groceries, Lunch, Gas"
                required
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-amount" className="text-sm font-medium text-foreground">
                  Amount ({currency.code})
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-foreground pointer-events-none">
                    {currency?.symbol ?? ""}
                  </span>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`pl-8 ${inputClass}`}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date" className="text-sm font-medium text-foreground">
                  Date
                </Label>
                <Input
                  id="expense-date"
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
                  isRequired
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
              <Label htmlFor="expense-notes" className="text-sm font-medium text-foreground">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="expense-notes"
                placeholder="e.g. Store name, receipt number"
                rows={2}
                className="resize-none min-h-[72px] rounded-lg border border-input bg-background text-sm px-3 py-2"
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
              form="add-expense-form"
              disabled={isSubmitting}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Add expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
