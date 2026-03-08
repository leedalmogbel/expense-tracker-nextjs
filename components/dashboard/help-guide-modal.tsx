"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Target,
  Grid3X3,
  ArrowUpCircle,
  CreditCard,
  ShoppingCart,
  Landmark,
  Users,
  Activity,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Lightbulb,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface HelpGuide {
  id: string
  title: string
  shortDesc: string
  icon: LucideIcon
  color: string
  bg: string
  steps: { title: string; description: string }[]
}

const HELP_GUIDES: HelpGuide[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    shortDesc: "Your complete financial snapshot",
    icon: LayoutDashboard,
    color: "text-primary",
    bg: "bg-primary/10",
    steps: [
      { title: "Balance & Trends", description: "Your total balance is front and center with a month-over-month trend pill showing whether you're up or down compared to last month." },
      { title: "Income vs Expenses", description: "Side-by-side cards show this month's income and expenses with trend arrows so you can see if spending is rising or falling." },
      { title: "Budget, Today & Savings", description: "Three quick stats: your budget usage percentage with a progress bar, how much you've spent today, and your monthly savings rate." },
      { title: "Scope Filter", description: "Toggle between All, Personal, and Household views to see only the data that matters to you." },
      { title: "Pending Bills & Activity", description: "Upcoming bills appear with due dates, and the activity feed shows your latest transactions grouped by date with daily net totals." },
      { title: "Pro Tip", description: "Use the navigation cards at the bottom to quickly jump to Transactions, Analytics, Budgets, Income, or Shopping Trips." },
    ],
  },
  {
    id: "transactions",
    title: "Transactions",
    shortDesc: "Filter, search, and manage every transaction",
    icon: Receipt,
    color: "text-primary",
    bg: "bg-primary/10",
    steps: [
      { title: "Add Transactions", description: "Tap the floating + button to add an expense, budget entry, or income. Each transaction gets a category, amount, date, and optional tag." },
      { title: "Collapsible Filters", description: "Tap the Filters bar to reveal date presets (This Week, 30 Days, 90 Days), custom date ranges, category pills, and tag filters. A badge shows how many filters are active." },
      { title: "Analytics Chart", description: "The bar chart at the top visualizes your transactions by category. Tap a bar to instantly filter the list by that category." },
      { title: "Edit & Delete", description: "Tap the three-dot menu on any transaction to edit its details or delete it. Household transactions sync across all members." },
      { title: "Scope & Pagination", description: "Switch between Personal and Household scope. Results are paginated at 20 per page — use the arrows to navigate." },
      { title: "Pro Tip", description: "Combine a date preset with a tag filter (like 'Needs') to see exactly how much you spent on essentials this month." },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    shortDesc: "Visualize spending trends and patterns",
    icon: BarChart3,
    color: "text-[hsl(var(--chart-4))]",
    bg: "bg-[hsl(var(--chart-4))]/10",
    steps: [
      { title: "Period Views", description: "Toggle between Daily, Weekly, Monthly, and Yearly views using the pill buttons at the top to see your data at different time scales." },
      { title: "Income vs Expense Chart", description: "The main chart plots income and expenses over time so you can spot spending spikes and income patterns at a glance." },
      { title: "Category Breakdown", description: "A donut chart breaks down your spending by category with percentages, showing you exactly where the money goes." },
      { title: "Income & Expense Summary", description: "Two summary cards show your monthly income and expense totals side by side for quick comparison." },
      { title: "Yearly Tag Summary", description: "Scroll down to see your full-year spending grouped by tags (Needs, Wants, Family, etc.) with progress bars showing each tag's share of total spending." },
      { title: "Pro Tip", description: "Check the yearly tag summary regularly — if 'Wants' is overtaking 'Needs', it might be time to adjust your spending habits." },
    ],
  },
  {
    id: "budgets",
    title: "Budgets",
    shortDesc: "Set spending limits and track progress",
    icon: Target,
    color: "text-[hsl(var(--chart-3))]",
    bg: "bg-[hsl(var(--chart-3))]/10",
    steps: [
      { title: "Set a Monthly Budget", description: "Tap 'Manage' to create or update your monthly budget. Set the total amount you want to spend this month." },
      { title: "Live Progress Tracking", description: "A color-coded progress bar shows how much you've spent vs. your budget. Green means on track, red means over budget." },
      { title: "Budget vs Expense Cards", description: "See your budget amount alongside actual spending with percentage breakdowns and remaining balance." },
      { title: "Savings Progress", description: "Track your monthly savings — the difference between income and expenses — with a savings rate percentage." },
      { title: "Pro Tip", description: "Set your budget slightly below what you can actually afford. The buffer gives you room for unexpected expenses without going over." },
    ],
  },
  {
    id: "categories",
    title: "Categories",
    shortDesc: "See where your money goes by category",
    icon: Grid3X3,
    color: "text-[hsl(var(--chart-2))]",
    bg: "bg-[hsl(var(--chart-2))]/10",
    steps: [
      { title: "Expense & Income Categories", description: "Browse all categories as icon cards in a grid. Expense categories (Food, Transport, etc.) and income categories (Salary, Freelance, etc.) are shown separately." },
      { title: "Category Totals", description: "Each card shows the total amount spent or earned in that category for the current month, giving you a quick breakdown." },
      { title: "Drill Into Details", description: "Tap any category card to see all transactions in that category with individual amounts and dates." },
      { title: "Pro Tip", description: "Check your top 3 expense categories each month — they usually account for 60-80% of total spending and are the best targets for savings." },
    ],
  },
  {
    id: "income",
    title: "Income",
    shortDesc: "Track all your income sources and trends",
    icon: ArrowUpCircle,
    color: "text-[hsl(var(--chart-2))]",
    bg: "bg-[hsl(var(--chart-2))]/10",
    steps: [
      { title: "Income Sources", description: "Add and manage all your income sources — salary, freelance, side business, investments. Each source shows its monthly amount." },
      { title: "Monthly Summary Cards", description: "See your total monthly income, number of active sources, and how income compares to expenses at a glance." },
      { title: "Income Trends", description: "A trend chart visualizes your income over time so you can track growth or spot dips across months." },
      { title: "Income Breakdown", description: "See the distribution of your income by source — know which streams contribute the most to your total." },
      { title: "Pro Tip", description: "Even small side income adds up. Track everything including cashback, refunds, and gifts to get an accurate picture of your finances." },
    ],
  },
  {
    id: "cards",
    title: "Cards & Loans",
    shortDesc: "Credit cards, payments, installments, and loans",
    icon: CreditCard,
    color: "text-[hsl(var(--chart-5))]",
    bg: "bg-[hsl(var(--chart-5))]/10",
    steps: [
      { title: "Two Tabs: Cards & Loans", description: "Switch between Credit Cards and Loans using the tab toggle. Each has its own list, tracking, and payment features." },
      { title: "Credit Card Tracking", description: "Register cards with name, last 4 digits, due date, credit limit, and reminder settings. Toggle reminders on/off per card." },
      { title: "Payment Status", description: "Each month shows a status badge — Paid, Unpaid, or Overdue. Record payments with amount and date, then navigate between months." },
      { title: "Credit Limit Chart", description: "When you set a credit limit, a donut chart shows your usage percentage. Color changes from green to amber to red as you approach the limit." },
      { title: "Installment Tracking", description: "Add buy-now-pay-later installments to any card. Track each monthly payment with a progress bar, and tap 'Mark Paid' to log payments." },
      { title: "Pro Tip", description: "Keep credit utilization below 30% of your limit — the chart makes this easy to monitor. Set reminders a few days before due dates to avoid late fees." },
    ],
  },
  {
    id: "shopping-trips",
    title: "Shopping Trips",
    shortDesc: "Plan trips, track items, and manage projects",
    icon: ShoppingCart,
    color: "text-[hsl(var(--chart-3))]",
    bg: "bg-[hsl(var(--chart-3))]/10",
    steps: [
      { title: "Two Tabs: Trips & Projects", description: "Switch between Shopping Trips (one-time shopping runs) and Projects (larger purchases you're saving for or planning)." },
      { title: "Create a Trip", description: "Start a new trip with a type (Grocery, Clothing, Electronics, etc.) and optional budget. Add items with prices as you shop." },
      { title: "Live Tracking", description: "Check off items as you buy them. The running total updates in real time so you can see how you're doing against your budget." },
      { title: "Auto-Convert to Expense", description: "When you finish a trip, it automatically converts to an expense transaction — no need to log it separately." },
      { title: "Purchase Projects", description: "Track bigger purchases over time. Set a target budget, add items, and monitor progress toward your goal." },
      { title: "Pro Tip", description: "Create your grocery list before heading to the store and set a budget. You'll spend less when you have a clear plan." },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    shortDesc: "Bank accounts, e-wallets, and ledgers",
    icon: Landmark,
    color: "text-[hsl(var(--chart-1))]",
    bg: "bg-[hsl(var(--chart-1))]/10",
    steps: [
      { title: "Multiple Account Types", description: "Track Bank accounts, E-Wallets, and Cash accounts. Each shows its name, type, and current balance with color coding." },
      { title: "Account Cards", description: "All accounts appear as cards in a grid. Positive balances show in green, negative in red. Hover to reveal edit and delete options." },
      { title: "Account Ledger", description: "Tap an account to open its full ledger — a detailed table with Date, Description, Debit, Credit, and Running Balance columns." },
      { title: "Month Navigation", description: "Navigate between months in the ledger using arrow buttons. The opening balance carries over from the previous month." },
      { title: "Pro Tip", description: "Use separate accounts for different purposes (e.g., 'Bills Account', 'Savings', 'Daily Spending') to see where your money lives." },
    ],
  },
  {
    id: "members",
    title: "Members",
    shortDesc: "Share finances with your household",
    icon: Users,
    color: "text-[hsl(var(--chart-3))]",
    bg: "bg-[hsl(var(--chart-3))]/10",
    steps: [
      { title: "Household Sharing", description: "Connect with family members or housemates to share expense tracking. Everyone sees the same household transactions in real time." },
      { title: "Invite by Email", description: "Household owners can send email invitations. Invitees get a link to join and their data syncs automatically via the cloud." },
      { title: "Roles & Permissions", description: "Owners can invite, remove members, and manage the household. Members can view and add shared transactions." },
      { title: "Pending Invites", description: "Track outstanding invitations — resend or cancel them from the pending invites section." },
      { title: "Pro Tip", description: "Mark shared bills (rent, utilities, groceries) as 'Household' scope so everyone can see them. Keep personal spending as 'Personal'." },
    ],
  },
  {
    id: "activity",
    title: "Activity",
    shortDesc: "Your recent financial activity at a glance",
    icon: Activity,
    color: "text-[hsl(var(--chart-4))]",
    bg: "bg-[hsl(var(--chart-4))]/10",
    steps: [
      { title: "Chronological Feed", description: "See your most recent transactions in order, with the latest first. Each entry shows the category icon, description, payment method, and amount." },
      { title: "Daily Net Totals", description: "Transactions are grouped by date. Each day header shows the net total — green if you earned more than you spent, red if the opposite." },
      { title: "Scope Badges", description: "Each transaction is tagged as Personal or Household (HH) so you can tell at a glance who it belongs to." },
      { title: "Pro Tip", description: "Check the activity feed daily to catch any transactions you might have forgotten to categorize or that look unfamiliar." },
    ],
  },
  {
    id: "profile",
    title: "Profile",
    shortDesc: "Your account details and stats",
    icon: User,
    color: "text-primary",
    bg: "bg-primary/10",
    steps: [
      { title: "Account Information", description: "View your display name, email address, and account details. Your avatar initials are generated from your name." },
      { title: "Financial Stats", description: "See summary stats including total transaction count, account creation date, and household membership details." },
      { title: "Pro Tip", description: "Access your profile quickly from the avatar icon in the mobile header menu." },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    shortDesc: "Customize currency, tags, bills, sync, and more",
    icon: Settings,
    color: "text-muted-foreground",
    bg: "bg-muted",
    steps: [
      { title: "Currency", description: "Choose your currency from a dropdown with 50+ options. The symbol and format apply instantly across the entire app." },
      { title: "Expense Tags", description: "Create custom tags (like Needs, Wants, Family) with color-coded labels. Assign categories to tags so transactions are auto-tagged." },
      { title: "Recurring Bills", description: "Set up recurring bills with description, amount, category, payment method, and due day. They'll appear in your Pending Bills on the dashboard." },
      { title: "Payment Methods", description: "Add payment methods (Cash, Credit Card, GCash, PayPal, etc.) that show as options when logging transactions." },
      { title: "Export & Cloud Sync", description: "Export all transactions to CSV with one tap. Sign in with Google to sync data to the cloud and share with household members." },
      { title: "Pro Tip", description: "Set up your tags and recurring bills first — they save you time on every transaction you add going forward." },
    ],
  },
]

interface HelpGuideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpGuideModal({ open, onOpenChange }: HelpGuideModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedGuide = selectedId ? HELP_GUIDES.find((g) => g.id === selectedId) : null

  function handleClose() {
    setSelectedId(null)
    onOpenChange(false)
  }

  function handleBack() {
    setSelectedId(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
        {selectedGuide ? (
          <>
            {/* Detail view */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Back to guides"
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", selectedGuide.bg)}>
                <selectedGuide.icon className={cn("h-4.5 w-4.5", selectedGuide.color)} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold font-heading text-foreground tracking-tight">
                  {selectedGuide.title}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedGuide.shortDesc}</p>
              </div>
            </div>

            <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {selectedGuide.steps.map((step, i) => {
                  const isProTip = step.title === "Pro Tip"
                  return (
                    <div key={i} className={cn("flex gap-3", isProTip && "mt-2 pt-3 border-t border-border/50")}>
                      {isProTip ? (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mt-0.5">
                          <Lightbulb className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                          {i + 1}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm font-medium", isProTip ? "text-amber-500" : "text-foreground")}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-border">
              <Button onClick={handleBack} variant="outline" className="w-full rounded-xl">
                Back to guides
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* List view */}
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold font-heading text-foreground tracking-tight">
                  Help & Guides
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tap a feature to learn how it works
                </p>
              </div>
            </div>

            <div className="px-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HELP_GUIDES.map((guide) => {
                  const Icon = guide.icon
                  return (
                    <button
                      key={guide.id}
                      type="button"
                      onClick={() => setSelectedId(guide.id)}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted/70 active:scale-[0.98]"
                    >
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", guide.bg)}>
                        <Icon className={cn("h-4 w-4", guide.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{guide.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{guide.shortDesc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
