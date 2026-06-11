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

  // Val A — tehnici pe vectori
  frequency: dynamic(
    () =>
      import('./FrequencyVisualizer').then(m => ({
        default: m.FrequencyVisualizer,
      })),
    { ssr: false },
  ),
  frecventa: dynamic(
    () =>
      import('./FrequencyVisualizer').then(m => ({
        default: m.FrequencyVisualizer,
      })),
    { ssr: false },
  ),
  'counting-sort': dynamic(
    () =>
      import('./CountingSortVisualizer').then(m => ({
        default: m.CountingSortVisualizer,
      })),
    { ssr: false },
  ),
  'sortare-numarare': dynamic(
    () =>
      import('./CountingSortVisualizer').then(m => ({
        default: m.CountingSortVisualizer,
      })),
    { ssr: false },
  ),
  'prefix-sums': dynamic(
    () =>
      import('./PrefixSumsVisualizer').then(m => ({
        default: m.PrefixSumsVisualizer,
      })),
    { ssr: false },
  ),
  'sume-partiale': dynamic(
    () =>
      import('./PrefixSumsVisualizer').then(m => ({
        default: m.PrefixSumsVisualizer,
      })),
    { ssr: false },
  ),
  'prefix-sums-2d': dynamic(
    () =>
      import('./PrefixSums2DVisualizer').then(m => ({
        default: m.PrefixSums2DVisualizer,
      })),
    { ssr: false },
  ),
  'sume-partiale-2d': dynamic(
    () =>
      import('./PrefixSums2DVisualizer').then(m => ({
        default: m.PrefixSums2DVisualizer,
      })),
    { ssr: false },
  ),
  'two-pointers': dynamic(
    () =>
      import('./TwoPointersVisualizer').then(m => ({
        default: m.TwoPointersVisualizer,
      })),
    { ssr: false },
  ),
  'doi-pointeri': dynamic(
    () =>
      import('./TwoPointersVisualizer').then(m => ({
        default: m.TwoPointersVisualizer,
      })),
    { ssr: false },
  ),
  'sliding-window': dynamic(
    () =>
      import('./SlidingWindowVisualizer').then(m => ({
        default: m.SlidingWindowVisualizer,
      })),
    { ssr: false },
  ),
  'fereastra-glisanta': dynamic(
    () =>
      import('./SlidingWindowVisualizer').then(m => ({
        default: m.SlidingWindowVisualizer,
      })),
    { ssr: false },
  ),
  'difference-array': dynamic(
    () =>
      import('./DifferenceArrayVisualizer').then(m => ({
        default: m.DifferenceArrayVisualizer,
      })),
    { ssr: false },
  ),
  'vector-diferenta': dynamic(
    () =>
      import('./DifferenceArrayVisualizer').then(m => ({
        default: m.DifferenceArrayVisualizer,
      })),
    { ssr: false },
  ),
}

export function getVisualizer(name: string): ComponentType<unknown> | null {
  return registry[name] ?? null
}
