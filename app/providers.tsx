"use client"

import { HeroUIProvider } from "@heroui/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ExpenseProvider } from "@/contexts/expense-context"
import { AuthProvider } from "@/contexts/auth-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
      <HeroUIProvider>
        <AuthProvider>
          <ExpenseProvider>{children}</ExpenseProvider>
        </AuthProvider>
      </HeroUIProvider>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}
