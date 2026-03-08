"use client"

import {
  Users,
  Crown,
  UserCheck,
  UserX,
  Gift,
  Home,
  CreditCard,
  Zap,
  UserPlus,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AdminStatsProps {
  stats: {
    totalUsers: number
    premiumUsers: number
    freeUsers: number
    earlyAdopterSlotsUsed: number
    earlyAdopterSlotsRemaining: number
    activeUsers: number
    inactiveUsers: number
    totalHouseholds: number
    totalTransactions: number
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  const items = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      label: "Premium Users",
      value: stats.premiumUsers,
      icon: Crown,
      iconBg: "bg-amber-500/10 text-amber-500",
    },
    {
      label: "Free Users",
      value: stats.freeUsers,
      icon: UserPlus,
      iconBg: "bg-slate-500/10 text-slate-500",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      iconBg: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Inactive Users",
      value: stats.inactiveUsers,
      icon: UserX,
      iconBg: "bg-rose-500/10 text-rose-500",
    },
    {
      label: "Early Adopter Slots Used",
      value: stats.earlyAdopterSlotsUsed,
      icon: Zap,
      iconBg: "bg-violet-500/10 text-violet-500",
    },
    {
      label: "Slots Remaining",
      value: stats.earlyAdopterSlotsRemaining,
      icon: Gift,
      iconBg: "bg-cyan-500/10 text-cyan-500",
    },
    {
      label: "Households",
      value: stats.totalHouseholds,
      icon: Home,
      iconBg: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Total Transactions",
      value: stats.totalTransactions,
      icon: CreditCard,
      iconBg: "bg-orange-500/10 text-orange-500",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.label}
          className="border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20"
        >
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
                {item.label}
              </p>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
              {item.value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
