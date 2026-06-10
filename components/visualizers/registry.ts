import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, ComponentType<any>> = {
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
  // Romanian alias used in MDX lessons
  'cautare-binara': dynamic(
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
  // Romanian alias used in MDX lessons
  'bubble-sort': dynamic(
    () =>
      import('./SortingVisualizer').then(m => ({
        default: m.SortingVisualizer,
      })),
    { ssr: false },
  ),
}

export function getVisualizer(name: string): ComponentType<unknown> | null {
  return registry[name] ?? null
}
