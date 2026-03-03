"use client"

import { User, Users, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

type ScopeValue = "all" | "personal" | "household"

const options: { value: ScopeValue; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "personal", label: "Personal", icon: User },
  { value: "household", label: "Household", icon: Users },
]

interface ScopeFilterProps {
  value: ScopeValue
  onChange: (v: ScopeValue) => void
  className?: string
}

export function ScopeFilter({ value, onChange, className }: ScopeFilterProps) {
  return (
    <div className={cn("flex gap-1.5 rounded-full bg-muted p-1", className)}>
      {options.map((opt) => {
        const Icon = opt.icon
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
