"use client"

import { useState } from "react"
import { useExpense } from "@/contexts/expense-context"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"

interface PaymentMethodPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PaymentMethodPicker({ value, onChange, className }: PaymentMethodPickerProps) {
  const { paymentMethods, addPaymentMethod } = useExpense()
  const [newMethod, setNewMethod] = useState("")

  const handleAdd = () => {
    const trimmed = newMethod.trim()
    if (!trimmed) return
    addPaymentMethod(trimmed)
    onChange(trimmed)
    setNewMethod("")
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5">
        {paymentMethods.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              value === method
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {method}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={newMethod}
          onChange={(e) => setNewMethod(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Add new..."
          className="h-7 flex-1 rounded-md border border-input bg-background px-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newMethod.trim()}
          className="inline-flex h-7 items-center gap-1 rounded-md bg-muted px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>
    </div>
  )
}
