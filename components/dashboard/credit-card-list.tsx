"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCreditCardReminders, updateCreditCardReminder, deleteCreditCardReminder } from "@/lib/storage"
import { getOrdinalSuffix } from "@/lib/expense-utils"
import type { CreditCardReminder } from "@/lib/types"
import { toast } from "sonner"
import { CreditCard, Trash2, Pencil, Bell, BellOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@heroui/react"
import { Badge } from "@/components/ui/badge"

interface CreditCardListProps {
  onEdit?: (card: CreditCardReminder) => void
  onRefresh?: () => void
}

export function CreditCardList({ onEdit, onRefresh }: CreditCardListProps) {
  const [reminders, setReminders] = useState<CreditCardReminder[]>([])

  useEffect(() => {
    setReminders(getCreditCardReminders())
  }, [])

  const handleToggle = (id: string, isActive: boolean) => {
    updateCreditCardReminder(id, { isActive })
    setReminders(getCreditCardReminders())
    toast.success(isActive ? "Reminder enabled" : "Reminder disabled")
  }

  const handleDelete = (id: string) => {
    const card = reminders.find((r) => r.id === id)
    deleteCreditCardReminder(id)
    setReminders(getCreditCardReminders())
    toast.success("Card removed", { description: card?.name })
    onRefresh?.()
  }

  return (
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
          <ul className="divide-y divide-border">
            {reminders.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3 first:pt-0">
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
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 font-normal">
                      Due {getOrdinalSuffix(r.dueDay)}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 font-normal">
                      {r.isActive ? (
                        <><Bell className="h-3 w-3 mr-1" />{r.reminderDaysBefore}d before</>
                      ) : (
                        <><BellOff className="h-3 w-3 mr-1" />Off</>
                      )}
                    </Badge>
                  </div>
                </div>
                <Switch
                  size="sm"
                  isSelected={r.isActive}
                  onValueChange={(val) => handleToggle(r.id, val)}
                  aria-label="Toggle reminder"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit?.(r)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(r.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
