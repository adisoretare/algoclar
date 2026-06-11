'use client'

// getVisualizer returns a stable module-level dynamic() component, not one
// created during render — the react-hooks/static-components rule misfires on the
// registry lookup, so it is disabled for this thin wrapper.
/* eslint-disable react-hooks/static-components */
import { getVisualizer } from './registry'

export function VisualizerRenderer({ slug }: { slug: string }) {
  const Viz = getVisualizer(slug)
  if (!Viz) return null
  return <Viz />
}
