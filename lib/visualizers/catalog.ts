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
  {
    slug: 'frequency',
    title: 'Vector de frecvență',
    description: 'Numără aparițiile fiecărei valori într-o singură trecere.',
  },
  {
    slug: 'counting-sort',
    title: 'Sortare prin numărare',
    description: 'Sortează fără comparații: numără, apoi reconstruiește în O(n + max).',
  },
  {
    slug: 'prefix-sums',
    title: 'Sume parțiale',
    description: 'Construiește prefixele și răspunde la suma pe orice interval în O(1).',
  },
  {
    slug: 'prefix-sums-2d',
    title: 'Sume parțiale 2D',
    description: 'Suma pe orice dreptunghi dintr-o matrice prin incluziune-excluziune.',
  },
  {
    slug: 'two-pointers',
    title: 'Doi pointeri',
    description: 'Caută o pereche cu sumă dată într-un vector sortat, în O(n).',
  },
  {
    slug: 'sliding-window',
    title: 'Fereastră glisantă',
    description: 'Suma maximă a unei ferestre de lungime k, recalculată în O(1) la fiecare pas.',
  },
  {
    slug: 'difference-array',
    title: 'Vector de diferențe',
    description: 'Aplică update-uri pe intervale în O(1), apoi reconstruiește vectorul.',
  },
  {
    slug: 'kadane',
    title: 'Secvența de sumă maximă (Kadane)',
    description: 'Găsește subsecvența cu suma cea mai mare în O(n): extinde sau repornește.',
  },
] as const

export type VisualizerSlug = (typeof VISUALIZER_CATALOG)[number]['slug']
