import { cn } from '@/lib/utils'

type PointerTone = 'primary' | 'success' | 'warning' | 'destructive' | 'muted'

interface Pointer {
  index: number
  label: string
  tone: PointerTone
}

interface ArrayDiagramProps {
  /** continutul celulelor, separat prin spatii: "5 3 8 1 9" */
  values: string
  /** eticheta la stanga randului de valori (ex. "v", "frec") */
  valueLabel?: string
  /** eticheta la stanga randului de index */
  indexLabel?: string
  /**
   * randul de index: implicit pozitiile 0..n-1.
   * `"off"` => ascuns. Altfel un sir propriu de etichete: "0 1 2 3 4".
   */
  index?: string
  /** indici evidentiati (accent primary), separati prin spatii: "2" sau "1 4" */
  highlight?: string
  /** interval contiguu evidentiat, ex. "1-3" (inclusiv, ton success) */
  range?: string
  /** indici estompati (context secundar): "0 4" */
  dim?: string
  /**
   * sageti etichetate sub celule: "index:label[:ton]" separate prin spatii.
   * ex. "2:i 4:max:warning". Tonuri: primary|success|warning|destructive|muted.
   */
  pointers?: string
  /** legenda scurta sub diagrama */
  caption?: string
  className?: string
}

const POINTER_TEXT: Record<PointerTone, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  muted: 'text-muted-foreground',
}

const TONES: PointerTone[] = ['primary', 'success', 'warning', 'destructive', 'muted']

export function parseList(s?: string): string[] {
  if (!s) return []
  return s.split(/[\s,]+/).filter(Boolean)
}

export function parseIndices(s?: string): number[] {
  return parseList(s)
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n))
}

export function parseRange(s?: string): [number, number] | undefined {
  if (!s) return undefined
  const m = s.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/)
  if (!m) return undefined
  return [Number(m[1]), Number(m[2])]
}

export function parsePointers(s?: string): Pointer[] {
  return parseList(s)
    .map((tok) => {
      const [idx, label, tone] = tok.split(':')
      const index = Number(idx)
      if (!idx || !Number.isInteger(index) || !label) return null
      const t = (tone as PointerTone) || 'primary'
      return { index, label, tone: TONES.includes(t) ? t : 'primary' }
    })
    .filter((p): p is Pointer => p !== null)
}

function inRange(i: number, range?: [number, number]) {
  return range ? i >= range[0] && i <= range[1] : false
}

/**
 * Ilustratie statica de vector — celule stilizate cu design tokens.
 * Acopera: vectori, cautare, secvente, doi pointeri, frecventa, cifre, schimburi.
 * Server component (fara interactivitate; pentru asta exista <Visualizer>).
 *
 * Toate prop-urile sunt string-uri (pipeline-ul MDX paseaza doar string-uri).
 */
export function ArrayDiagram({
  values,
  valueLabel,
  indexLabel,
  index,
  highlight,
  range,
  dim,
  pointers,
  caption,
  className,
}: ArrayDiagramProps) {
  const cells = parseList(values)
  const highlightSet = new Set(parseIndices(highlight))
  const dimSet = new Set(parseIndices(dim))
  const rangePair = parseRange(range)
  const pointerList = parsePointers(pointers)

  const showIndexRow = index !== 'off'
  const customLabels = index && index !== 'off' ? parseList(index) : null
  const indexValues = customLabels ?? cells.map((_, i) => String(i))

  const hasRowLabels = Boolean(valueLabel || indexLabel)
  const pointerByIndex = new Map(pointerList.map((p) => [p.index, p]))

  return (
    <figure className={cn('my-7 flex flex-col items-center gap-3', className)}>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-x-1.5 border-spacing-y-1">
          <tbody>
            {/* rand valori */}
            <tr>
              {hasRowLabels && (
                <td className="pr-2 text-right align-middle font-mono text-xs font-semibold text-muted-foreground">
                  {valueLabel}
                </td>
              )}
              {cells.map((v, i) => {
                const isHi = highlightSet.has(i)
                const isRange = inRange(i, rangePair)
                const isDim = dimSet.has(i)
                return (
                  <td key={i} className="p-0">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold tabular-nums',
                        'border-border bg-card text-foreground',
                        isRange &&
                          'border-success bg-success/15 text-success-foreground',
                        isHi &&
                          'border-primary bg-accent text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]',
                        isDim && 'opacity-45',
                      )}
                    >
                      {v}
                    </div>
                  </td>
                )
              })}
            </tr>

            {/* rand index */}
            {showIndexRow && (
              <tr>
                {hasRowLabels && (
                  <td className="pr-2 text-right align-middle font-mono text-[11px] text-muted-foreground/70">
                    {indexLabel}
                  </td>
                )}
                {indexValues.map((idx, i) => (
                  <td key={i} className="p-0">
                    <div
                      className={cn(
                        'flex h-5 items-center justify-center font-mono text-[11px] tabular-nums',
                        highlightSet.has(i)
                          ? 'font-semibold text-primary'
                          : 'text-muted-foreground/70',
                      )}
                    >
                      {idx}
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* rand pointeri */}
            {pointerList.length > 0 && (
              <tr>
                {hasRowLabels && <td />}
                {cells.map((_, i) => {
                  const p = pointerByIndex.get(i)
                  return (
                    <td key={i} className="p-0 align-top">
                      {p && (
                        <div
                          className={cn(
                            'flex flex-col items-center font-mono text-[11px] font-semibold leading-tight',
                            POINTER_TEXT[p.tone],
                          )}
                        >
                          <span aria-hidden>▲</span>
                          <span>{p.label}</span>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {caption && (
        <figcaption className="text-center text-[13px] leading-snug text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
