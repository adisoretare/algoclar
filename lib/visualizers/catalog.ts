export const VISUALIZER_CATALOG = [
  {
    slug: 'array-traversal',
    title: 'Parcurgerea vectorilor',
    description: 'Calculează maximum și suma unui vector, pas cu pas.',
  },
  {
    slug: 'binary-search',
    title: 'Căutare binară',
    description: 'Caută un element în O(log n) prin înjumătățirea intervalului.',
  },
  {
    slug: 'sorting',
    title: 'Algoritmi de sortare',
    description: 'Bubble sort și selection sort animate, comparație cu swap vizibil.',
  },
] as const

export type VisualizerSlug = (typeof VISUALIZER_CATALOG)[number]['slug']
