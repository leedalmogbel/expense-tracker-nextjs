"use client"

import { useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddAccountModal } from "@/components/dashboard/add-account-modal"
import { useExpense } from "@/contexts/expense-context"
import {
  getBankAccounts,
  deleteBankAccount,
} from "@/lib/storage"
import {
  getAccountBalance,
  filterTransactionsByMonth,
  getMonthName,
} from "@/lib/expense-utils"
import { staggerContainer, fadeUpItem, cn } from "@/lib/utils"
import type { BankAccount } from "@/lib/types"
import {
  Landmark,
  Smartphone,
  Wallet,
  Plus,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

const ACCOUNT_TYPE_ICONS: Record<BankAccount["type"], React.ElementType> = {
  bank: Landmark,
  ewallet: Smartphone,
  cash: Wallet,
}

const ACCOUNT_TYPE_LABELS: Record<BankAccount["type"], string> = {
  bank: "Bank",
  ewallet: "E-Wallet",
  cash: "Cash",
}

export default function AccountsPage() {
  const { transactions, currency, formatCurrency, year, month } = useExpense()

  const [accounts, setAccounts] = useState<BankAccount[]>(() => getBankAccounts())
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [ledgerYear, setLedgerYear] = useState(year)
  const [ledgerMonth, setLedgerMonth] = useState(month)

  const refreshAccounts = useCallback(() => {
    setAccounts(getBankAccounts())
  }, [])

  const handleSaved = useCallback(() => {
    refreshAccounts()
  }, [refreshAccounts])

  const handleDelete = useCallback(
    (account: BankAccount) => {
      deleteBankAccount(account.id)
      toast.success("Account deleted", { description: account.name })
      if (selectedAccountId === account.id) setSelectedAccountId(null)
      refreshAccounts()
    },
    [selectedAccountId, refreshAccounts]
  )

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  )

  // Get transactions for the selected account in the ledger month
  const accountMonthTx = useMemo(() => {
    if (!selectedAccount) return []
    const monthTx = filterTransactionsByMonth(transactions, ledgerYear, ledgerMonth)
    return monthTx
      .filter((t) => t.accountId === selectedAccount.id)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [transactions, selectedAccount, ledgerYear, ledgerMonth])

  // Calculate running balance for the ledger
  // Start = initialBalance + sum of all prior transactions (before the selected month)
  const openingBalance = useMemo(() => {
    if (!selectedAccount) return 0
    const priorTx = transactions.filter((t) => {
      if (t.accountId !== selectedAccount.id) return false
      const [y, m] = t.date.split("-").map(Number)
      if (y < ledgerYear) return true
      if (y === ledgerYear && m < ledgerMonth) return true
      return false
    })
    return (
      selectedAccount.initialBalance +
      priorTx.reduce((sum, t) => sum + t.amount, 0)
    )
  }, [transactions, selectedAccount, ledgerYear, ledgerMonth])

  // Build ledger rows with running balance
  const ledgerRows = useMemo(() => {
    let running = openingBalance
    return accountMonthTx.map((tx) => {
      running += tx.amount
      return {
        tx,
        dr: tx.amount < 0 ? Math.abs(tx.amount) : null,
        cr: tx.amount > 0 ? tx.amount : null,
        balance: running,
      }
    })
  }, [accountMonthTx, openingBalance])

  const currentBalance = useMemo(() => {
    if (!selectedAccount) return 0
    return getAccountBalance(selectedAccount.id, selectedAccount.initialBalance, transactions)
  }, [selectedAccount, transactions])

  const goToPrevMonth = () => {
    if (ledgerMonth === 1) {
      setLedgerYear((y) => y - 1)
      setLedgerMonth(12)
    } else {
      setLedgerMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (ledgerMonth === 12) {
      setLedgerYear((y) => y + 1)
      setLedgerMonth(1)
    } else {
      setLedgerMonth((m) => m + 1)
    }
  }

  return (
    <div className="w-full px-4 pt-8 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:px-8 lg:pt-12 lg:pb-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your bank accounts, e-wallets, and cash
        </p>
      </div>

      {/* Account cards grid */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {accounts.map((account) => {
          const Icon = ACCOUNT_TYPE_ICONS[account.type]
          const balance = getAccountBalance(
            account.id,
            account.initialBalance,
            transactions
          )
          const isSelected = selectedAccountId === account.id

          return (
            <motion.div key={account.id} variants={fadeUpItem}>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md relative group",
                  isSelected &&
                    "ring-2 ring-primary border-primary shadow-md"
                )}
                onClick={() =>
                  setSelectedAccountId(
                    isSelected ? null : account.id
                  )
                }
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    {/* Edit / Delete icons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingAccount(account)
                          setAddModalOpen(true)
                        }}
                        aria-label="Edit account"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(account)
                        }}
                        aria-label="Delete account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground truncate">
                    {account.name}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {ACCOUNT_TYPE_LABELS[account.type]}
                  </p>
                  <p
                    className={cn(
                      "text-lg font-semibold tabular-nums",
                      balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {currency.symbol}
                    {Math.abs(balance).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* Add Account card */}
        <motion.div variants={fadeUpItem}>
          <Card
            className="cursor-pointer border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 h-full"
            onClick={() => {
              setEditingAccount(null)
              setAddModalOpen(true)
            }}
          >
            <CardContent className="p-4 sm:p-5 flex flex-col items-center justify-center h-full min-h-[140px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-2">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Add Account
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Account Ledger */}
      {selectedAccount && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-5 sm:p-6">
              {/* Ledger header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedAccount.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Current balance:{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        currentBalance >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      )}
                    >
                      {currency.symbol}
                      {Math.abs(currentBalance).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </p>
                </div>

                {/* Month navigator */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={goToPrevMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-foreground min-w-[100px] text-center">
                    {getMonthName(ledgerMonth)} {ledgerYear}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={goToNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Transaction table */}
              {ledgerRows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No transactions this month</p>
                  <p className="text-xs mt-1">
                    Transactions linked to this account will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 pr-4 font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left py-2.5 pr-4 font-medium text-muted-foreground">
                          Description
                        </th>
                        <th className="text-right py-2.5 pr-4 font-medium text-muted-foreground">
                          DR
                        </th>
                        <th className="text-right py-2.5 pr-4 font-medium text-muted-foreground">
                          CR
                        </th>
                        <th className="text-right py-2.5 font-medium text-muted-foreground">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Opening balance row */}
                      <tr className="border-b border-border/50 bg-muted/30">
                        <td className="py-2.5 pr-4 text-muted-foreground" colSpan={2}>
                          Opening Balance
                        </td>
                        <td className="py-2.5 pr-4 text-right" />
                        <td className="py-2.5 pr-4 text-right" />
                        <td className="py-2.5 text-right font-medium tabular-nums">
                          {currency.symbol}
                          {Math.abs(openingBalance).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                      {ledgerRows.map(({ tx, dr, cr, balance }) => (
                        <tr
                          key={tx.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">
                            {format(new Date(tx.date), "MMM d")}
                          </td>
                          <td className="py-2.5 pr-4 text-foreground truncate max-w-[200px]">
                            {tx.description}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums text-red-600 dark:text-red-400">
                            {dr != null
                              ? `${currency.symbol}${dr.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : ""}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                            {cr != null
                              ? `${currency.symbol}${cr.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : ""}
                          </td>
                          <td
                            className={cn(
                              "py-2.5 text-right font-medium tabular-nums",
                              balance >= 0
                                ? "text-foreground"
                                : "text-red-600 dark:text-red-400"
                            )}
                          >
                            {currency.symbol}
                            {Math.abs(balance).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add / Edit Account modal */}
      <AddAccountModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open)
          if (!open) setEditingAccount(null)
        }}
        editingAccount={editingAccount}
        onSaved={handleSaved}
      />
    </div>
  )
}
