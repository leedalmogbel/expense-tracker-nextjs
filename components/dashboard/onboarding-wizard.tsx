"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Receipt,
  PieChart,
  Target,
  BarChart3,
  CreditCard,
  Users,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { setOnboardingDismissed } from "@/lib/storage"

interface OnboardingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  {
    title: "Welcome to Dosh Mate",
    description:
      "Your personal finance tracker. Take control of every peso you spend with powerful tools designed for your financial life.",
    icons: null, // uses logo
  },
  {
    title: "Track Everything",
    description:
      "Log expenses and income with smart categories. Tag them as Needs, Wants, or Family to see where your money really goes.",
    icons: [Receipt, PieChart],
    iconColors: ["text-primary", "text-[hsl(var(--chart-4))]"],
    iconBgs: ["bg-primary/10", "bg-[hsl(var(--chart-4))]/10"],
  },
  {
    title: "Budgets & Analytics",
    description:
      "Set monthly budgets per category and track progress in real time. View spending trends and detailed breakdowns in Analytics.",
    icons: [Target, BarChart3],
    iconColors: ["text-primary", "text-[hsl(var(--chart-2))]"],
    iconBgs: ["bg-primary/10", "bg-[hsl(var(--chart-2))]/10"],
  },
  {
    title: "And So Much More",
    description:
      "Track credit card payments, manage recurring bills, monitor bank accounts, plan shopping trips, and share expenses with your household.",
    icons: [CreditCard, Users],
    iconColors: ["text-[hsl(var(--chart-5))]", "text-[hsl(var(--chart-3))]"],
    iconBgs: ["bg-[hsl(var(--chart-5))]/10", "bg-[hsl(var(--chart-3))]/10"],
  },
  {
    title: "Need Help?",
    description:
      "Tap the ? icon in the top bar anytime to see step-by-step guides for every feature. You'll find tips on how to use each page.",
    icons: [HelpCircle],
    iconColors: ["text-primary"],
    iconBgs: ["bg-primary/10"],
  },
]

export function OnboardingWizard({ open, onOpenChange }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [dontShow, setDontShow] = useState(false)

  const isLast = step === steps.length - 1
  const current = steps[step]

  function handleClose() {
    if (dontShow) {
      setOnboardingDismissed(true)
    }
    setStep(0)
    onOpenChange(false)
  }

  function handleNext() {
    if (isLast) {
      handleClose()
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1))
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Content */}
        <div className="px-6 pt-8 pb-6 text-center">
          {/* Icon area */}
          <div className="flex items-center justify-center gap-3 mb-6">
            {step === 0 ? (
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Image
                  src="/assets/doshmate-logo.png"
                  alt="Dosh Mate"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            ) : (
              current.icons?.map((Icon, i) => (
                <div
                  key={i}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${current.iconBgs?.[i] ?? "bg-primary/10"}`}
                >
                  <Icon className={`h-7 w-7 ${current.iconColors?.[i] ?? "text-primary"}`} />
                </div>
              ))
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold font-heading text-foreground">
            {current.title}
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {current.description}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-4">
          {/* Don't show again checkbox — only on last step */}
          {isLast && (
            <label className="flex items-center justify-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">
                Don&apos;t show this again
              </span>
            </label>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 rounded-xl"
              >
                Skip
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex-1 rounded-xl gap-1.5"
            >
              {isLast ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
