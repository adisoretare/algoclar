import { describe, it, expect } from 'vitest'
import { generateBitmaskDp } from '@/lib/visualizers/generators/bitmask-dp'

function bruteTsp(dist: number[][]): number {
  const n = dist.length
  const cities = Array.from({ length: n - 1 }, (_, i) => i + 1)
  let best = Infinity
  const perm = (arr: number[]): number[][] =>
    arr.length <= 1
      ? [arr]
      : arr.flatMap((x, i) =>
          perm([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]),
        )
  for (const order of perm(cities)) {
    let cost = dist[0][order[0]]
    for (let i = 0; i + 1 < order.length; i++) cost += dist[order[i]][order[i + 1]]
    cost += dist[order[order.length - 1]][0]
    best = Math.min(best, cost)
  }
  return best
}

describe('generateBitmaskDp', () => {
  it('throws on too few or too many cities', () => {
    expect(() => generateBitmaskDp({ dist: [[0]] })).toThrow()
  })

  it('matches brute-force TSP', () => {
    const dist = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0],
    ]
    const last = generateBitmaskDp({ dist }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.result).toBe(bruteTsp(dist)) // 80
  })

  it('handles an asymmetric matrix', () => {
    const dist = [
      [0, 5, 9],
      [4, 0, 8],
      [7, 3, 0],
    ]
    const last = generateBitmaskDp({ dist }).at(-1)!.state
    expect(last.result).toBe(bruteTsp(dist))
  })
})
