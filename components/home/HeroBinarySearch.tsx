'use client'

import dynamic from 'next/dynamic'

const BinarySearchVisualizer = dynamic<{ ambient?: boolean }>(
  () =>
    import('@/components/visualizers/BinarySearchVisualizer').then(m => ({
      default: m.BinarySearchVisualizer,
    })),
  { ssr: false },
)

export function HeroBinarySearch() {
  return <BinarySearchVisualizer ambient />
}
