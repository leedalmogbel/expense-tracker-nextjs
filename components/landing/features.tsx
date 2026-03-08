import { BarChart3, Bell, CreditCard, PieChart, Target, Landmark } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Spending Analytics",
    description: "Visualize spending patterns with intuitive charts and gain actionable insights.",
    color: "text-[hsl(var(--chart-2))]",
    bg: "bg-[hsl(var(--chart-2))]/10",
  },
  {
    icon: Target,
    title: "Budget Goals",
    description: "Set monthly budgets per category and track progress with real-time updates.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: CreditCard,
    title: "Card Tracking",
    description: "Track credit card payments, installments, and due dates in one place.",
    color: "text-[hsl(var(--chart-5))]",
    bg: "bg-[hsl(var(--chart-5))]/10",
  },
  {
    icon: PieChart,
    title: "Category Breakdown",
    description: "See exactly where your money goes with detailed breakdowns and tag analysis.",
    color: "text-[hsl(var(--chart-4))]",
    bg: "bg-[hsl(var(--chart-4))]/10",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified when approaching budget limits or when bills are due.",
    color: "text-[hsl(var(--chart-3))]",
    bg: "bg-[hsl(var(--chart-3))]/10",
  },
  {
    icon: Landmark,
    title: "Multiple Accounts",
    description: "Manage bank accounts, e-wallets, and cash with running balance ledgers.",
    color: "text-[hsl(var(--chart-1))]",
    bg: "bg-[hsl(var(--chart-1))]/10",
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-20 md:py-28">
      <div className="absolute inset-0 bg-card/50 dark:bg-card/30" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need to manage your money
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed md:text-lg">
            Powerful tools designed to give you complete control over your financial life.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border/60 bg-background p-6 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/[0.03] dark:bg-card dark:hover:shadow-black/10"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg} ${feature.color} transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold font-heading text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
