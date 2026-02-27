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
import { addCreditCardReminder, updateCreditCardReminder } from "@/lib/storage"
import { toast } from "sonner"
import type { CreditCardReminder } from "@/lib/types"

const inputClass = "h-11 rounded-lg border border-input bg-background text-sm"

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const REMINDER_OPTIONS = [
  { value: "1", label: "1 day before" },
  { value: "2", label: "2 days before" },
  { value: "3", label: "3 days before" },
  { value: "5", label: "5 days before" },
  { value: "7", label: "7 days before" },
]

interface AddCreditCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCard?: CreditCardReminder | null
  onSaved?: () => void
}

export function AddCreditCardModal({ open, onOpenChange, editingCard, onSaved }: AddCreditCardModalProps) {
  const [name, setName] = useState("")
  const [lastFour, setLastFour] = useState("")
  const [dueDay, setDueDay] = useState(15)
  const [reminderDays, setReminderDays] = useState(3)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!editingCard

  useEffect(() => {
    if (open && editingCard) {
      setName(editingCard.name)
      setLastFour(editingCard.lastFourDigits ?? "")
      setDueDay(editingCard.dueDay)
      setReminderDays(editingCard.reminderDaysBefore)
    } else if (open) {
      setName("")
      setLastFour("")
      setDueDay(15)
      setReminderDays(3)
    }
  }, [open, editingCard])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    if (isEditing && editingCard) {
      updateCreditCardReminder(editingCard.id, {
        name: name.trim(),
        lastFourDigits: lastFour.trim() || undefined,
        dueDay,
        reminderDaysBefore: reminderDays,
      })
    } else {
      addCreditCardReminder({
        name: name.trim(),
        lastFourDigits: lastFour.trim() || undefined,
        dueDay,
        reminderDaysBefore: reminderDays,
        isActive: true,
      })
    }

    toast.success(isEditing ? "Card updated" : "Card added", { description: name.trim() })
    setIsSubmitting(false)
    onSaved?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="font-heading text-xl font-semibold tracking-tight text-foreground">
            {isEditing ? "Edit credit card" : "Add credit card"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {isEditing
              ? "Update your credit card details and reminder settings."
              : "Add a credit card to track its payment due date and get reminders."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="add-card-form" className="px-6 pb-6">
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="card-name" className="text-sm font-medium text-foreground">
                Card name
              </Label>
              <Input
                id="card-name"
                type="text"
                placeholder="e.g. Chase Sapphire, Citi Rewards"
                className={inputClass}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-last-four" className="text-sm font-medium text-foreground">
                Last 4 digits <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="card-last-four"
                type="text"
                placeholder="1234"
                maxLength={4}
                pattern="[0-9]*"
                className={inputClass}
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Remind me</Label>
                <Select
                  placeholder="Select"
                  classNames={{ trigger: inputClass }}
                  selectedKeys={[String(reminderDays)]}
                  onSelectionChange={(keys) => {
                    const v = Array.from(keys)[0]
                    if (v) setReminderDays(Number(v))
                  }}
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Email & push notifications</span>{" "}
                &mdash; Coming soon. For now, you&apos;ll see in-app reminders on your dashboard when a payment is approaching.
              </p>
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
              form="add-card-form"
              disabled={isSubmitting}
              className="min-w-[120px] h-10 rounded-lg"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add card"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
