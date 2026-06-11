'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, ChevronRight, Trophy } from 'lucide-react'
import type { QuizQuestion } from '@/lib/content/types'

interface LessonQuizProps {
  questions: QuizQuestion[]
  nextLesson: { href: string; title: string } | null
}

type Phase = 'question' | 'feedback' | 'results'

const ENCOURAGEMENTS: Record<number, string> = {
  3: 'Perfect! Ai înțeles totul. Continuă tot așa!',
  2: 'Foarte bine! Ești pe drumul cel bun.',
  1: 'Bun început! Revizuiește lecția și mai încearcă.',
  0: 'Nu-ți face griji — mai citește lecția o dată și vei reuși!',
}

function getEncouragement(correct: number, total: number): string {
  if (correct === total) return ENCOURAGEMENTS[3] ?? ENCOURAGEMENTS[2]
  if (correct >= total * 0.6) return ENCOURAGEMENTS[2]
  if (correct >= 1) return ENCOURAGEMENTS[1]
  return ENCOURAGEMENTS[0]
}

export function LessonQuiz({ questions, nextLesson }: LessonQuizProps) {
  const [phase, setPhase] = useState<Phase>('question')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)

  const question = questions[currentIndex]
  if (!question) return null

  const isCorrect = selected === question.correctIndex

  function handleSelect(index: number) {
    if (phase !== 'question') return
    setSelected(index)
    if (index === question.correctIndex) setCorrectCount((c) => c + 1)
    setPhase('feedback')
  }

  function handleNext() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1)
      setSelected(null)
      setPhase('question')
    } else {
      setPhase('results')
    }
  }

  if (phase === 'results') {
    const total = questions.length
    return (
      <section
        aria-label="Rezultate quiz"
        className="mt-12 rounded-2xl border border-border bg-card p-8 text-center"
      >
        <Trophy className="mx-auto mb-4 h-10 w-10 text-yellow-500" aria-hidden />
        <p className="mb-1 font-heading text-4xl font-extrabold text-foreground">
          {correctCount}/{total}
        </p>
        <p className="mb-6 text-muted-foreground">
          {getEncouragement(correctCount, total)}
        </p>
        {nextLesson && (
          <Link
            href={nextLesson.href}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Lecția următoare
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </section>
    )
  }

  return (
    <section
      aria-label={`Întrebarea ${currentIndex + 1} din ${questions.length}`}
      className="mt-12 rounded-2xl border border-border bg-card p-8"
    >
      <p className="mb-1 font-mono text-xs text-muted-foreground">
        Întrebarea {currentIndex + 1} / {questions.length}
      </p>
      <h2 className="mb-6 font-heading text-xl font-bold text-foreground">
        {question.question}
      </h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option, i) => {
          let variant = 'default'
          if (phase === 'feedback') {
            if (i === question.correctIndex) variant = 'correct'
            else if (i === selected) variant = 'wrong'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={phase === 'feedback'}
              aria-pressed={selected === i}
              className={[
                'flex items-center gap-3 rounded-xl border px-5 py-4 text-left font-medium transition-all',
                variant === 'default' &&
                  'border-border bg-background text-foreground hover:border-primary hover:bg-primary/5',
                variant === 'correct' &&
                  'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
                variant === 'wrong' &&
                  'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {phase === 'feedback' && variant === 'correct' && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" aria-hidden />
              )}
              {phase === 'feedback' && variant === 'wrong' && (
                <XCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden />
              )}
              {phase === 'question' && (
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-muted-foreground"
                  aria-hidden
                >
                  {String.fromCharCode(65 + i)}
                </span>
              )}
              {option}
            </button>
          )
        })}
      </div>

      {phase === 'feedback' && (
        <div
          role="alert"
          className={[
            'mt-6 rounded-xl border px-5 py-4',
            isCorrect
              ? 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-300'
              : 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300',
          ].join(' ')}
        >
          <p className="mb-1 font-semibold">
            {isCorrect ? '✓ Corect!' : '✗ Răspuns greșit'}
          </p>
          <p className="text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {phase === 'feedback' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {currentIndex + 1 < questions.length ? 'Întrebarea următoare' : 'Vezi rezultatul'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  )
}
