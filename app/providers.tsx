"use client"

import { HeroUIProvider } from "@heroui/react"
import { ThemeProvider } from "@/components/theme-provider"
import { ExpenseProvider } from "@/contexts/expense-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      <HeroUIProvider>
        <ExpenseProvider>{children}</ExpenseProvider>
      </HeroUIProvider>
    </ThemeProvider>
  )
}
