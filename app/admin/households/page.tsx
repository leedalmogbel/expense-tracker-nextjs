"use client"

import { HouseholdsTable } from "@/components/admin/households-table"

export default function AdminHouseholdsPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Households</h1>
        <p className="mt-1 text-sm text-muted-foreground">View all registered households and their members.</p>
      </div>
      <HouseholdsTable />
    </div>
  )
}
