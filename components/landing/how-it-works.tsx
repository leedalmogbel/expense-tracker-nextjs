import { UserPlus, Receipt, BarChart3 } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description: "Sign up in seconds with just your email. No credit card required to start tracking.",
  },
  {
    icon: Receipt,
    step: "02",
    title: "Log Your Expenses",
    description: "Add expenses manually or let our smart system auto-categorize your spending patterns.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Gain Insights",
    description: "View detailed analytics, set budgets, and watch your financial health improve over time.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">How it Works</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-bold text-foreground md:text-4xl">
            Get started in three simple steps
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.step} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <step.icon className="h-7 w-7" />
              </div>
              <span className="mt-4 block text-xs font-bold uppercase tracking-widest text-primary">
                Step {step.step}
              </span>
              <h3 className="mt-2 text-xl font-semibold font-heading text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
