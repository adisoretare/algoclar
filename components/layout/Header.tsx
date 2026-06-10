import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { href: '/invata', label: 'Învață' },
  { href: '/vizualizari', label: 'Vizualizări' },
  { href: '/arhiva', label: 'Arhivă' },
  { href: '/premium', label: 'Premium' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          AlgoClar
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  )
}
