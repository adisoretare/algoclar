import type { Frame, FrameGenerator } from '../types'

export interface LcaState {
  n: number
  parent: readonly number[] // parent[root] === root
  depth: readonly number[]
  root: number
  u: number
  v: number
  pu: number // climbing pointer from u
  pv: number // climbing pointer from v
  phase: 'align' | 'climb' | 'done'
  lca: number | null
  done: boolean
}

export interface LcaInput {
  parent: number[] // parent[root] === root
  root: number
  u: number
  v: number
}

/**
 * Lowest common ancestor by the level method: first lift the deeper node until
 * both are at the same depth, then move both up together until they meet — that
 * meeting node is the LCA.
 */
export const generateLca: FrameGenerator<LcaInput, LcaState> = ({
  parent,
  root,
  u,
  v,
}) => {
  const n = parent.length
  if (n === 0) throw new Error('generateLca: arbore gol')
  if ([u, v, root].some(x => x < 0 || x >= n))
    throw new Error('generateLca: nod invalid')

  // depths
  const depth = new Array<number>(n).fill(-1)
  const computeDepth = (x: number): number => {
    if (depth[x] !== -1) return depth[x]
    depth[x] = x === root ? 0 : computeDepth(parent[x]) + 1
    return depth[x]
  }
  for (let i = 0; i < n; i++) computeDepth(i)

  const frames: Frame<LcaState>[] = []
  let pu = u
  let pv = v

  const snap = (
    phase: LcaState['phase'],
    lca: number | null,
    done: boolean,
  ): LcaState => ({
    n,
    parent: [...parent],
    depth: [...depth],
    root,
    u,
    v,
    pu,
    pv,
    phase,
    lca,
    done,
  })

  frames.push({
    state: snap('align', null, false),
    explanation: `Căutăm cel mai apropiat strămoș comun al nodurilor ${u} (adâncime ${depth[u]}) și ${v} (adâncime ${depth[v]}).`,
  })

  // Align depths
  while (depth[pu] > depth[pv]) {
    pu = parent[pu]
    frames.push({
      state: snap('align', null, false),
      explanation: `${u} e mai adânc → urcăm pointerul lui la ${pu} (adâncime ${depth[pu]}).`,
    })
  }
  while (depth[pv] > depth[pu]) {
    pv = parent[pv]
    frames.push({
      state: snap('align', null, false),
      explanation: `${v} e mai adânc → urcăm pointerul lui la ${pv} (adâncime ${depth[pv]}).`,
    })
  }

  // Climb together
  while (pu !== pv) {
    pu = parent[pu]
    pv = parent[pv]
    frames.push({
      state: snap('climb', null, false),
      explanation: `Sunt la aceeași adâncime dar diferiți → urcăm ambii: ${pu} și ${pv}.`,
    })
  }

  frames.push({
    state: snap('done', pu, true),
    explanation: `Pointerii s-au întâlnit în nodul ${pu} — acesta este LCA(${u}, ${v}).`,
  })

  return frames
}
