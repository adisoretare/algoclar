import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Play, Archive, TrendingUp, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeroBinarySearch } from '@/components/home/HeroBinarySearch'
import { ProblemCard } from '@/components/problem/ProblemCard'

export const metadata: Metadata = {
  title: 'AlgoClar — Înțelegi algoritmica, nu o memorezi',
  description:
    'Platformă educațională de algoritmică pentru elevi români din clasele V–XI. Lecții scurte, vizualizări interactive și arhivă OJI/ONI 2021–2026 explicată pas cu pas.',
  keywords: [
    'algoritmica',
    'OJI',
    'ONI',
    'informatică',
    'programare',
    'elevi',
    'gimnaziu',
    'liceu',
    'căutare binară',
    'programare dinamică',
  ],
  openGraph: {
    title: 'AlgoClar — Înțelegi algoritmica, nu o memorezi',
    description:
      'Lecții scurte, vizualizări interactive, arhivă OJI/ONI explicată.',
    type: 'website',
    locale: 'ro_RO',
  },
}

const HOW_CARDS: Array<{
  icon: LucideIcon
  iconColor: string
  title: string
  description: string
}> = [
  {
    icon: BookOpen,
    iconColor: 'text-primary',
    title: 'Lecții scurte',
    description: 'Maxim 15 minute per concept, fără teorie inutilă.',
  },
  {
    icon: Play,
    iconColor: 'text-secondary',
    title: 'Vizualizări interactive',
    description: 'Rulezi algoritmul pas cu pas, nu îl citești.',
  },
  {
    icon: Archive,
    iconColor: 'text-warning',
    title: 'Arhivă OJI/ONI',
    description: 'Probleme din 2021–2026 explicate cu abordare completă.',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-success',
    title: 'Progres personal',
    description: 'Urmărești ce ai rezolvat, ce ai de reluat.',
  },
]

const GRADES: Array<{
  grade: number
  roman: string
  level: 'Gimnaziu' | 'Liceu'
  ariaLabel: string
}> = [
  { grade: 5, roman: 'V', level: 'Gimnaziu', ariaLabel: 'Clasa a V-a' },
  { grade: 6, roman: 'VI', level: 'Gimnaziu', ariaLabel: 'Clasa a VI-a' },
  { grade: 7, roman: 'VII', level: 'Gimnaziu', ariaLabel: 'Clasa a VII-a' },
  { grade: 8, roman: 'VIII', level: 'Gimnaziu', ariaLabel: 'Clasa a VIII-a' },
  { grade: 9, roman: 'IX', level: 'Liceu', ariaLabel: 'Clasa a IX-a' },
  { grade: 10, roman: 'X', level: 'Liceu', ariaLabel: 'Clasa a X-a' },
  { grade: 11, roman: 'XI', level: 'Liceu', ariaLabel: 'Clasa a XI-a' },
]

const ARCHIVE_PLACEHOLDERS: Array<{
  stage: 'OJI' | 'ONI'
  year: number
  grade: number
  title: string
  topics: string[]
  status: 'explicata' | 'linkuita' | 'in-lucru'
}> = [
  {
    stage: 'OJI',
    year: 2024,
    grade: 9,
    title: 'Subsecvență de sumă maximă',
    topics: ['DP'],
    status: 'explicata',
  },
  {
    stage: 'ONI',
    year: 2023,
    grade: 10,
    title: 'Arbore cu costuri minime',
    topics: ['Grafuri', 'Arbori'],
    status: 'linkuita',
  },
  {
    stage: 'OJI',
    year: 2022,
    grade: 11,
    title: 'Șir de caractere',
    topics: ['Strings', 'Hashing'],
    status: 'in-lucru',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:py-28">
        <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* Left: text + CTA */}
          <div className="flex flex-col gap-6 lg:flex-1">
            <span className="w-fit rounded-full bg-accent px-4 py-1.5 font-mono text-xs text-accent-foreground">
              Clasele V–XI · OJI/ONI 2021–2026
            </span>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.08] tracking-tight lg:text-5xl xl:text-6xl">
              Înțelegi algoritmica,{' '}
              <span className="text-primary">nu o memorezi.</span>
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Lecții scurte, vizualizări interactive și arhivă OJI/ONI
              explicată pentru clasele V–XI.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/invata"
                className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Începe să înveți →
              </Link>
              <Link
                href="/arhiva"
                className="inline-flex items-center gap-2 rounded-[10px] border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Arhivă OJI/ONI
              </Link>
            </div>
          </div>
          {/* Right: live binary search demo */}
          <div className="w-full lg:flex-1">
            <HeroBinarySearch />
          </div>
        </div>
      </section>

      {/* ── Cum înveți ─────────────────────────────────────────── */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold">
              Cum înveți pe AlgoClar
            </h2>
            <p className="mt-3 text-muted-foreground">
              Fiecare concept explicat de la zero, pas cu pas.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex flex-col gap-4 rounded-[16px] border border-border bg-card p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent">
                  <card.icon className={cn('h-5 w-5', card.iconColor)} />
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  {card.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alege clasa ────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold">Alege clasa ta</h2>
            <p className="mt-3 text-muted-foreground">
              Curriculum adaptat pe clasă, de la noțiuni de bază până la baraj
              ONI.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {GRADES.map(({ grade, roman, level, ariaLabel }) => (
              <Link
                key={grade}
                href={`/invata/${grade}`}
                aria-label={ariaLabel}
                className="flex flex-col gap-2 rounded-[16px] border border-border bg-card p-5 transition-all duration-[180ms] hover:-translate-y-[2px] hover:border-primary hover:shadow-[0_8px_24px_-8px_rgba(19,24,38,0.18)] dark:hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.50)]"
              >
                <span className="font-heading text-2xl font-bold text-foreground">
                  {roman}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  {level}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Arhivă OJI/ONI ─────────────────────────────────────── */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold">
              Arhivă OJI/ONI 2021–2026
            </h2>
            <p className="mt-3 text-muted-foreground">
              Probleme explicate cu abordare, soluție comentată și link la
              sursă oficială.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHIVE_PLACEHOLDERS.map((p) => (
              <ProblemCard
                key={`${p.stage}-${p.year}-${p.grade}`}
                href={`/arhiva/${p.stage.toLowerCase()}-${p.year}-${p.grade}`}
                stage={p.stage}
                year={p.year}
                grade={p.grade}
                title={p.title}
                topics={p.topics}
                status={p.status}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/arhiva"
              className="inline-flex items-center gap-2 rounded-[10px] border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Vezi toată arhiva OJI/ONI →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Premium ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[24px] bg-accent px-8 py-16 text-center">
            <span className="inline-block rounded-full bg-primary px-4 py-1.5 font-mono text-xs font-semibold text-primary-foreground">
              Premium
            </span>
            <h2 className="mt-5 font-heading text-3xl font-bold">
              Deblochează tot conținutul
            </h2>
            <p className="mt-3 text-foreground">
              Vizualizări avansate, arhivă completă și progres detaliat.
            </p>
            <ul className="mx-auto mt-8 flex max-w-sm flex-col gap-3 text-left">
              {[
                'Toate vizualizările interactive',
                'Arhivă OJI/ONI completă cu explicații',
                'Statistici și progres personal',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col items-center gap-3">
              <span className="rounded-full bg-muted px-4 py-1.5 font-mono text-xs text-muted-foreground">
                Curând disponibil
              </span>
              <button
                disabled
                className="cursor-not-allowed pointer-events-none rounded-[10px] bg-primary px-8 py-3 font-semibold text-primary-foreground opacity-50"
              >
                Notifică-mă
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
