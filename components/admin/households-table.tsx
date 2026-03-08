"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Household {
  id: string
  name: string
  owner_name: string | null
  owner_email: string | null
  member_count: number
  created_at: string
}

export function HouseholdsTable() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHouseholds = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/households")
      if (!res.ok) throw new Error("Failed to fetch households")
      const data = await res.json()
      setHouseholds(data.households ?? data)
    } catch (err) {
      toast.error("Failed to load households")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHouseholds()
  }, [fetchHouseholds])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {households.length} household{households.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Household Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : households.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No households found.
                </TableCell>
              </TableRow>
            ) : (
              households.map((household) => (
                <TableRow key={household.id}>
                  <TableCell className="font-medium text-foreground">
                    {household.name}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-foreground">
                        {household.owner_name || "Unknown"}
                      </p>
                      {household.owner_email && (
                        <p className="text-xs text-muted-foreground">
                          {household.owner_email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {household.member_count}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(household.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
