import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getVisualizer } from '@/components/visualizers/registry'
import { VISUALIZER_CATALOG } from '@/lib/visualizers/catalog'

export function generateStaticParams() {
  return VISUALIZER_CATALOG.map(v => ({ slug: v.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const viz = VISUALIZER_CATALOG.find(v => v.slug === slug)
  return {
    title: viz ? `${viz.title} — AlgoClar` : 'Vizualizare — AlgoClar',
  }
}

export default async function VisualizarePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const viz = VISUALIZER_CATALOG.find(v => v.slug === slug)
  const Viz = getVisualizer(slug)

  if (!viz || !Viz) notFound()

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/vizualizari"
        className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Înapoi la vizualizări
      </Link>
      <h1 className="mt-6 font-heading text-2xl font-bold">{viz.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{viz.description}</p>
      <div className="mt-8">
        <Viz />
      </div>
    </main>
  )
}
