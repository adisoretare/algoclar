'use client'

import { getVisualizer } from './registry'

export function VisualizerRenderer({ slug }: { slug: string }) {
  const Viz = getVisualizer(slug)
  if (!Viz) return null
  return <Viz />
}
