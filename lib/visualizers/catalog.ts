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
  {
    slug: 'stack',
    title: 'Stivă (stack)',
    description: 'LIFO: ce intră ultimul iese primul. Push și pop doar la vârf.',
  },
  {
    slug: 'queue',
    title: 'Coadă (queue)',
    description: 'FIFO: ce intră primul iese primul. Adaugi la spate, scoți din față.',
  },
  {
    slug: 'deque',
    title: 'Deque',
    description: 'Coadă cu două capete: adăugări și scoateri și în față, și în spate.',
  },
  {
    slug: 'linked-list',
    title: 'Listă înlănțuită',
    description: 'Noduri legate prin pointeri: inserare și ștergere doar prin relegare.',
  },
  {
    slug: 'set-map',
    title: 'Mulțime & dicționar',
    description: 'Mulțime ordonată cu valori unice și map cheie → valoare.',
  },
  {
    slug: 'heap',
    title: 'Heap / coadă de priorități',
    description: 'Minimul mereu în rădăcină, cu sift-up și sift-down în O(log n).',
  },
  {
    slug: 'recursion',
    title: 'Recursivitate',
    description: 'Stiva de apeluri pentru factorial: coborâm, atingem baza, ne întoarcem.',
  },
  {
    slug: 'backtracking',
    title: 'Backtracking',
    description: 'Arbore de decizie pentru submulțimi, cu tăierea ramurilor fără speranță.',
  },
  {
    slug: 'divide-et-impera',
    title: 'Divide et Impera',
    description: 'Merge sort: împarte în jumătăți, sortează, apoi interclasează.',
  },
  {
    slug: 'dp-table-1d',
    title: 'Tabel DP 1D',
    description: 'Fibonacci de jos în sus: fiecare stare calculată o singură dată.',
  },
  {
    slug: 'dp-table-2d',
    title: 'Tabel DP 2D',
    description: 'Cea mai lungă subsecvență comună (LCS) completată celulă cu celulă.',
  },
  {
    slug: 'knapsack',
    title: 'Rucsac 0/1',
    description: 'Tabel DP: fiecare obiect e fie luat, fie lăsat, pentru valoare maximă.',
  },
  {
    slug: 'lee-fill',
    title: 'Algoritmul lui Lee',
    description: 'BFS pe matrice: unda se extinde inel cu inel și află cel mai scurt drum.',
  },
  {
    slug: 'big-numbers',
    title: 'Numere mari',
    description: 'Adunare cifră cu cifră, cu transport — pentru numere de orice lungime.',
  },
  {
    slug: 'geometry-basics',
    title: 'Geometrie de bază',
    description: 'Distanța dintre două puncte și aria unui triunghi în plan.',
  },
] as const

export type VisualizerSlug = (typeof VISUALIZER_CATALOG)[number]['slug']
