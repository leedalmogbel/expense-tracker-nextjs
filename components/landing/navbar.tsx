"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <Image src="/assets/doshmate-logo.png" alt="Dosh Mate" width={36} height={36} className="object-contain" />
          </div>
          <span className="text-lg font-bold font-heading text-foreground tracking-tight">Dosh Mate</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link href="#features" className="rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50">
            Features
          </Link>
          <Link href="#how-it-works" className="rounded-lg px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50">
            How it Works
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
          >
            Log in
          </Link>
          <Link
            href="/login?tab=signup"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
          >
            Get Started
          </Link>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted/50 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-6 py-5 md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="#features"
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
              onClick={() => setMobileOpen(false)}
            >
              How it Works
            </Link>
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                Log in
              </Link>
              <Link
                href="/login?tab=signup"
                className="rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
