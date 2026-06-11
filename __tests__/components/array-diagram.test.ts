import { describe, it, expect } from 'vitest'
import {
  parseList,
  parseIndices,
  parseRange,
  parsePointers,
} from '@/components/lesson/ArrayDiagram'

describe('parseList', () => {
  it('splits on spaces and commas, drops empties', () => {
    expect(parseList('5 3 8 1 9')).toEqual(['5', '3', '8', '1', '9'])
    expect(parseList('1, 2,  3')).toEqual(['1', '2', '3'])
  })
  it('returns [] for undefined/empty', () => {
    expect(parseList()).toEqual([])
    expect(parseList('')).toEqual([])
  })
})

describe('parseIndices', () => {
  it('parses integer indices', () => {
    expect(parseIndices('0 2 4')).toEqual([0, 2, 4])
  })
  it('ignores non-integers', () => {
    expect(parseIndices('1 x 3.5 4')).toEqual([1, 4])
  })
})

describe('parseRange', () => {
  it('parses "1-3" to inclusive pair', () => {
    expect(parseRange('1-3')).toEqual([1, 3])
    expect(parseRange(' 0 - 4 ')).toEqual([0, 4])
  })
  it('returns undefined for invalid input', () => {
    expect(parseRange('1')).toBeUndefined()
    expect(parseRange(undefined)).toBeUndefined()
    expect(parseRange('a-b')).toBeUndefined()
  })
})

describe('parsePointers', () => {
  it('parses index:label with default tone primary', () => {
    expect(parsePointers('2:i')).toEqual([{ index: 2, label: 'i', tone: 'primary' }])
  })
  it('parses optional tone and falls back on unknown tone', () => {
    expect(parsePointers('4:max:warning')).toEqual([
      { index: 4, label: 'max', tone: 'warning' },
    ])
    expect(parsePointers('1:st:bogus')).toEqual([
      { index: 1, label: 'st', tone: 'primary' },
    ])
  })
  it('parses multiple and skips malformed tokens', () => {
    expect(parsePointers('0:st 4:dr nope :x 3:')).toEqual([
      { index: 0, label: 'st', tone: 'primary' },
      { index: 4, label: 'dr', tone: 'primary' },
    ])
  })
})
