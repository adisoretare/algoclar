import React from 'react'
import { getHighlighter } from '@/lib/highlighter'
import { CopyButton } from './CopyButton'

const SUPPORTED = [
  'cpp', 'c', 'python', 'javascript', 'typescript', 'bash', 'text',
]

interface CodeBlockProps {
  language?: string
  code: string
}

export async function CodeBlock({ language = 'cpp', code }: CodeBlockProps) {
  const trimmed = code.trim()
  const highlighter = await getHighlighter()
  const lang = SUPPORTED.includes(language) ? language : 'text'
  const html = highlighter.codeToHtml(trimmed, {
    lang,
    theme: 'github-dark',
  })

  return (
    <div className="group relative my-5 overflow-hidden rounded-[14px]">
      <div
        className="overflow-x-auto text-[13.5px] leading-[1.6] [&>pre]:p-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={trimmed} />
    </div>
  )
}

// MdxPre is used as the `pre` component override for MDX fenced code blocks.
// It extracts the code string and language from the standard <code> child
// that MDX generates, then delegates to CodeBlock for highlighting.
export async function MdxPre({
  children,
  ...rest
}: React.HTMLAttributes<HTMLPreElement>) {
  // MDX renders: <pre {...rest}><code className="language-cpp">...code...</code></pre>
  const codeEl = React.Children.only(children) as React.ReactElement<{
    className?: string
    children?: string
  }>

  const rawCode =
    typeof codeEl?.props?.children === 'string'
      ? codeEl.props.children
      : ''

  const className = codeEl?.props?.className ?? ''
  const language = className.replace('language-', '') || 'text'

  return <CodeBlock language={language} code={rawCode} />
}
