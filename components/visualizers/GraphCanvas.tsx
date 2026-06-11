'use client'

export type GraphTone =
  | 'idle'
  | 'muted'
  | 'active'
  | 'frontier'
  | 'visited'
  | 'path'
  | 'source'
  | 'done'

export interface GCNode {
  id: number
  x: number
  y: number
  label: string
  sub?: string // small text under the label (e.g. distance, in/out time)
  tone: GraphTone
}

export interface GCEdge {
  from: number
  to: number
  weight?: number | string
  directed?: boolean
  tone: GraphTone
}

interface GraphCanvasProps {
  nodes: GCNode[]
  edges: GCEdge[]
  size?: number
  nodeRadius?: number
}

// hsl() strings reference design tokens, never hardcoded colors.
const STROKE: Record<GraphTone, string> = {
  idle: 'hsl(var(--border))',
  muted: 'hsl(var(--border))',
  active: 'hsl(var(--primary))',
  frontier: 'hsl(var(--warning))',
  visited: 'hsl(var(--primary) / 0.55)',
  path: 'hsl(var(--success))',
  source: 'hsl(var(--primary))',
  done: 'hsl(var(--success))',
}

const FILL: Record<GraphTone, string> = {
  idle: 'hsl(var(--muted))',
  muted: 'hsl(var(--muted) / 0.5)',
  active: 'hsl(var(--accent))',
  frontier: 'hsl(var(--warning) / 0.15)',
  visited: 'hsl(var(--primary) / 0.12)',
  path: 'hsl(var(--success) / 0.15)',
  source: 'hsl(var(--accent))',
  done: 'hsl(var(--success) / 0.15)',
}

const TEXT: Record<GraphTone, string> = {
  idle: 'hsl(var(--foreground))',
  muted: 'hsl(var(--muted-foreground))',
  active: 'hsl(var(--primary))',
  frontier: 'hsl(var(--warning))',
  visited: 'hsl(var(--foreground))',
  path: 'hsl(var(--success))',
  source: 'hsl(var(--primary))',
  done: 'hsl(var(--success))',
}

export function GraphCanvas({
  nodes,
  edges,
  size = 340,
  nodeRadius = 18,
}: GraphCanvasProps) {
  const byId = new Map(nodes.map(n => [n.id, n]))

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-[340px] w-[340px] max-w-full"
      role="img"
      aria-label="Graf"
    >
      {/* edges first so nodes sit on top */}
      {edges.map((e, i) => {
        const a = byId.get(e.from)
        const b = byId.get(e.to)
        if (!a || !b) return null
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.hypot(dx, dy) || 1
        const ux = dx / len
        const uy = dy / len
        // endpoints trimmed to node borders
        const x1 = a.x + ux * nodeRadius
        const y1 = a.y + uy * nodeRadius
        const x2 = b.x - ux * nodeRadius
        const y2 = b.y - uy * nodeRadius
        const stroke = STROKE[e.tone]
        const emphasized = e.tone === 'active' || e.tone === 'path'
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={emphasized ? 3 : 1.75}
            />
            {e.directed && (
              <polygon
                points={`0,-4 8,0 0,4`}
                fill={stroke}
                transform={`translate(${x2},${y2}) rotate(${(Math.atan2(uy, ux) * 180) / Math.PI})`}
              />
            )}
            {e.weight !== undefined && (
              <g>
                <rect
                  x={mx - 11}
                  y={my - 9}
                  width={22}
                  height={18}
                  rx={4}
                  fill="hsl(var(--card))"
                  stroke={stroke}
                  strokeWidth={1}
                />
                <text
                  x={mx}
                  y={my + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill={TEXT[e.tone]}
                  className="font-mono"
                >
                  {e.weight}
                </text>
              </g>
            )}
          </g>
        )
      })}

      {/* nodes */}
      {nodes.map(n => (
        <g key={n.id}>
          <circle
            cx={n.x}
            cy={n.y}
            r={nodeRadius}
            fill={FILL[n.tone]}
            stroke={STROKE[n.tone]}
            strokeWidth={n.tone === 'active' || n.tone === 'source' ? 3 : 2}
          />
          <text
            x={n.x}
            y={n.sub ? n.y - 1 : n.y + 4}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={TEXT[n.tone]}
            className="font-mono"
          >
            {n.label}
          </text>
          {n.sub && (
            <text
              x={n.x}
              y={n.y + 11}
              textAnchor="middle"
              fontSize={9}
              fill={TEXT[n.tone]}
              className="font-mono"
            >
              {n.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
