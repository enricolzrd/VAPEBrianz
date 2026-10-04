import Link from 'next/link'
import { Database, History, ShoppingCart, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { label: 'POS / Cashier', href: '/', icon: ShoppingCart },
  { label: 'Master Data', href: '/master-data', icon: Database },
  { label: 'Transaction History', href: '/transactions', icon: History },
]

export function Sidebar({ activeHref = '/' }: { activeHref?: string }) {
  return (
    <aside className="z-30 border-b border-border bg-card md:sticky md:top-0 md:flex md:h-dvh md:w-16 md:shrink-0 md:flex-col md:border-b-0 md:border-r xl:w-60">
      <div className="hidden h-[73px] items-center gap-2.5 border-b border-border px-4 md:flex md:justify-center xl:justify-start">
        <div
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground"
        >
          VB
        </div>
        <div className="hidden leading-tight xl:block">
          <p className="text-base font-semibold tracking-tight">VapeBrianz</p>
          <p className="text-xs text-muted-foreground">Point of Sale</p>
        </div>
      </div>

      <nav aria-label="Main navigation" className="md:flex-1 md:py-4">
        <p className="mb-2 hidden px-5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground xl:block">
          Menu
        </p>
        <ul className="flex gap-1 overflow-x-auto px-3 py-2 md:flex-col md:overflow-visible md:px-3 md:py-0">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === activeHref
            const Icon = item.icon
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  title={item.label}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:justify-center md:px-0 md:py-2.5 xl:justify-start xl:px-3',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 -left-3 hidden w-1 rounded-r-full bg-primary md:block"
                    />
                  )}
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap md:sr-only xl:not-sr-only">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="hidden border-t border-border p-3 md:block">
        <div className="flex items-center gap-3 rounded-lg px-1 py-1.5 md:justify-center xl:justify-start xl:px-2">
          <div
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold"
          >
            BR
          </div>
          <div className="hidden min-w-0 leading-tight xl:block">
            <p className="truncate text-sm font-medium">Brian</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Shift open
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
