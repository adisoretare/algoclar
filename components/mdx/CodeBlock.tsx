import { getHighlighter } from '@/lib/highlighter'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  language?: string
  children: string
}

export async function CodeBlock({
  language = 'cpp',
  children,
}: CodeBlockProps) {
  const code = children.trim()
  const highlighter = await getHighlighter()
  const html = highlighter.codeToHtml(code, {
    lang: language,
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
