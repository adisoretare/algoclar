import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dyn = ComponentType<any>

// Lazy client-only loader. The import() stays a literal at each call site so the
// bundler can statically split each visualizer into its own chunk.
function lazy(
  loader: () => Promise<Record<string, Dyn>>,
  name: string,
): Dyn {
  return dynamic(() => loader().then(m => ({ default: m[name] })), { ssr: false })
}

const registry: Record<string, Dyn> = {
  // Base
  'array-traversal': lazy(() => import('./ArrayVisualizer'), 'ArrayVisualizer'),
  // Clasa 5 — variante de parcurgere
  'max-min-scan': lazy(() => import('./MaxMinVisualizer'), 'MaxMinVisualizer'),
  'doua-maxime': lazy(() => import('./DouaMaximeVisualizer'), 'DouaMaximeVisualizer'),
  'streaming-stats': lazy(() => import('./StreamingStatsVisualizer'), 'StreamingStatsVisualizer'),
  'acces-vector': lazy(() => import('./AccesVectorVisualizer'), 'AccesVectorVisualizer'),
  'binary-search': lazy(() => import('./BinarySearchVisualizer'), 'BinarySearchVisualizer'),
  'cautare-binara': lazy(() => import('./BinarySearchVisualizer'), 'BinarySearchVisualizer'),
  sorting: lazy(() => import('./SortingVisualizer'), 'SortingVisualizer'),
  'bubble-sort': lazy(() => import('./SortingVisualizer'), 'SortingVisualizer'),

  // Val A — tehnici pe vectori
  frequency: lazy(() => import('./FrequencyVisualizer'), 'FrequencyVisualizer'),
  frecventa: lazy(() => import('./FrequencyVisualizer'), 'FrequencyVisualizer'),
  'counting-sort': lazy(() => import('./CountingSortVisualizer'), 'CountingSortVisualizer'),
  'sortare-numarare': lazy(() => import('./CountingSortVisualizer'), 'CountingSortVisualizer'),
  'prefix-sums': lazy(() => import('./PrefixSumsVisualizer'), 'PrefixSumsVisualizer'),
  'sume-partiale': lazy(() => import('./PrefixSumsVisualizer'), 'PrefixSumsVisualizer'),
  'prefix-sums-2d': lazy(() => import('./PrefixSums2DVisualizer'), 'PrefixSums2DVisualizer'),
  'sume-partiale-2d': lazy(() => import('./PrefixSums2DVisualizer'), 'PrefixSums2DVisualizer'),
  'two-pointers': lazy(() => import('./TwoPointersVisualizer'), 'TwoPointersVisualizer'),
  'doi-pointeri': lazy(() => import('./TwoPointersVisualizer'), 'TwoPointersVisualizer'),
  'sliding-window': lazy(() => import('./SlidingWindowVisualizer'), 'SlidingWindowVisualizer'),
  'fereastra-glisanta': lazy(() => import('./SlidingWindowVisualizer'), 'SlidingWindowVisualizer'),
  'difference-array': lazy(() => import('./DifferenceArrayVisualizer'), 'DifferenceArrayVisualizer'),
  'vector-diferenta': lazy(() => import('./DifferenceArrayVisualizer'), 'DifferenceArrayVisualizer'),
  kadane: lazy(() => import('./KadaneVisualizer'), 'KadaneVisualizer'),
  'secventa-suma-maxima': lazy(() => import('./KadaneVisualizer'), 'KadaneVisualizer'),

  // Val B — structuri + algoritmi clasici
  stack: lazy(() => import('./StackVisualizer'), 'StackVisualizer'),
  stiva: lazy(() => import('./StackVisualizer'), 'StackVisualizer'),
  queue: lazy(() => import('./QueueVisualizer'), 'QueueVisualizer'),
  coada: lazy(() => import('./QueueVisualizer'), 'QueueVisualizer'),
  deque: lazy(() => import('./DequeVisualizer'), 'DequeVisualizer'),
  'linked-list': lazy(() => import('./LinkedListVisualizer'), 'LinkedListVisualizer'),
  'lista-inlantuita': lazy(() => import('./LinkedListVisualizer'), 'LinkedListVisualizer'),
  'set-map': lazy(() => import('./SetMapVisualizer'), 'SetMapVisualizer'),
  'multime-dictionar': lazy(() => import('./SetMapVisualizer'), 'SetMapVisualizer'),
  heap: lazy(() => import('./HeapVisualizer'), 'HeapVisualizer'),
  'priority-queue': lazy(() => import('./HeapVisualizer'), 'HeapVisualizer'),
  recursion: lazy(() => import('./RecursionVisualizer'), 'RecursionVisualizer'),
  recursivitate: lazy(() => import('./RecursionVisualizer'), 'RecursionVisualizer'),
  backtracking: lazy(() => import('./BacktrackingVisualizer'), 'BacktrackingVisualizer'),
  'divide-et-impera': lazy(() => import('./DivideEtImperaVisualizer'), 'DivideEtImperaVisualizer'),
  'dp-table-1d': lazy(() => import('./DpTable1DVisualizer'), 'DpTable1DVisualizer'),
  'dp-1d': lazy(() => import('./DpTable1DVisualizer'), 'DpTable1DVisualizer'),
  'dp-table-2d': lazy(() => import('./DpTable2DVisualizer'), 'DpTable2DVisualizer'),
  'dp-2d': lazy(() => import('./DpTable2DVisualizer'), 'DpTable2DVisualizer'),
  knapsack: lazy(() => import('./KnapsackVisualizer'), 'KnapsackVisualizer'),
  rucsac: lazy(() => import('./KnapsackVisualizer'), 'KnapsackVisualizer'),
  'lee-fill': lazy(() => import('./LeeFillVisualizer'), 'LeeFillVisualizer'),
  'algoritmul-lee': lazy(() => import('./LeeFillVisualizer'), 'LeeFillVisualizer'),
  'big-numbers': lazy(() => import('./BigNumbersVisualizer'), 'BigNumbersVisualizer'),
  'numere-mari': lazy(() => import('./BigNumbersVisualizer'), 'BigNumbersVisualizer'),
  'geometry-basics': lazy(() => import('./GeometryVisualizer'), 'GeometryVisualizer'),
  geometrie: lazy(() => import('./GeometryVisualizer'), 'GeometryVisualizer'),

  // Val C — grafuri + performanță
  'graph-bfs': lazy(() => import('./GraphBfsVisualizer'), 'GraphBfsVisualizer'),
  bfs: lazy(() => import('./GraphBfsVisualizer'), 'GraphBfsVisualizer'),
  'graph-dfs': lazy(() => import('./GraphDfsVisualizer'), 'GraphDfsVisualizer'),
  dfs: lazy(() => import('./GraphDfsVisualizer'), 'GraphDfsVisualizer'),
  'connected-components': lazy(() => import('./ConnectedComponentsVisualizer'), 'ConnectedComponentsVisualizer'),
  'componente-conexe': lazy(() => import('./ConnectedComponentsVisualizer'), 'ConnectedComponentsVisualizer'),
  'scc-kosaraju': lazy(() => import('./SccKosarajuVisualizer'), 'SccKosarajuVisualizer'),
  'componente-tare-conexe': lazy(() => import('./SccKosarajuVisualizer'), 'SccKosarajuVisualizer'),
  kosaraju: lazy(() => import('./SccKosarajuVisualizer'), 'SccKosarajuVisualizer'),
  'topological-sort': lazy(() => import('./TopologicalSortVisualizer'), 'TopologicalSortVisualizer'),
  'sortare-topologica': lazy(() => import('./TopologicalSortVisualizer'), 'TopologicalSortVisualizer'),
  dijkstra: lazy(() => import('./DijkstraVisualizer'), 'DijkstraVisualizer'),
  'bellman-ford': lazy(() => import('./BellmanFordVisualizer'), 'BellmanFordVisualizer'),
  'floyd-warshall': lazy(() => import('./FloydWarshallVisualizer'), 'FloydWarshallVisualizer'),
  'roy-floyd': lazy(() => import('./FloydWarshallVisualizer'), 'FloydWarshallVisualizer'),
  'mst-kruskal': lazy(() => import('./MstKruskalVisualizer'), 'MstKruskalVisualizer'),
  kruskal: lazy(() => import('./MstKruskalVisualizer'), 'MstKruskalVisualizer'),
  'mst-prim': lazy(() => import('./MstPrimVisualizer'), 'MstPrimVisualizer'),
  prim: lazy(() => import('./MstPrimVisualizer'), 'MstPrimVisualizer'),
  dsu: lazy(() => import('./DsuVisualizer'), 'DsuVisualizer'),
  'union-find': lazy(() => import('./DsuVisualizer'), 'DsuVisualizer'),
  lca: lazy(() => import('./LcaVisualizer'), 'LcaVisualizer'),
  'fenwick-tree': lazy(() => import('./FenwickVisualizer'), 'FenwickVisualizer'),
  fenwick: lazy(() => import('./FenwickVisualizer'), 'FenwickVisualizer'),
  aib: lazy(() => import('./FenwickVisualizer'), 'FenwickVisualizer'),
  'segment-tree': lazy(() => import('./SegmentTreeVisualizer'), 'SegmentTreeVisualizer'),
  rmq: lazy(() => import('./RmqVisualizer'), 'RmqVisualizer'),
  'sqrt-decomposition': lazy(() => import('./SqrtDecompositionVisualizer'), 'SqrtDecompositionVisualizer'),
  'sqrt-decomp': lazy(() => import('./SqrtDecompositionVisualizer'), 'SqrtDecompositionVisualizer'),
  'bitmask-dp': lazy(() => import('./BitmaskDpVisualizer'), 'BitmaskDpVisualizer'),
  'dp-bitmask': lazy(() => import('./BitmaskDpVisualizer'), 'BitmaskDpVisualizer'),
  'matrix-expo': lazy(() => import('./MatrixExpoVisualizer'), 'MatrixExpoVisualizer'),
  'exponentiere-matrice': lazy(() => import('./MatrixExpoVisualizer'), 'MatrixExpoVisualizer'),
}

export function getVisualizer(name: string): ComponentType<unknown> | null {
  return registry[name] ?? null
}
