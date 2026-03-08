import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/50 dark:bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <Image src="/assets/doshmate-logo.png" alt="Dosh Mate" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-base font-bold font-heading text-foreground tracking-tight">Dosh Mate</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="transition-colors hover:text-foreground">
              How it Works
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms
            </Link>
          </div>

          <p className="text-xs text-muted-foreground/70" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Dosh Mate
          </p>
        </div>
      </div>
    </footer>
  )
}
