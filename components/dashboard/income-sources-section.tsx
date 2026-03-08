"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useExpense } from "@/contexts/expense-context"
import { getIncomeSources } from "@/lib/storage"
import { getOrdinalSuffix } from "@/lib/expense-utils"
import { DollarSign, Check, Circle } from "lucide-react"
import { AddIncomeSourceModal } from "./add-income-source-modal"
import type { IncomeSource } from "@/lib/types"

export function IncomeSourcesSection() {
  const { incomeTransactions, formatCurrency } = useExpense()

  const [sources, setSources] = useState<IncomeSource[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  const loadSources = useCallback(() => {
    setSources(getIncomeSources())
  }, [])

  useEffect(() => {
    loadSources()
  }, [loadSources])

  const activeSources = useMemo(
    () => sources.filter((s) => s.isActive),
    [sources]
  )

  const receivedMap = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const source of activeSources) {
      const nameLower = source.name.toLowerCase()
      const received = incomeTransactions.some((tx) =>
        tx.description.toLowerCase().includes(nameLower)
      )
      map.set(source.id, received)
    }
    return map
  }, [activeSources, incomeTransactions])

  const expectedTotal = useMemo(
    () => activeSources.reduce((sum, s) => sum + s.expectedAmount, 0),
    [activeSources]
  )

  const receivedTotal = useMemo(
    () =>
      activeSources
        .filter((s) => receivedMap.get(s.id))
        .reduce((sum, s) => sum + s.expectedAmount, 0),
    [activeSources, receivedMap]
  )

  const receivedCount = useMemo(
    () => activeSources.filter((s) => receivedMap.get(s.id)).length,
    [activeSources, receivedMap]
  )

  const formatPayDay = (payDay: number | "EOM") => {
    if (payDay === "EOM") return "EOM"
    return getOrdinalSuffix(payDay)
  }

  if (sources.length === 0) {
    return (
      <>
        <Card className="w-full border-border">
          <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
            <div className="flex items-start justify-between gap-4 w-full">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                    Income Sources
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Track expected vs received</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="shrink-0 inline-flex items-center rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:text-primary sm:text-sm sm:px-4 sm:py-2"
              >
                Manage
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No income sources</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add your expected income sources to track what&apos;s been received each month
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Add income source
              </button>
            </div>
          </CardContent>
        </Card>

        <AddIncomeSourceModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSaved={loadSources}
        />
      </>
    )
  }

  return (
    <>
      <Card className="w-full border-border">
        <CardHeader className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 border-b border-border">
          <div className="flex items-start justify-between gap-4 w-full">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="font-heading text-lg font-semibold text-foreground tracking-tight">
                  Income Sources
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {receivedCount} of {activeSources.length} received this month
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="shrink-0 inline-flex items-center rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted hover:text-primary sm:text-sm sm:px-4 sm:py-2"
            >
              Manage
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-3">
            {activeSources.map((source) => {
              const received = receivedMap.get(source.id) ?? false
              return (
                <div
                  key={source.id}
                  className="flex items-center gap-3"
                >
                  <div className="shrink-0">
                    {received ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center">
                        <Circle className="h-5 w-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {source.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium tabular-nums text-foreground">
                      {formatCurrency(source.expectedAmount)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatPayDay(source.payDay)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary bar */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-sm font-semibold text-foreground tabular-nums">
                {formatCurrency(expectedTotal)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Received</p>
              <p className="text-sm font-semibold text-primary tabular-nums">
                {formatCurrency(receivedTotal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddIncomeSourceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={loadSources}
      />
    </>
  )
}
