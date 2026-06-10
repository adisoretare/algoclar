'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, ComponentType<any>> = {
  'array-traversal': dynamic(
    () =>
      import('./ArrayVisualizer').then(m => ({ default: m.ArrayVisualizer })),
    { ssr: false },
  ),
  'binary-search': dynamic(
    () =>
      import('./BinarySearchVisualizer').then(m => ({
        default: m.BinarySearchVisualizer,
      })),
    { ssr: false },
  ),
  sorting: dynamic(
    () =>
      import('./SortingVisualizer').then(m => ({
        default: m.SortingVisualizer,
      })),
    { ssr: false },
  ),
}

export function VisualizerRenderer({ slug }: { slug: string }) {
  const Viz = REGISTRY[slug]
  if (!Viz) return null
  return <Viz />
}
