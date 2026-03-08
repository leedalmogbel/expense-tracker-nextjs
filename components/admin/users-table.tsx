"use client"

import { useCallback, useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Search, Loader2, Crown, ShieldOff, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UserRecord {
  id: string
  full_name: string | null
  email: string | null
  role: string
  is_active: boolean
  plan: string
  source: string | null
  last_active: string | null
  created_at: string
}

interface UsersResponse {
  users: UserRecord[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export function UsersTable() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(
    async (pageNum: number, searchQuery: string, append = false) => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: "20",
        })
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim())
        }

        const res = await fetch(`/api/admin/users?${params.toString()}`)
        if (!res.ok) throw new Error("Failed to fetch users")

        const data: UsersResponse = await res.json()
        setUsers((prev) => (append ? [...prev, ...data.users] : data.users))
        setHasMore(data.hasMore)
        setTotal(data.total)
      } catch (err) {
        toast.error("Failed to load users")
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchUsers(1, search)
  }, [fetchUsers, search])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchUsers(nextPage, search, true)
  }

  const handleAction = async (
    userId: string,
    action: "grant_premium" | "revoke_premium" | "deactivate" | "reactivate"
  ) => {
    try {
      setActionLoading(`${userId}-${action}`)

      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Action failed")
      }

      const updated = await res.json()

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updated.user } : u))
      )

      const labels: Record<string, string> = {
        grant_premium: "Premium granted",
        revoke_premium: "Premium revoked",
        deactivate: "User deactivated",
        reactivate: "User reactivated",
      }
      toast.success(labels[action])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {total} user{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {user.full_name || "Unnamed"}
                      </p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "superadmin" ? "default" : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        user.is_active
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        user.plan === "premium"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                      )}
                    >
                      {user.plan === "premium" ? "Premium" : "Free"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.source || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.last_active
                      ? formatDistanceToNow(new Date(user.last_active), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.plan === "premium" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `${user.id}-revoke_premium`}
                          onClick={() =>
                            handleAction(user.id, "revoke_premium")
                          }
                          className="text-xs"
                        >
                          {actionLoading === `${user.id}-revoke_premium` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <ShieldOff className="mr-1 h-3 w-3" />
                          )}
                          Revoke Premium
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `${user.id}-grant_premium`}
                          onClick={() =>
                            handleAction(user.id, "grant_premium")
                          }
                          className="text-xs"
                        >
                          {actionLoading === `${user.id}-grant_premium` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Crown className="mr-1 h-3 w-3" />
                          )}
                          Grant Premium
                        </Button>
                      )}

                      {user.is_active ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `${user.id}-deactivate`}
                          onClick={() => handleAction(user.id, "deactivate")}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          {actionLoading === `${user.id}-deactivate` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <UserX className="mr-1 h-3 w-3" />
                          )}
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoading === `${user.id}-reactivate`}
                          onClick={() => handleAction(user.id, "reactivate")}
                          className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                        >
                          {actionLoading === `${user.id}-reactivate` ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <UserCheck className="mr-1 h-3 w-3" />
                          )}
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
