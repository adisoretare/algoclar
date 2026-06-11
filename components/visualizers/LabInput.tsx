'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface LabField {
  id: string
  label: string
  placeholder: string
  validate: (raw: string) => string | null
  defaultValue?: string
  hint?: string
}

interface LabInputProps {
  fields: LabField[]
  onSubmit: (values: Record<string, string>) => void
}

export function parseIntegers(raw: string): number[] | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s+/)
  const nums = parts.map(p => parseInt(p, 10))
  if (nums.some(n => isNaN(n))) return null
  return nums
}

export function LabInput({ fields, onSubmit }: LabInputProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.id, f.defaultValue ?? ''])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    for (const field of fields) {
      const err = field.validate(values[field.id] ?? '')
      if (err) newErrors[field.id] = err
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {fields.map(field => (
        <div key={field.id} className="flex flex-col gap-1">
          <label
            htmlFor={`lab-${field.id}`}
            className="font-mono text-xs text-muted-foreground"
          >
            {field.label}
          </label>
          <input
            id={`lab-${field.id}`}
            value={values[field.id] ?? ''}
            onChange={e =>
              setValues(v => ({ ...v, [field.id]: e.target.value }))
            }
            placeholder={field.placeholder}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              'rounded-[8px] border bg-background px-3 py-2 font-mono text-sm text-foreground outline-none transition-colors',
              'placeholder:text-muted-foreground/60',
              'focus:ring-1',
              errors[field.id]
                ? 'border-destructive focus:border-destructive focus:ring-destructive'
                : 'border-border focus:border-primary focus:ring-primary',
            )}
          />
          {errors[field.id] ? (
            <span role="alert" className="font-mono text-xs text-destructive">
              {errors[field.id]}
            </span>
          ) : field.hint ? (
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {field.hint}
            </span>
          ) : null}
        </div>
      ))}
      <button
        type="submit"
        className="self-start rounded-[8px] bg-primary px-4 py-2 font-mono text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-95"
      >
        Rulează pe datele mele
      </button>
    </form>
  )
}
