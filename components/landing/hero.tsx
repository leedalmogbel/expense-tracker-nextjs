import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Zap, Wallet, PiggyBank } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-28">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full bg-primary/[0.04] blur-[100px] dark:bg-primary/[0.08]" />
        <div className="absolute top-60 right-1/4 h-[300px] w-[300px] rounded-full bg-[hsl(var(--chart-2))]/[0.03] blur-[80px] dark:bg-[hsl(var(--chart-2))]/[0.06]" />
        <div className="absolute bottom-0 left-1/4 h-[250px] w-[250px] rounded-full bg-[hsl(var(--chart-3))]/[0.03] blur-[80px] dark:bg-[hsl(var(--chart-3))]/[0.06]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary dark:bg-primary/10">
            <Zap className="h-3.5 w-3.5" />
            <span>Smart expense tracking for modern life</span>
          </div>

          <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Take Control of{" "}
            <span className="relative text-primary">
              Every Peso
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M1 5.5C40 2 80 1 100 3C120 5 160 6 199 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary/30" />
              </svg>
            </span>{" "}
            You Spend
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Track expenses, set budgets, and gain insights into your spending habits. Financial clarity starts here.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/login?tab=signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 sm:text-base"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted/50 hover:border-border/80 sm:text-base"
            >
              See How it Works
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-3 w-3 text-primary" />
              </div>
              <span>Secure & private</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-3 w-3 text-primary" />
              </div>
              <span>Real-time analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-3 w-3 text-primary" />
              </div>
              <span>Free to use</span>
            </div>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto mt-16 max-w-5xl md:mt-20">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-2xl dark:from-primary/5" />
          <div className="relative rounded-2xl border border-border/60 bg-card p-1.5 shadow-2xl shadow-black/[0.04] dark:border-white/[0.06] dark:shadow-black/20">
            <div className="rounded-xl bg-background p-5 md:p-8">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardPreview() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Balance</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground tracking-tight">$12,450</p>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-primary">
            <TrendingUp className="h-3 w-3" />
            <span>+12.5% vs last month</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monthly Expenses</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingUp className="h-3.5 w-3.5 text-destructive rotate-180" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground tracking-tight">$3,240</p>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
            <TrendingUp className="h-3 w-3 rotate-180" />
            <span>-8.3% vs last month</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Savings Goal</p>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <PiggyBank className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground tracking-tight">68%</p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all" />
          </div>
        </div>
      </div>

      {/* Mini chart simulation */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Spending Trend</p>
          <p className="text-xs text-muted-foreground">Last 7 months</p>
        </div>
        <div className="flex items-end gap-2 h-20">
          {[40, 65, 45, 70, 55, 80, 60].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-md bg-primary/15 dark:bg-primary/20 transition-all"
                style={{ height: `${h}%` }}
              >
                <div
                  className="w-full rounded-md bg-primary transition-all"
                  style={{ height: `${Math.min(h * 0.7, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
