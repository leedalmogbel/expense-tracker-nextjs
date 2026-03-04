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
import { addCreditCardInstallment } from "@/lib/storage"
import { toast } from "sonner"
import type { CreditCardReminder, InstallmentPayment } from "@/lib/types"
import { Plus, X } from "lucide-react"
import { addMonths, format } from "date-fns"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const MONTH_OPTIONS = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "9", label: "9 months" },
  { value: "12", label: "12 months" },
  { value: "18", label: "18 months" },
  { value: "24", label: "24 months" },
  { value: "36", label: "36 months" },
]

interface AddInstallmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CreditCardReminder | null
  onSaved?: () => void
}

function generatePayments(startDate: string, totalMonths: number): InstallmentPayment[] {
  const start = new Date(startDate + "T00:00:00")
  return Array.from({ length: totalMonths }, (_, i) => ({
    monthNumber: i + 1,
    expectedDate: format(addMonths(start, i), "yyyy-MM-dd"),
    status: "pending" as const,
  }))
}

export function AddInstallmentModal({
  open,
  onOpenChange,
  card,
  onSaved,
}: AddInstallmentModalProps) {
  const [items, setItems] = useState<string[]>([""])
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [totalMonths, setTotalMonths] = useState(6)
  const [totalAmount, setTotalAmount] = useState("")
  const [monthlyOverride, setMonthlyOverride] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parsedTotal = parseFloat(totalAmount)
  const autoMonthly = parsedTotal > 0 ? parsedTotal / totalMonths : 0
  const parsedOverride = parseFloat(monthlyOverride)
  const monthlyInstallment = parsedOverride > 0 ? parsedOverride : autoMonthly

  useEffect(() => {
    if (open) {
      setItems([""])
      setDescription("")
      setStartDate(format(new Date(), "yyyy-MM-dd"))
      setTotalMonths(6)
      setTotalAmount("")
      setMonthlyOverride("")
    }
  }, [open])

  const addItem = () => setItems([...items, ""])
  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }
  const updateItem = (index: number, value: string) => {
    const updated = [...items]
    updated[index] = value
    setItems(updated)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!card) return

    const validItems = items.map((i) => i.trim()).filter(Boolean)
    if (validItems.length === 0 || parsedTotal <= 0 || !startDate) return

    setIsSubmitting(true)

    const payments = generatePayments(startDate, totalMonths)

    addCreditCardInstallment({
      cardId: card.id,
      items: validItems,
      description: description.trim() || undefined,
      startDate,
      totalMonths,
      totalAmount: parsedTotal,
      monthlyInstallment: Math.round(monthlyInstallment * 100) / 100,
      payments,
      status: "active",
    })

    toast.success("Installment added", {
      description: `${validItems[0]}${validItems.length > 1 ? ` +${validItems.length - 1} more` : ""} - ${totalMonths} months`,
    })
    setIsSubmitting(false)
    onSaved?.()
    onOpenChange(false)
  }

  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Add installment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Track a purchase installment on {card.name}
            {card.lastFourDigits ? ` (****${card.lastFourDigits})` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-installment-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            {/* Purchased items */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Purchased item(s)
              </Label>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder={`e.g. Another item`}
                    className={inputClass + " flex-1"}
                    required={i === 0}
                    value={item}
                    onChange={(e) => updateItem(i, e.target.value)}
                  />
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={addItem}
              >
                <Plus className="h-3 w-3" /> Add another item
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="inst-desc" className="text-sm font-medium text-foreground">
                Description <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="inst-desc"
                type="text"
                placeholder="e.g. Birthday gift, Medical expense"
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Total amount + Months */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inst-amount" className="text-sm font-medium text-foreground">
                  Total amount
                </Label>
                <Input
                  id="inst-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className={inputClass}
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Number of months</Label>
                <Select
                  placeholder="Select"
                  classNames={{ trigger: inputClass }}
                  selectedKeys={[String(totalMonths)]}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0]
                    if (v) setTotalMonths(Number(v))
                  }}
                >
                  {MONTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Monthly installment */}
            <div className="space-y-2">
              <Label htmlFor="inst-monthly" className="text-sm font-medium text-foreground">
                Monthly installment
              </Label>
              <div className="relative">
                <Input
                  id="inst-monthly"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={autoMonthly > 0 ? autoMonthly.toFixed(2) : "Auto-calculated"}
                  className={inputClass}
                  value={monthlyOverride}
                  onChange={(e) => setMonthlyOverride(e.target.value)}
                />
              </div>
              {parsedTotal > 0 && !parsedOverride && (
                <p className="text-xs text-muted-foreground">
                  Auto-calculated: {autoMonthly.toFixed(2)}/month
                </p>
              )}
              {parsedOverride > 0 && parsedTotal > 0 && (
                <p className="text-xs text-muted-foreground">
                  Override: {parsedOverride.toFixed(2)}/month (auto would be {autoMonthly.toFixed(2)})
                </p>
              )}
            </div>

            {/* Start date */}
            <div className="space-y-2">
              <Label htmlFor="inst-start" className="text-sm font-medium text-foreground">
                First billing date
              </Label>
              <Input
                id="inst-start"
                type="date"
                className={inputClass}
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
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
              form="add-installment-form"
              disabled={isSubmitting}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                "Add installment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
