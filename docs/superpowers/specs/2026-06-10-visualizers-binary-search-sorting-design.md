# Design: BinarySearchVisualizer + SortingVisualizer + Hero + /vizualizari

**Date:** 2026-06-10  
**Status:** Approved

---

## Context

AlgoClar has one working visualizer (`array-traversal`) built on a step-engine:
- `useStepPlayer<T>` — generic frame-navigation hook (play/pause/seek/speed)
- `VisualizerShell` — container with keyboard controls, explanation, PlayerControls
- Frame generators — pure functions: `input → Frame<State>[]`
- Registry — maps slug strings to components (dynamic imports, ssr:false)

This spec adds two new visualizers using the same engine, a live hero preview, and a full `/vizualizari` section.

---

## 1. `useStepPlayer` — loop option

Add `loop?: boolean` to the hook input. When `loop=true` and the interval fires at the last frame, wrap to index 0 instead of stopping.

```ts
// lib/visualizers/useStepPlayer.ts
export function useStepPlayer<T>(frames: Frame<T>[], opts?: { loop?: boolean })
```

Change in interval callback:
```ts
if (next >= total - 1) {
  if (opts?.loop) return 0
  setIsPlaying(false)
  return Math.min(next, total - 1)
}
```

---

## 2. `VisualizerShell` — ambient prop

Add `ambient?: boolean`. When true:
- Remove `tabIndex`, `onKeyDown`
- Remove `role="region"`, `aria-label`
- Hide header (title + "pas X")
- Hide explanation box
- Hide `PlayerControls`
- Render only the canvas `children`

Used for embedding in the homepage hero — purely decorative, no interaction.

```tsx
interface VisualizerShellProps<T> {
  // ...existing...
  ambient?: boolean
}
```

---

## 3. Generator: `binary-search.ts`

**File:** `lib/visualizers/generators/binary-search.ts`

### Input
```ts
interface BinarySearchInput {
  array: number[]   // must be sorted ascending
  target: number
}
```

### State
```ts
interface BinarySearchState {
  array: readonly number[]
  target: number
  st: number
  dr: number
  mid: number
  eliminated: readonly boolean[]  // eliminated[i] = true when i < st || i > dr
  found: boolean
  notFound: boolean
  foundIndex: number | null
}
```

### Frame sequence

1. **Initial frame** — st=0, dr=n-1, mid=⌊(0+n-1)/2⌋, no cells eliminated, found/notFound=false  
   Explanation: `"Inițializăm: st=0, dr={n-1}, mid={mid}. Căutăm {target}."`

2. **Comparison loop** — while st ≤ dr:
   - Compute mid = ⌊(st+dr)/2⌋
   - If v[mid] === target → found frame:  
     `"mid={mid}, v[{mid}]={v[mid]} = {target}. Găsit la indexul {mid}!"`
   - If v[mid] < target → st = mid+1, update eliminated, continue:  
     `"mid={mid}, v[{mid}]={v[mid]} < {target}, deci căutăm în dreapta: st devine {mid+1}."`
   - If v[mid] > target → dr = mid-1, update eliminated, continue:  
     `"mid={mid}, v[{mid}]={v[mid]} > {target}, deci căutăm în stânga: dr devine {mid-1}."`

3. **Not found frame** — when st > dr:  
   `"st={st} > dr={dr}. Elementul {target} nu există în vector."`

The initial frame does NOT show a comparison — it just establishes the starting state. Each subsequent frame shows the comparison that happened and its decision.

---

## 4. Generator: `sorting.ts`

**File:** `lib/visualizers/generators/sorting.ts`

### Input
```ts
interface SortingInput {
  array: number[]
  algorithm: 'bubble' | 'selection'
}
```

### State
```ts
interface SortingState {
  array: readonly number[]
  comparing: readonly [number, number] | null
  swapping: boolean   // true on the frame where a swap occurs
  sorted: readonly number[]   // indices locked in final position
  pass: number
  done: boolean
}
```

### Bubble sort frames

For each pass i from 0 to n-2:
- For each j from 0 to n-2-i:
  - Frame: comparing=[j, j+1], swapping=(array[j]>array[j+1])
    - If swapping: explanation `"Pasul {i+1}, poz. {j}: v[{j}]={array[j]} > v[{j+1}]={array[j+1]}. Swap."`  
      Perform swap in working array.
    - Else: explanation `"Pasul {i+1}, poz. {j}: v[{j}]={array[j]} ≤ v[{j+1}]={array[j+1]}. Fără swap."`
- After each pass: mark index n-1-i as sorted.

Final frame: all sorted, done=true, explanation `"Vectorul este sortat!"`

### Selection sort frames

For each i from 0 to n-2:
- minIdx = i
- For each j from i+1 to n-1:
  - Frame: comparing=[minIdx, j]
    - If array[j] < array[minIdx]: minIdx = j
    - Explanation `"Pasul {i+1}: compar v[{minIdx}]={array[minIdx]} cu v[{j}]={array[j]}."`
- Swap array[i] and array[minIdx] (one frame with swapping=true)
  - Explanation `"Minimul rundei este {array[minIdx]}, mutat la poziția {i}."`
- Mark index i as sorted.

Final frame: all sorted, done=true.

---

## 5. `BinarySearchVisualizer`

**File:** `components/visualizers/BinarySearchVisualizer.tsx`

### Props
```ts
interface BinarySearchVisualizerProps {
  ambient?: boolean
}
```

### Behavior
- Default array: `[2, 5, 8, 12, 16, 23, 38, 45]` (sorted)
- Default target: `23`
- State: `target` (controlled number input), `inputValue` (string for the input field)
- `frames = useMemo(() => generateBinarySearch({ array: DEFAULT_ARRAY, target }), [target])`
- When target changes → `player.reset()` via `useEffect`
- `player = useStepPlayer(frames, { loop: ambient })`
- On mount when `ambient=true`: `useEffect(() => { player.play() }, [])` (empty deps — fire once)

### Render (non-ambient)
```
[Input: "Caută numărul: ___]
VisualizerShell(title, player, frameCount)
  → row of cells with st/mid/dr labels + eliminated styling
```

### Cell styles
- Normal (in range, not mid): `border-border bg-muted text-foreground`
- Mid (current comparison): `border-primary bg-primary text-primary-foreground scale-110`
- Found (foundIndex): `border-success bg-success/10 text-success`
- Eliminated (outside [st,dr]): `opacity-30 border-border bg-muted text-muted-foreground`

### Marker row (below cells)
Show `st` / `mid` / `dr` labels under respective indices using `font-mono text-[10px]`. Multiple markers can share a cell (e.g. st=mid when range is 1 element) — stack them.

### Render (ambient)
Pass `ambient` to VisualizerShell — shell renders only the canvas, no controls. No input shown.

---

## 6. `SortingVisualizer`

**File:** `components/visualizers/SortingVisualizer.tsx`

### Props
None (self-contained).

### State
- `algorithm: 'bubble' | 'selection'` (default: `'bubble'`)
- `array: number[]` (default: `[6, 3, 8, 1, 9, 2, 7, 4]`)

### Behavior
- `frames = useMemo(() => generateSorting({ array, algorithm }), [array, algorithm])`
- When frames change → `player.reset()`
- "Amestecă": Fisher-Yates shuffle → `setArray(shuffled)` → frames recompute

### Renderer
- Container: `flex items-end gap-1 h-40`
- Each bar: `flex-1 rounded-t-[4px] transition-colors duration-200`
  - Height: `style={{ height: '${(val / max) * 100}%' }}`
  - `comparing` pair but not swapping: `bg-warning` (yellow)
  - `comparing` pair + `swapping`: `bg-destructive` (red/orange)
  - `sorted` index: `bg-success` (green)
  - Default: `bg-primary`
- Index label below each bar (optional, shown only if n ≤ 8)

### Controls (above VisualizerShell)
```
[Dropdown: Bubble Sort | Selection Sort]  [Amestecă button]
```

---

## 7. Hero homepage

**File:** `app/page.tsx`

Replace:
```tsx
import { BinarySearchPreview } from '@/components/home/BinarySearchPreview'
// ...
<BinarySearchPreview />
```

With:
```tsx
import dynamic from 'next/dynamic'
const BinarySearchVisualizer = dynamic(
  () => import('@/components/visualizers/BinarySearchVisualizer').then(m => ({ default: m.BinarySearchVisualizer })),
  { ssr: false }
)
// ...
<BinarySearchVisualizer ambient />
```

Delete `components/home/BinarySearchPreview.tsx`.

---

## 8. `/vizualizari` page + slug pages

### Metadata (colocated in `app/vizualizari/page.tsx`)
```ts
const VISUALIZERS = [
  {
    slug: 'array-traversal',
    title: 'Parcurgerea vectorilor',
    description: 'Calculează maximum și suma unui vector, pas cu pas.',
    icon: BarChart2,
  },
  {
    slug: 'binary-search',
    title: 'Căutare binară',
    description: 'Caută un element în O(log n) prin înjumătățirea intervalului.',
    icon: Search,
  },
  {
    slug: 'sorting',
    title: 'Algoritmi de sortare',
    description: 'Bubble sort și selection sort animate, comparație cu swap vizibil.',
    icon: ArrowUpDown,
  },
]
```

### `app/vizualizari/page.tsx`
Server component. Grid 3 columns (responsive). Each card: icon + title + description + "Vezi vizualizarea →" link to `/vizualizari/[slug]`.

### `app/vizualizari/[slug]/page.tsx`
- `generateStaticParams` returns slugs from VISUALIZERS
- Looks up component from registry
- Renders in a `<main>` with title + back link

---

## 9. Registry update

`components/visualizers/registry.ts` — add:
```ts
'binary-search': dynamic(() => import('./BinarySearchVisualizer').then(m => ({ default: m.BinarySearchVisualizer })), { ssr: false }),
'sorting': dynamic(() => import('./SortingVisualizer').then(m => ({ default: m.SortingVisualizer })), { ssr: false }),
```

---

## Files changed

| File | Action |
|------|--------|
| `lib/visualizers/useStepPlayer.ts` | modify — add `loop` option |
| `lib/visualizers/generators/binary-search.ts` | create |
| `lib/visualizers/generators/sorting.ts` | create |
| `components/visualizers/VisualizerShell.tsx` | modify — add `ambient` prop |
| `components/visualizers/BinarySearchVisualizer.tsx` | create |
| `components/visualizers/SortingVisualizer.tsx` | create |
| `components/visualizers/registry.ts` | modify — register 2 new |
| `components/home/BinarySearchPreview.tsx` | delete |
| `app/page.tsx` | modify — replace static preview |
| `app/vizualizari/page.tsx` | rewrite — grid of cards |
| `app/vizualizari/[slug]/page.tsx` | create |
