'use client'

import { getVisualizer } from './registry'

export function VisualizerRenderer({ slug }: { slug: string }) {
  // getVisualizer returns a stable module-level dynamic() component, not one
  // created during render — the lint rule misfires on the registry lookup.
  // eslint-disable-next-line react-hooks/static-components
  const Viz = getVisualizer(slug)
  if (!Viz) return null
  return <Viz />
}
