import Link from "next/link"
import { UserPlus, Receipt, BarChart3, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description: "Sign up in seconds with Google. No credit card required to start tracking your finances.",
  },
  {
    icon: Receipt,
    step: "02",
    title: "Log Your Expenses",
    description: "Add expenses and income with smart categorization. Set budgets and track recurring bills.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Gain Insights",
    description: "View analytics by category or tag, monitor savings progress, and take control of your money.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it Works</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Get started in three simple steps
          </h2>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+40px)] right-[calc(-50%+40px)] hidden h-px bg-border md:block" />
              )}

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <step.icon className="h-7 w-7" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold font-heading text-foreground">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/login?tab=signup"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            Start Tracking Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
