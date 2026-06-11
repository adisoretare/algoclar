import type { Frame, FrameGenerator } from '../types'

export interface MapEntry {
  k: number
  v: number
}

export interface SetMapState {
  set: readonly number[] // ordered set, kept sorted, unique
  map: readonly MapEntry[]
  phase: 'set' | 'map' | 'query-set' | 'query-map' | 'done'
  setHighlight: number | null // index in set
  mapHighlight: number | null // index in map
  inserting: number | null
  queryArg: number | null
  queryResult: string | null
  found: boolean | null
  done: boolean
}

export interface SetMapInput {
  setValues: number[]
  contains: number
  pairs: MapEntry[]
  getKey: number
}

/**
 * Two ordered associative structures side by side:
 *  - an ordered SET (unique values kept sorted on insert)
 *  - a MAP (key -> value dictionary)
 * then a contains() on the set and a get() on the map.
 */
export const generateSetMap: FrameGenerator<SetMapInput, SetMapState> = ({
  setValues,
  contains,
  pairs,
  getKey,
}) => {
  if (setValues.length === 0) {
    throw new Error('generateSetMap: mulțimea nu poate fi goală')
  }

  const frames: Frame<SetMapState>[] = []
  const set: number[] = []
  const map: MapEntry[] = []

  const snap = (over: Partial<SetMapState>): SetMapState => ({
    set: [...set],
    map: map.map(e => ({ ...e })),
    phase: 'set',
    setHighlight: null,
    mapHighlight: null,
    inserting: null,
    queryArg: null,
    queryResult: null,
    found: null,
    done: false,
    ...over,
  })

  // Phase 1 — build the ordered set
  for (const v of setValues) {
    let pos = 0
    while (pos < set.length && set[pos] < v) pos++
    if (set[pos] === v) {
      frames.push({
        state: snap({ phase: 'set', inserting: v, setHighlight: pos }),
        explanation: `${v} există deja în mulțime — o mulțime nu păstrează duplicate, deci ignorăm.`,
      })
      continue
    }
    set.splice(pos, 0, v)
    frames.push({
      state: snap({ phase: 'set', inserting: v, setHighlight: pos }),
      explanation: `Inserăm ${v} pe poziția ${pos}, ca mulțimea să rămână ordonată crescător.`,
    })
  }

  // Phase 2 — build the map
  for (const { k, v } of pairs) {
    const existing = map.findIndex(e => e.k === k)
    if (existing >= 0) {
      map[existing] = { k, v }
      frames.push({
        state: snap({ phase: 'map', inserting: k, mapHighlight: existing }),
        explanation: `Cheia ${k} există deja — actualizăm valoarea la ${v}. Într-un map, o cheie are o singură valoare.`,
      })
    } else {
      map.push({ k, v })
      frames.push({
        state: snap({ phase: 'map', inserting: k, mapHighlight: map.length - 1 }),
        explanation: `Adăugăm perechea ${k} → ${v} în dicționar.`,
      })
    }
  }

  // Phase 3 — contains() on the set
  let foundSet = false
  for (let i = 0; i < set.length; i++) {
    if (set[i] === contains) {
      foundSet = true
      frames.push({
        state: snap({
          phase: 'query-set',
          setHighlight: i,
          queryArg: contains,
          queryResult: 'da',
          found: true,
        }),
        explanation: `contains(${contains}): găsit pe poziția ${i}. Răspuns: DA.`,
      })
      break
    }
    if (set[i] > contains) break
    frames.push({
      state: snap({
        phase: 'query-set',
        setHighlight: i,
        queryArg: contains,
      }),
      explanation: `contains(${contains}): comparăm cu ${set[i]}… mergem mai departe.`,
    })
  }
  if (!foundSet) {
    frames.push({
      state: snap({
        phase: 'query-set',
        setHighlight: null,
        queryArg: contains,
        queryResult: 'nu',
        found: false,
      }),
      explanation: `contains(${contains}): nu există în mulțime. Răspuns: NU.`,
    })
  }

  // Phase 4 — get() on the map
  const entry = map.find(e => e.k === getKey)
  const gi = map.findIndex(e => e.k === getKey)
  frames.push({
    state: snap({
      phase: 'query-map',
      mapHighlight: gi >= 0 ? gi : null,
      queryArg: getKey,
      queryResult: entry ? String(entry.v) : 'lipsește',
      found: !!entry,
    }),
    explanation: entry
      ? `get(${getKey}) → ${entry.v}. Map-ul ne dă valoarea direct, după cheie.`
      : `get(${getKey}): cheia nu există în dicționar.`,
  })

  frames.push({
    state: snap({ phase: 'done', done: true }),
    explanation: `Mulțimea ține chei unice ordonate; dicționarul (map) leagă fiecare cheie de o valoare. Ambele răspund rapid la „există?” / „ce valoare are?”.`,
  })

  return frames
}
