"use client"

import { HeroUIProvider } from "@heroui/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ExpenseProvider } from "@/contexts/expense-context"
import { AuthProvider } from "@/contexts/auth-context"
import { PremiumProvider } from "@/contexts/premium-context"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange={false}>
      <HeroUIProvider>
        <AuthProvider>
          <PremiumProvider>
            <ExpenseProvider>
              <OfflineIndicator />
              {children}
            </ExpenseProvider>
          </PremiumProvider>
        </AuthProvider>
      </HeroUIProvider>
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  )
}
