import Link from 'next/link'
import { BarChart2, Search, ArrowUpDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { VISUALIZER_CATALOG } from '@/lib/visualizers/catalog'

const ICONS: Record<string, LucideIcon> = {
  'array-traversal': BarChart2,
  'binary-search': Search,
  sorting: ArrowUpDown,
}

export default function VizualizariPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-heading text-4xl font-bold">Vizualizări interactive</h1>
      <p className="mt-3 text-muted-foreground">
        Rulează algoritmii pas cu pas. Încearcă cu propriile date.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {VISUALIZER_CATALOG.map(viz => {
          const Icon = ICONS[viz.slug] ?? BarChart2
          return (
            <Link
              key={viz.slug}
              href={`/vizualizari/${viz.slug}`}
              className="group flex flex-col gap-4 rounded-[16px] border border-border bg-card p-6 transition-all duration-[180ms] hover:-translate-y-[2px] hover:border-primary hover:shadow-[0_8px_24px_-8px_rgba(19,24,38,0.18)] dark:hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.50)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent transition-colors group-hover:bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {viz.title}
                </h2>
                <p className="text-sm text-muted-foreground">{viz.description}</p>
              </div>
              <span className="mt-auto font-mono text-xs text-primary">
                Vezi vizualizarea →
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
