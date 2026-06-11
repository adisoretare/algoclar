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
  {
    slug: 'graph-bfs',
    title: 'BFS pe graf',
    description: 'Parcurgere în lățime: unda se extinde inel cu inel din sursă.',
  },
  {
    slug: 'graph-dfs',
    title: 'DFS pe graf',
    description: 'Parcurgere în adâncime, cu timpii de intrare/ieșire tin/tout.',
  },
  {
    slug: 'connected-components',
    title: 'Componente conexe',
    description: 'Grupuri de noduri legate între ele, găsite prin parcurgeri repetate.',
  },
  {
    slug: 'scc-kosaraju',
    title: 'Componente tare conexe (Kosaraju)',
    description: 'Două parcurgeri DFS — pe graf și pe transpus — separă CTC-urile.',
  },
  {
    slug: 'topological-sort',
    title: 'Sortare topologică',
    description: 'Algoritmul lui Kahn: scoate pe rând nodurile fără dependențe.',
  },
  {
    slug: 'dijkstra',
    title: 'Dijkstra',
    description: 'Drumuri minime cu coadă de priorități, pe ponderi nenegative.',
  },
  {
    slug: 'bellman-ford',
    title: 'Bellman-Ford',
    description: 'Drumuri minime cu costuri negative, relaxând toate muchiile de n-1 ori.',
  },
  {
    slug: 'floyd-warshall',
    title: 'Floyd-Warshall (Roy-Floyd)',
    description: 'Drumuri minime între toate perechile, cu noduri intermediare.',
  },
  {
    slug: 'mst-kruskal',
    title: 'Kruskal (MST)',
    description: 'Arbore parțial de cost minim alegând muchii sortate, fără cicluri.',
  },
  {
    slug: 'mst-prim',
    title: 'Prim (MST)',
    description: 'MST crescut dintr-un singur arbore, adăugând cea mai ieftină muchie.',
  },
  {
    slug: 'dsu',
    title: 'Union-Find (DSU)',
    description: 'Mulțimi disjuncte cu uniune după rang și compresie de drum.',
  },
  {
    slug: 'lca',
    title: 'LCA',
    description: 'Cel mai apropiat strămoș comun, prin aliniere de adâncime și urcare.',
  },
  {
    slug: 'fenwick-tree',
    title: 'Fenwick Tree (BIT)',
    description: 'Sume de prefix și actualizări punctuale în O(log n), cu i & -i.',
  },
  {
    slug: 'segment-tree',
    title: 'Segment Tree',
    description: 'Interogări și actualizări pe interval în O(log n), pe un arbore binar.',
  },
  {
    slug: 'rmq',
    title: 'RMQ (Sparse Table)',
    description: 'Minim pe interval în O(1) cu blocuri de lungime putere a lui 2.',
  },
  {
    slug: 'sqrt-decomposition',
    title: 'Square Root Decomposition',
    description: 'Interogări pe interval în O(√n) cu blocuri precalculate.',
  },
  {
    slug: 'bitmask-dp',
    title: 'DP pe biți (bitmask)',
    description: 'Comis-voiajor (TSP) cu stări codificate ca măști de biți.',
  },
  {
    slug: 'matrix-expo',
    title: 'Exponențierea matricelor',
    description: 'Mᵖ în O(log p) prin ridicare la pătrat — Fibonacci cu matrice.',
  },
] as const

export type VisualizerSlug = (typeof VISUALIZER_CATALOG)[number]['slug']
