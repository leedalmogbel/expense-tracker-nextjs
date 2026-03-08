"use client"

import { PromoCodeTable } from "@/components/admin/promo-code-table"

export default function AdminPromoCodesPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Promo Codes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create and manage promotional codes for premium access.</p>
      </div>
      <PromoCodeTable />
    </div>
  )
}
