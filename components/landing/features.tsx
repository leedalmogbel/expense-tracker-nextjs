import { BarChart3, Bell, CreditCard, PieChart, Target, Layers } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Spending Analytics",
    description: "Visualize your spending patterns with intuitive charts and gain actionable insights to improve your finances.",
  },
  {
    icon: Target,
    title: "Budget Goals",
    description: "Set monthly budgets for each category and track your progress with real-time updates and smart alerts.",
  },
  {
    icon: CreditCard,
    title: "Auto Categorize",
    description: "Expenses are automatically categorized using smart detection so you spend less time organizing.",
  },
  {
    icon: PieChart,
    title: "Category Breakdown",
    description: "See exactly where your money goes with detailed category breakdowns and trend analysis.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified when you are approaching budget limits or when unusual spending is detected.",
  },
  {
    icon: Layers,
    title: "Multiple Accounts",
    description: "Manage all your accounts in one place. Track cash, credit cards, and savings simultaneously.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-card">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Features</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-bold text-foreground md:text-4xl">
            Everything you need to manage your money
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Powerful tools designed to give you complete control over your financial life.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:bg-card/60 dark:backdrop-blur-xl dark:hover:border-primary/40 dark:hover:shadow-primary/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold font-heading text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
