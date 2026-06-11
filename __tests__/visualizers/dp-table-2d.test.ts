import { describe, it, expect } from 'vitest'
import { generateDpTable2D } from '@/lib/visualizers/generators/dp-table-2d'

function lcsLength(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  )
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1])
  return dp[a.length][b.length]
}

describe('generateDpTable2D', () => {
  it('throws on empty strings', () => {
    expect(() => generateDpTable2D({ a: '', b: 'x' })).toThrow()
  })

  it('computes the LCS length (classic example)', () => {
    const last = generateDpTable2D({ a: 'ABCBDAB', b: 'BDCAB' }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.result).toBe(4)
  })

  it('matches a brute LCS for several pairs', () => {
    const pairs: [string, string][] = [
      ['ABC', 'AC'],
      ['AGGTAB', 'GXTXAYB'],
      ['XYZ', 'ABC'],
      ['AAAA', 'AA'],
    ]
    for (const [a, b] of pairs) {
      const last = generateDpTable2D({ a, b }).at(-1)!.state
      expect(last.result).toBe(lcsLength(a, b))
    }
  })

  it('flags matches on equal characters', () => {
    const frames = generateDpTable2D({ a: 'AB', b: 'AB' })
    // cell (1,1): A==A -> match
    const c = frames.find(f => f.state.curR === 1 && f.state.curC === 1)!.state
    expect(c.match).toBe(true)
  })
})
