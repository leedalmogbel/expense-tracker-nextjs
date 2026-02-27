import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="absolute top-40 left-1/3 h-[400px] w-[400px] rounded-full bg-[hsl(var(--chart-5))]/5 blur-3xl dark:bg-[hsl(var(--chart-5))]/8" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-4 py-1.5 text-sm text-accent-foreground">
            <Zap className="h-3.5 w-3.5" />
            <span>Smart expense tracking for modern life</span>
          </div>

          <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Take Control of{" "}
            <span className="text-primary">Every Dollar</span>{" "}
            You Spend
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Track expenses effortlessly, set smart budgets, and gain powerful insights
            into your spending habits. Financial clarity starts here.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8 text-base" asChild>
              <Link href="/login?tab=signup">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 text-base" asChild>
              <Link href="#how-it-works">See How it Works</Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Real-time analytics</span>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/5 dark:border-white/[0.06] dark:shadow-primary/10">
            <div className="rounded-lg bg-muted/50 p-4 md:p-8">
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
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Balance</p>
        <p className="mt-2 text-2xl font-bold font-heading text-foreground">$12,450.00</p>
        <div className="mt-2 flex items-center gap-1 text-sm text-primary">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>+12.5% from last month</span>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Monthly Spending</p>
        <p className="mt-2 text-2xl font-bold font-heading text-foreground">$3,240.50</p>
        <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
          <TrendingUp className="h-3.5 w-3.5 rotate-180" />
          <span>-8.3% from last month</span>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Savings Goal</p>
        <p className="mt-2 text-2xl font-bold font-heading text-foreground">68%</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[68%] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
