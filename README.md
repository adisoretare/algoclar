# AlgoClar

Platformă educațională de algoritmică pentru elevi români (clasele V–XII).
**"Înțelegi algoritmica, nu o memorezi."**

## Setup local

**Cerințe:** Node.js 20+, pnpm 9+

```bash
pnpm install
pnpm dev
```

Deschide [http://localhost:3000](http://localhost:3000).

Design system: [http://localhost:3000/dev/components](http://localhost:3000/dev/components)

## Comenzi

| Comandă | Descriere |
|---|---|
| `pnpm dev` | Server dev (Turbopack) |
| `pnpm build` | Build producție |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm tsc --noEmit` | Type check |

## Variabile de mediu

Copiază `.env.example` → `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Stack

Next.js 16 · TypeScript strict · Tailwind v4 · shadcn/ui · next-themes ·
Supabase Auth · Stripe · Vercel

## Structură

- `app/` — route-uri App Router
- `components/layout/` — Header, Footer, ThemeToggle
- `components/lesson/` — LessonCard, HintBox, ObservationBox, MistakeBox
- `components/problem/` — ProblemCard
- `components/shared/` — DifficultyBadge, TopicBadge
- `content/` — MDX lecții și probleme (viitor)
- `lib/` — utilitare
