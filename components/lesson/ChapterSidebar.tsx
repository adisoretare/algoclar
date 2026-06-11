'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, PanelLeft, CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChapterLesson {
  slug: string
  title: string
  gradeId: string
  chapter: string
}

interface ChapterSidebarProps {
  gradeLabel: string
  chapterTitle: string
  chapterOrder: number
  lessons: ChapterLesson[]
  currentSlug: string
}

export function ChapterSidebar({
  gradeLabel,
  chapterTitle,
  chapterOrder,
  lessons,
  currentSlug,
}: ChapterSidebarProps) {
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) setOpen(false)
    }
    update(mq)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const currentIndex = lessons.findIndex((l) => l.slug === currentSlug)

  return (
    <>
      {/* Mobile FAB — shown when drawer is closed */}
      {isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Deschide meniu capitol"
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}

      {/* Mobile scrim */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        aria-label="Lecții capitol"
        className={cn(
          'z-50 flex-shrink-0 border-r border-border bg-card transition-all duration-[260ms]',
          isMobile
            ? cn(
                'fixed inset-y-0 left-0 w-[300px] shadow-2xl',
                open ? 'translate-x-0' : '-translate-x-full',
              )
            : cn(
                'sticky top-16 h-[calc(100vh-64px)] overflow-hidden',
                open ? 'w-[288px]' : 'w-0',
              ),
        )}
      >
        {/* Inner container — fixed width prevents content from squishing during transition */}
        <div className="flex h-full w-[288px] flex-col overflow-y-auto">
          {/* Sidebar header — sticky within the scrollable panel */}
          <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  {gradeLabel} · Cap. {chapterOrder}
                </span>
                <p className="font-heading text-[15px] font-semibold leading-snug text-foreground">
                  {chapterTitle}
                </p>
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.max(0, currentIndex)}/{lessons.length} lecții
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={isMobile ? 'Închide meniu' : 'Pliează sidebar'}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isMobile ? (
                  <X className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Lesson list */}
          <nav className="flex flex-col p-2">
            {lessons.map((lesson, idx) => {
              const isActive = lesson.slug === currentSlug
              const isDone = idx < currentIndex
              const isCurrent = idx === currentIndex

              return (
                <Link
                  key={lesson.slug}
                  href={`/invata/${lesson.gradeId}/${lesson.chapter}/${lesson.slug}`}
                  onClick={() => isMobile && setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="h-[18px] w-[18px] flex-shrink-0 text-green-500" />
                  ) : isCurrent ? (
                    <div className="relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">
                      <Circle className="h-[18px] w-[18px] text-primary" />
                      <div className="absolute h-2 w-2 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <Circle className="h-[18px] w-[18px] flex-shrink-0 text-border" />
                  )}
                  <span
                    className={cn(
                      'flex-1 leading-snug',
                      isActive && 'font-medium',
                    )}
                  >
                    {lesson.title}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/50">
                    {idx + 1}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Desktop expand button — shown when sidebar is collapsed */}
      {!isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Extinde sidebar"
          className="sticky top-16 flex h-9 w-8 flex-shrink-0 items-center justify-center rounded-r-[8px] border-y border-r border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <PanelLeft className="h-4 w-4 rotate-180" />
        </button>
      )}
    </>
  )
}
