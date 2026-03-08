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
import { addLoan, updateLoan } from "@/lib/storage"
import { toast } from "sonner"
import type { Loan } from "@/lib/types"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

interface AddLoanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingLoan?: Loan | null
  onSaved?: () => void
}

export function AddLoanModal({ open, onOpenChange, editingLoan, onSaved }: AddLoanModalProps) {
  const [name, setName] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [monthlyPayment, setMonthlyPayment] = useState("")
  const [totalMonths, setTotalMonths] = useState("")
  const [startDate, setStartDate] = useState("")
  const [dueDay, setDueDay] = useState(15)
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!editingLoan

  useEffect(() => {
    if (open && editingLoan) {
      setName(editingLoan.name)
      setTotalAmount(String(editingLoan.totalAmount))
      setMonthlyPayment(String(editingLoan.monthlyPayment))
      setTotalMonths(String(editingLoan.totalMonths))
      setStartDate(editingLoan.startDate)
      setDueDay(editingLoan.dueDay)
      setNote(editingLoan.note ?? "")
    } else if (open) {
      setName("")
      setTotalAmount("")
      setMonthlyPayment("")
      setTotalMonths("")
      setStartDate(new Date().toISOString().split("T")[0])
      setDueDay(15)
      setNote("")
    }
  }, [open, editingLoan])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsedTotal = parseFloat(totalAmount)
    const parsedMonthly = parseFloat(monthlyPayment)
    const parsedMonths = parseInt(totalMonths, 10)

    if (!name.trim() || isNaN(parsedTotal) || parsedTotal <= 0) return
    if (isNaN(parsedMonthly) || parsedMonthly <= 0) return
    if (isNaN(parsedMonths) || parsedMonths <= 0) return
    if (!startDate) return

    setIsSubmitting(true)

    if (isEditing && editingLoan) {
      updateLoan(editingLoan.id, {
        name: name.trim(),
        totalAmount: parsedTotal,
        monthlyPayment: parsedMonthly,
        totalMonths: parsedMonths,
        startDate,
        dueDay,
        note: note.trim() || undefined,
      })
    } else {
      addLoan({
        name: name.trim(),
        totalAmount: parsedTotal,
        monthlyPayment: parsedMonthly,
        totalMonths: parsedMonths,
        startDate,
        dueDay,
        payments: [],
        note: note.trim() || undefined,
        isActive: true,
      })
    }

    toast.success(isEditing ? "Loan updated" : "Loan added", { description: name.trim() })
    setIsSubmitting(false)
    onSaved?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {isEditing ? "Edit loan" : "Add loan"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {isEditing
              ? "Update your loan details."
              : "Add a loan or amortization to track monthly payments."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-loan-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="loan-name" className="text-sm font-medium text-foreground">
                Loan name
              </Label>
              <Input
                id="loan-name"
                type="text"
                placeholder="e.g. Home Loan, Car Loan, Personal Loan"
                className={inputClass}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-total" className="text-sm font-medium text-foreground">
                Total amount
              </Label>
              <Input
                id="loan-total"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 500000"
                className={inputClass}
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loan-monthly" className="text-sm font-medium text-foreground">
                  Monthly payment
                </Label>
                <Input
                  id="loan-monthly"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 15000"
                  className={inputClass}
                  required
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loan-months" className="text-sm font-medium text-foreground">
                  Total months
                </Label>
                <Input
                  id="loan-months"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 36"
                  className={inputClass}
                  required
                  value={totalMonths}
                  onChange={(e) => setTotalMonths(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loan-start-date" className="text-sm font-medium text-foreground">
                  Start date
                </Label>
                <Input
                  id="loan-start-date"
                  type="date"
                  className={inputClass}
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Due day of month</Label>
                <Select
                  placeholder="Select day"
                  classNames={{ trigger: inputClass }}
                  selectedKeys={[String(dueDay)]}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0]
                    if (v) setDueDay(Number(v))
                  }}
                >
                  {DAYS.map((d) => (
                    <SelectItem key={String(d)}>{String(d)}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-note" className="text-sm font-medium text-foreground">
                Note <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="loan-note"
                type="text"
                placeholder="e.g. Bank of PI housing loan"
                className={inputClass}
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
              form="add-loan-form"
              disabled={isSubmitting}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add loan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
