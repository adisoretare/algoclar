import React from 'react'
import { getHighlighter } from '@/lib/highlighter'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  language?: string
  children?: React.ReactNode
}

export async function CodeBlock({
  language = 'cpp',
  children,
}: CodeBlockProps) {
  const raw =
    typeof children === 'string'
      ? children
      : Array.isArray(children) && typeof children[0] === 'string'
        ? children[0]
        : ''
  const code = raw.trim()
  const highlighter = await getHighlighter()
  const SUPPORTED = ['cpp', 'c', 'python', 'javascript', 'typescript', 'bash', 'text']
  const lang = SUPPORTED.includes(language) ? language : 'text'
  const html = highlighter.codeToHtml(code, {
    lang,
    theme: 'github-dark',
  })

  return (
    <div className="group relative my-5 overflow-hidden rounded-[14px]">
      <div
        className="overflow-x-auto text-[13.5px] leading-[1.6] [&>pre]:p-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={code} />
    </div>
  )
}
