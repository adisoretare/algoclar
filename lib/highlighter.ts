import { createHighlighter, type Highlighter } from 'shiki'

let _highlighter: Highlighter | null = null

export async function getHighlighter(): Promise<Highlighter> {
  if (_highlighter) return _highlighter
  _highlighter = await createHighlighter({
    themes: ['github-dark'],
    langs: ['cpp', 'c', 'python', 'javascript', 'typescript', 'bash', 'text'],
  })
  return _highlighter
}
